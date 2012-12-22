chrome.extension.sendRequest({method: "anal", data: ['_trackPageview', location.pathname]});

$(function () {
	var $urls = $("#url-in, #url-out"),
		$id = $("#id"),
		$pw = $("#pw"),
		$anal = $("#anal"),
		$message = $("#message").text(chrome.i18n.getMessage("save_account_info")),
		$required = $(".required"),
		$save_button = $("#save_button");
	
	// 設定項目読み込み
	var anet2_urls = localStorage["anet2_urls"];
	if (anet2_urls)
		JSON.parse(anet2_urls).forEach(function (url, index) {
			$urls.eq(index).val(url);
		});
	
	var login = localStorage["login"];
	if (login) {
		login = JSON.parse(login);
		$id.val(login.id);
		$pw.val(login.pw);
	}
	
	var anal_enabled = localStorage["anal"] === "false" ? false : true;
	$anal.prop("checked", anal_enabled);
	
	$save_button.click(function () {
		chrome.extension.sendRequest({method: "anal", data: ["_trackEvent", "options", "saved"]});
		
		// 必須項目の入力チェック
		var required = $.makeArray($required.map(function () {
			return $(this).val() === "";
		})).every(function (e) {
			return e;
		});
		if (required)
			return $message.text(chrome.i18n.getMessage("save_account_failed"));
		
		// URLを保存
		anet2_urls = $.makeArray($urls.map(function () {
			return $(this).val();
		}));
		localStorage["anet2_urls"] = JSON.stringify(anet2_urls);
		
		// ログイン情報をlocalStorageへ保存
		localStorage["login"] = JSON.stringify({
			id: $id.val(),
			pw: $pw.val()
		});
		
		var anal = String($anal.prop("checked"));
		localStorage["anal"] = anal;
		chrome.extension.sendRequest({method: "anal", data: ["_trackEvent", "analytics", String(anal)]});
		
		$message.show();
		$save_button.hide();
		setTimeout(function () {
			$message.fadeOut(500, function () {
				$save_button.show();
			});
		}, 1000);
	});
});