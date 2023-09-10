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

function on_ankiconnect_option_change() {
    let target_value = $("#anki-deck").val();
    console.log(`anki-deck target_value: ${target_value}`);
	chrome.runtime.sendMessage({ type: "ankiconnect_ooption_change", value: target_value }, function(response) {
        if (response.success === true) {
            console.log("anki-deck change success");
        } else {
            console.log("anki-deck change fail");
        }
	});
}

function render_anki_options() {
	chrome.runtime.sendMessage({ type: "get_anki_options" }, function(response) {
        if (response.success === true) {
            let deck_name_list = response.deck_name_list;
            let target_deck = response.anki_options.deck;
            let anki_tag = response.anki_options.tag;
            $("#anki-deck").empty();
            deck_name_list.forEach(
                deck_name => $("#anki-deck").append($('<option>', {value: deck_name, text: deck_name}))
            );
            if (target_deck.length > 0 && deck_name_list.includes(target_deck)) {
                $("#anki-deck").val(target_deck);
            }
            $("#anki-tag").val(anki_tag);
            $("#ankiconnect-option").show();
        } else {
            $("#ankiconnect-option").hide();
        }
	});
}

function onReady() {
    render_anki_options();

    $(document).on('mouseover', '.button', function () {
        $(this).css('background-color', '#6C747D');
        $(this).css('color', '#FFFFFF');
    });

    $(document).on('mouseout', '.button', function () {
        $(this).css('background-color', '');
        $(this).css('color', '#6C747D');
    });

    $("#open-btn").click(on_open);
    $("#close-btn").click(on_close);
    $("#download-btn").click(on_download);
    $("#redownload-btn").click(on_redownload);
    $("#anki-deck").on("change", on_ankiconnect_option_change);
}


function utilAsync(func) {
    return function(...args) {
        func.apply(this, args);
    };
}

$(document).ready(utilAsync(onReady));
