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
			var anet2_url = "";
			var is_anet2 = anet2_urls.some(function (url) {
				anet2_url = url = url.slice(-1) === "/" ? url.slice(0, -1) : url;
				var split_limit = url.split("/").length + 1;
				var current_url = req.data || sender.tab.url;
				// check host
				return url === current_url.split("/", split_limit).slice(0, -1).join("/");
			});
			console.log("is_anet2: %s", is_anet2);
			if (is_anet2) {
				console.log("anet2_url: %s", anet2_url);
				res(anet2_url);
			}
		},
		"login_data": function () {
			var login = localStorage["login"];
			res(login ? JSON.parse(login) : false);
			console.log("login_data: requested");
		},
		"anal": function () {
			var anal_enabled =  localStorage["anal"];
			console.log("Google Analytics enabled: %s", anal_enabled);
			if (anal_enabled !== "false") {
				console.log(req.data);
				_gaq.push(req.data ? req.data : ['_trackPageview']);
			}
		}
	})[req.method];
	
	method && method();
});