document.querySelector("form").addEventListener("change", (e) => {
	browser.storage.sync.set({
		'protectDuplicates': document.querySelector("#protect_duplicates").checked,
		'moveOlder': document.querySelector("#move_older").checked,
		'checkMultiWindow': document.querySelector("#check_multiwindow").checked
	});
});

document.addEventListener("DOMContentLoaded", () => {
	browser.storage.sync.get(null).then(data => {
		document.querySelector("#protect_duplicates").checked = 'protectDuplicates' in data?
				data.protectDuplicates : true;
		
		document.querySelector("#move_older").checked = 'moveOlder' in data?
				data.moveOlder : true;
		
		document.querySelector("#check_multiwindow").checked = 'checkMultiWindow' in data?
				data.checkMultiWindow : false;
	});
});
