/* stick all the options here so we can keep track of them */
let settings = {
	'protectDuplicates': true,
	'moveOlder': true
};

/* list of tab IDs that should be protected from removal */
let blessedTabs = new Set();

const TAB_QUERY_OPTIONS = {
	currentWindow: true,
	windowType: "normal"
};

let replaceTab = (replacedTab, replacementTab, discardedTabs) => {
	if (settings.moveOlder) {
		browser.tabs.move(replacementTab.id, { index: replacedTab.index });
	}
	
	/* don't focus backgrounded tabs */
	if (replacedTab.active) {
		browser.tabs.update(replacementTab.id, { active: replacedTab.active });
	}
	
	browser.notifications.create({
		"type": "basic",
		"title": "Duplicate tab replaced:",
		"message": (replacedTab.url).toString()
	}).then(currentNotification => {
		setTimeout((notification) => {
			browser.notifications.clear(notification);
		}, 5000, currentNotification);
	});
	
	browser.tabs.remove(discardedTabs.map(tab => tab.id));
};

let getTabQuery = (url) => {
	const newURL = new URL(url);
	let filter;

	switch (newURL.protocol) {
		case 'about:':
			filter = {
				'url': `${newURL.protocol}*`
			};
			break;

		default:
			filter = {
				'url': `*://${newURL.hostname}/*`
			};
			break;
	}

	return Object.assign({}, TAB_QUERY_OPTIONS, filter);
}

let checkDuplicateTabs = async (newTab) => {
	if (newTab.id === browser.tabs.TAB_ID_NONE || blessedTabs.has(newTab.id)) {
		return;
	}
	
	/* query to prefilter tabs */
	const tabQuery = getTabQuery(newTab.url);
	
	await browser.tabs.query(tabQuery).then(tabs => {
		/* return tabs with in the same session and the same URL (including current) */
		let copies = tabs.filter(tab => {
			return newTab.cookieStoreId === tab.cookieStoreId
					&& newTab.url === tab.url && !blessedTabs.has(tab.id);
		});
		
		if (copies.length > 1) {
			/* TODO handle priorities -- right now it keeps the older tab */
			copies.sort((a, b) => a.id - b.id);
			
			/* keep first tab, discard the rest */
			[ keptTab, ...discarded ] = copies;
			replaceTab(newTab, keptTab, discarded);
		}
	});
};

/* main routine */
browser.tabs.onUpdated.addListener((id, change, newTab) => {
	if (change.url && change.url !== 'about:blank') {
		checkDuplicateTabs(newTab);
	}
});

/* add protections to newly created tabs */
browser.tabs.onCreated.addListener(tab => {
	if ('openerTabId' in tab && tab.status === 'loading' && settings.protectDuplicates) {
		blessedTabs.add(tab.id);
	}
});

browser.tabs.onRemoved.addListener((id, info) => {
	blessedTabs.delete(id);
});

browser.storage.onChanged.addListener((changes, areaName) => {
	/* extract just the new values so we can apply them to our options */
	let additions = {};
	Object.keys(changes).forEach((key) => additions[key] = changes[key].newValue);
	Object.assign(settings, additions);
	
	/**
	 * wipe any 'protected' tabs if the option is disabled so they don't linger if another
	 * duplicate shows up
	 */
	if (!settings.protectDuplicates) {
		blessedTabs.clear();
	}
});

browser.storage.sync.get(null, (data) => {
	Object.assign(settings, data);
});
