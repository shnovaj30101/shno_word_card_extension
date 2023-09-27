

function saveText(filename, text) {
	var tempElem = document.createElement('a');
	tempElem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	tempElem.setAttribute('download', filename);
	tempElem.click();
}

function handle_set_status_open (response) {}

function handle_set_status_close (response) {}

function handle_get_problem_list (response) {
    if (response.result.problem_list.length > 0) {
        saveText('anki_problem.txt', response.problem_list.join('\n'));
    }
}

function handle_get_problem_list_again (response) {
    if (response.result.problem_list.length > 0) {
        saveText('anki_problem.txt', response.problem_list.join('\n'));
    }
}

function handle_anki_deck_change (response) {
    console.log("anki_deck_change success");
}

function handle_get_anki_options (response) {
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
        console.log(`get_anki_options fail, reason: ${response.reason}`);
        $("#ankiconnect-option").hide();
    }
}

function handle_func_wrapper (handle_func) {
    
    function inner (response) {
        if (response.success === true) {
            handle_func(response);
        } else {
            console.log(`${handle_func.name}'s args response not success, reason: ${response.reason}`);
        }
    }

    return inner;
}

function on_open() {
	chrome.runtime.sendMessage({ type: "set_status_open" }, handle_func_wrapper(handle_set_status_open));
}

function on_close() {
	chrome.runtime.sendMessage({ type: "set_status_close" }, handle_func_wrapper(handle_set_status_close));
}

function on_download() {
	chrome.runtime.sendMessage({ type: "get_problem_list" }, handle_func_wrapper(handle_get_problem_list));
}

function on_redownload() {
	chrome.runtime.sendMessage({ type: "get_problem_list_again" }, handle_func_wrapper(handle_get_problem_list_again));
}

function on_anki_deck_change() {
    let target_value = $("#anki-deck").val();
    console.log(`anki_deck_change target_value: ${target_value}`);
	chrome.runtime.sendMessage({ type: "anki_deck_change", value: target_value }, handle_func_wrapper(handle_anki_deck_change));
}

function render_anki_options() {
	chrome.runtime.sendMessage({ type: "get_anki_options" }, handle_func_wrapper(handle_get_anki_options));
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
    $("#anki-deck").on("change", on_anki_deck_change);
}


function utilAsync(func) {
    return function(...args) {
        func.apply(this, args);
    };
}

$(document).ready(utilAsync(onReady));
