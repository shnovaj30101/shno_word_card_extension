function on_open() {
	chrome.runtime.sendMessage({ type: "set_status_open" }, function(response) {
        chrome.action.setBadgeText({text:''});
	});
}

function on_close() {
	chrome.runtime.sendMessage({ type: "set_status_close" }, function(response) {
        chrome.action.setBadgeText({text:'off'});
	});
}

function on_download() {
	chrome.runtime.sendMessage({ type: "get_problem_list" }, function(response) {
        if (response.problem_list.length > 0) {
            saveText('anki_problem.txt', response.problem_list.join('\n'));
        }
	});
}

function on_redownload() {
	chrome.runtime.sendMessage({ type: "get_problem_list_again" }, function(response) {
        if (response.problem_list.length > 0) {
            saveText('anki_problem.txt', response.problem_list.join('\n'));
        }
	});
}

function saveText(filename, text) {
	var tempElem = document.createElement('a');
	tempElem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	tempElem.setAttribute('download', filename);
	tempElem.click();
}

function detect_anki_connect() {
	chrome.runtime.sendMessage({ type: "detect_anki_connect" }, function(response) {
        if (response.success === true) {
            let deck_name_list = response.deck_name_list;
            $("#anki_deck").empty();
            deck_name_list.forEach(
                deck_name => $("#anki_deck").append($('<option>', {value: deck_name, text: deck_name}))
            );
            $("#ankiconnect_option").show();
        } else {
            $("#ankiconnect_option").hide();
        }
	});
}

function onReady() {
    detect_anki_connect();

    $("#open-btn").click(on_open);
    $("#close-btn").click(on_close);
    $("#download-btn").click(on_download);
    $("#redownload-btn").click(on_redownload);
}


function utilAsync(func) {
    return function(...args) {
        func.apply(this, args);
    };
}

$(document).ready(utilAsync(onReady));
