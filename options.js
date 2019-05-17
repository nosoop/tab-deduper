document.querySelector("form").addEventListener("change", (e) => {
	browser.storage.sync.set({
		'protectDuplicates': document.querySelector("#protect_duplicates").checked
	});
});

document.addEventListener("DOMContentLoaded", () => {
	browser.storage.sync.get(null).then(data => {
		document.querySelector("#protect_duplicates").checked = 'protectDuplicates' in data?
				data.protectDuplicates : true;
	});
});
