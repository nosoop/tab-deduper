const TAB_QUERY_OPTIONS = {
	currentWindow: true,
	windowType: "normal"
};

let replaceTab = (replacedTab, replacementTab) => {
	browser.tabs.move(replacementTab.id, { index: replacedTab.index });
	browser.tabs.update(replacementTab.id, { active: true });
	
	browser.notifications.create({
		"type": "basic",
		"title": "Duplicate tab replaced:",
		"message": (replacedTab.url).toString()
	}).then(currentNotification => {
		setTimeout((notification) => {
			browser.notifications.clear(notification);
		}, 5000, currentNotification);
	});
	
	browser.tabs.remove(replacedTab.id);
};

let checkDuplicateTab = (newTab) => {
	if (newTab.id === browser.tabs.TAB_ID_NONE) {
		return;
	}
	
	/* query to prefilter down to same hosts */
	let tabQuery = Object.assign({}, TAB_QUERY_OPTIONS);
	const newURL = new URL(newTab.url);
	tabQuery['url'] = `*://${newURL.hostname}/*`;
	
	browser.tabs.query(tabQuery).then(tabs => {
		for (let tab of tabs) {
			if (newTab.id == tab.id) {
				continue;
			}
			
			/* make sure they are in the same context */
			if (newTab.cookieStoreId !== tab.cookieStoreId) {
				continue;
			}
			
			let tabURL = new URL(tab.url);
			
			/* TODO additional options for URL matching */
			if (newTab.url === tab.url) {
				replaceTab(newTab, tab);
			}
		}
	});
};

/* main routine */
browser.tabs.onUpdated.addListener((id, change, newTab) => {
	if (change.url && change.url !== 'about:blank') {
		checkDuplicateTab(newTab);
	}
});