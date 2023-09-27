import { SWCBack, SWCBackInitFail } from './swcback.js';

let swcback;

class AddToAnkiFail extends Error {
	constructor (message) {
		super(message)
		this.name = this.constructor.name;
	}
}

function handle_save_problem_to_bg(request, sender) {
    let problem_text =
        request.problem['sentence'] + '\t' +
        request.problem['word_list'] + '\t' +
        request.problem['pos_list'] + '\t' +
        request.problem['answer_list'] + '\t' +
        request.problem['url'] + '\t' +
        request.problem['remark'].replace(/\n/g, '\\n');
    swcback.push_problem(problem_text);
}

function handle_get_problem_list(request, sender) {
    let problem_list = swcback.get_problem_list();
    swcback.clear_problem_list();
    return {
        'problem_list': problem_list
    };
}

function handle_get_problem_list_again(request, sender) {
    let problem_list = swcback.get_problem_list_again();
    return {
        'problem_list': problem_list
    };
}

function handle_set_status_open(request, sender) {
    swcback.on_open();
}

function handle_set_status_close(request, sender) {
    swcback.on_close();
}

function handle_get_main_status(request, sender) {
    let main_status = swcback.get_main_status();
    return {
        'status': main_status
    };
}

function handle_anki_deck_change(request, sender) {
    let target_value = request.value;
    swcback.set_anki_options('deck', target_value);
}

async function handle_get_anki_options(request, sender) {
    let version = await swcback.ankiconnect.getVersion();

    if (!version) {
        return {};
    } else {
        let deck_name_list = await swcback.ankiconnect.getDeckNames();
        let anki_options = swcback.get_anki_options();
        if (deck_name_list.length === 0) {
            swcback.set_anki_options('deck', '');
        } else if (deck_name_list.length > 0 && anki_options.deck.length === 0) {
            swcback.set_anki_options('deck', deck_name_list[0]);
        } else if (deck_name_list.length > 0 && !deck_name_list.includes(anki_options.deck)) {
            swcback.set_anki_options('deck', deck_name_list[0]);
        }

        return {
            'deck_name_list': deck_name_list,
            'anki_options': anki_options,
        };
    }
}

async function handle_detect_anki_connect(request, sender) {
    let version = await swcback.ankiconnect.getVersion();
    if (!version) {
        return false;
    } else {
        return true;
    }
}

async function handle_save_problem_to_anki(request, sender) {
    let anki_options = swcback.get_anki_options();
    let note = {
        "deckName": anki_options.deck,
        "modelName": "shno_word_card",
        "fields": {
            "sentence": request.problem['sentence'],
            "word_list": request.problem['word_list'],
            "pos_list": request.problem['pos_list'],
            "answer_list": request.problem['answer_list'],
            "url": request.problem['url'],
            "remark": request.problem['remark'],
        },
        "options": {
            "allowDuplicate": true,
            "duplicateScope": "deck",
            "duplicateScopeOptions": {
                "deckName": anki_options.deck,
                "checkChildren": false,
                "checkAllModels": false
            }
        },
        "tags": []
    };

    if (anki_options.tag.length > 0) {
        note.tags.push(anki_options.tag);
    }

    let response = await swcback.ankiconnect.addNote(note);

    if (response) {
        return;
    } else {
        throw new AddToAnkiFail();
    }
}

let sync_handle_func_map = {
    save_problem_to_bg: handle_save_problem_to_bg,
    get_problem_list: handle_get_problem_list,
    get_problem_list_again: handle_get_problem_list_again,
    set_status_open: handle_set_status_open,
    set_status_close: handle_set_status_close,
    get_main_status: handle_get_main_status,
    anki_deck_change: handle_anki_deck_change,
};

let async_handle_func_map = {
    get_anki_options: handle_get_anki_options,
    detect_anki_connect: handle_detect_anki_connect,
    save_problem_to_anki: handle_save_problem_to_anki,
};

function on_message_wrapper (request, sender, callback) {
    try {
        if (request.type in sync_handle_func_map) {
            let result = sync_handle_func_map[request.type](request, sender);
            callback({'success': true, 'result': result});
        } else if (request.type in async_handle_func_map) {
            (async () => {
                let result = await async_handle_func_map[request.type](request, sender);
                callback({'success': true, 'result': result});
            })();
            return true;
        } else {
            callback({'success': false, 'reason': `Not support for type ${request.type}`});
        }
    } catch (err) {
        if (err instanceof SWCBackInitFail) {
            callback({'success': false, 'reason': `Swc_back init error`});
        } else if (err instanceof SWCBackInitFail) {
            callback({'success': false, 'reason': `Add to anki fail`});
        } else {
            callback({'success': false, 'reason': `Unexpected error, err_msg: ${err.message}`});
        }
    }
}

const sleep = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

(async () => {
    await sleep(1000);
    swcback = new SWCBack();
    chrome.runtime.onMessage.addListener(on_message_wrapper);
})();
