function get_anet2_urls() {
	// ALC NetAcademy2 の URL
	var anet2_urls = localStorage["anet2_urls"];
	return (anet2_urls && typeof anet2_urls !== "object")
		? anet2_urls = JSON.parse(anet2_urls)
		: false;
}

// browserAction click event
chrome.browserAction.onClicked.addListener(function () {
	var anet2_urls = get_anet2_urls();
	
	chrome.tabs.create({
		url: anet2_urls ? anet2_urls[0] : chrome.extension.getURL("pages/options.html")
	});
});

// Message event listener
chrome.extension.onRequest.addListener(function (req, sender, res) {
	var anet2_urls = get_anet2_urls();
	
	// define method
	var method = ({
		"forbidden": function () {
			if (sender.tab.url === anet2_urls[0]) {
				chrome.tabs.update(sender.tab.id, {
					url: anet2_urls[1]
				});
				console.log("forbidden: tab updated");
			}
		},
		"is_anet2": function () {
			var is_anet2 = anet2_urls.some(function (url) {
				// check host
				return url.split("/")[2] === sender.tab.url.split("/")[2];
			});
			console.log("is_anet2: " + is_anet2)
			res(is_anet2);
		},
		"login_data": function () {
			var login = localStorage["login"];
			res(login ? JSON.parse(login) : false);
			console.log("login_data: requested");
		}
	})[req.method];
	
	if (method)
		method();
});