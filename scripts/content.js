/*
 * Content Script
 * 自動ログイン
 * キーイベントを取得してラジオボタンを選択→送信
 */

// check anet2 url
chrome.extension.sendRequest({method: "is_anet2"}, function (anet2_url) {
	// jQuery DOM ready if is_anet is true
	$(content_script.bind(null, anet2_url));
});

function content_script(anet2_url) {
	var title = document.title;
	if (~ title.indexOf("Forbidden"))
		chrome.extension.sendRequest({method: "forbidden"});
	
	chrome.extension.sendRequest({method: "anal", data: ['_trackPageview', location.href.split(anet2_url)[1]]});
	
	// word test table
	var	$body = $("body").eq(0),
		$table = $("#DltUnitList"),
		$id = $("#TbxAccountId"),
		$pass = $("#TbxPassword"),
		$login = $("#BtnLogin"),
		$name = $("#stNaviBarControl_LblName"),
		login_flag = false;
	
	if ($id.length > 0 && $pass.length > 0 && $login.length > 0) {
		var $message = $("#Vds");
		var message = $message.length > 0
			? $message.text().replace(/^\s+|\s+$/g, '')
			: "";
		if (message.length > 0)
			alert(chrome.i18n.getMessage("auto_login_failed"));
		else {
			chrome.extension.sendRequest({method: "login_data"}, function (login) {
				if (login) {
					// 自動ログイン
					$id.val(login.id);
					$pass.val(login.pw);
					// id, pass がセットされていて、リファラ空の場合は自動ログイン
					if (login.id !== "" && login.pw !== "" && document.referrer === "") {
						login_flag = true;
						chrome.extension.sendRequest({method: "anal", data: ["_trackEvent", "login", "auto login"]});
						$login.trigger("click");
					}
				}
			});
		}
	} else if ($table.length > 0) {
		// 問題一覧画面
		$body.bind("keydown", function (e) {
			if (e.keyCode === 13) {
				// 問題一覧の取得
				var	level = $("#DdlRangeSvl > option:selected").val(),
					$list = $("#DltUnitList > tbody > tr > td"),
					$question,
					point,
					$a;
				
				console.log("level: " + level);
				// 満点を取得していない問題を自動的に開く
				for (var i = 0, l = $list.length; l > i; i++) {
					$question = $list.eq(i);
					point = $question.find("input").eq(2).val();
					console.log(parseInt(point), Number(level) + 9);
					
					if (parseInt(point) < Number(level) + 9) {
						if (confirm(chrome.i18n.getMessage("start_test_confirm"))) {
							$a = $question.find('a.UnitCell');
							$a.attr("onclick", $a.attr("href").slice(11));
							$a.trigger('click');
						}
						break;
					}
				}
			}
		});
	} else if ($name.length === 1 && document.referrer !== "" && login_flag) {
		login_flag = false;
		// ログイン直後の場合
		chrome.extension.sendRequest({method: "is_anet2", data: document.referrer}, function (is_anet2) {
			is_anet2 && chrome.extension.sendRequest({method: "anal", data: ["_trackEvent", "login", "auto logged in"]});
		});
	} else {
		// 回答画面でキーボードの入力に応じて回答を行う
		$body.bind("keydown", function (e) {
			// Radioボタン一覧取得
			var $radio = $(":radio");
			
			function check(index) {
				// 問題回答画面か確認
				if ($radio.length === 4) 
					$radio.eq(index).attr("checked", "checked");
			}
			
			var onKeyEvent = ({
				65: check.bind(this, 0),
				83: check.bind(this, 1),
				68: check.bind(this, 2),
				70: check.bind(this, 3),
				13: function () {
					// Enter keyが押下された場合に次へ進む OR 採点する
					var	$next = $("#BtnNext"),
						$score = $("#BtnScore"),
						$menu = $("#BtnMoveMenu");
					
					$next = $next.length === 1
						? $next
						: $score.length === 1
							? $score
							: $menu;
					
					if ($next.length === 1)
						$next.trigger("click");
				}
			})[e.keyCode];
			
			onKeyEvent && onKeyEvent();
		});
	}
};