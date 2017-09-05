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
}

let checkDuplicateTab = (newTab) => {
	if (newTab.id === browser.tabs.TAB_ID_NONE) {
		return;
	}
	
	browser.tabs.query(TAB_QUERY_OPTIONS).then(tabs => {
		const newURL = new URL(newTab.url);
		
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