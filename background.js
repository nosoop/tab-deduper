const TAB_QUERY_OPTIONS = {
	currentWindow: true,
	windowType: "normal"
};

let replaceTab = (replacedTab, replacementTab, discardedTabs) => {
	browser.tabs.move(replacementTab.id, { index: replacedTab.index });
	
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

let checkDuplicateTabs = async (newTab) => {
	if (newTab.id === browser.tabs.TAB_ID_NONE) {
		return;
	}
	
	/* query to prefilter down to same hosts */
	let tabQuery = Object.assign({}, TAB_QUERY_OPTIONS);
	const newURL = new URL(newTab.url);
	tabQuery['url'] = `*://${newURL.hostname}/*`;
	
	await browser.tabs.query(tabQuery).then(tabs => {
		/* return tabs with in the same session and the same URL (including current) */
		let copies = tabs.filter(tab => {
			return newTab.cookieStoreId === tab.cookieStoreId
					&& newTab.url === tab.url;
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