document.querySelectorAll('[data-i18n]').forEach((node) => {
	let text = browser.i18n.getMessage(node.dataset.i18n)
	node.appendChild(document.createTextNode(text))
})
