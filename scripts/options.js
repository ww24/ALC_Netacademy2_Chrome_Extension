$(function () {
	var $urls = $("#url-in, #url-out"),
		$id = $("#id"),
		$pw = $("#pw"),
		$message = $("#message"),
		$required = $(".required");

	// 設定項目読み込み
	var anet2_urls = localStorage["anet2_urls"];
	if (anet2_urls)
		JSON.parse(anet2_urls).forEach(function (url, index) {
			$urls.eq(index).val(url);
		});

	$("#save_button").click(function () {
		// 必須項目の入力チェック
		var required = [].every.call($required.map(function () {
			var $this = $(this);
			var req = $this.val() === "";
			return req;
		}), function (e) {
			return e;
		});
		if (required) {
			$message.text(chrome.i18n.getMessage("save_account_failed"));
			return false;
		}

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

		$message.text(chrome.i18n.getMessage("save_account_info"));
	});
});