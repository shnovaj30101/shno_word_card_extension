import { Ankiconnect } from './ankiconnect.js';

class SWCBack {
    constructor() {
        this.problem_list = [];
        this.pre_problem_list = [];
        this.main_status = 'close';

        this.ankiconnect = new Ankiconnect();
        this.anki_options = {
            deck: '',
            tag: 'SWC',
        };
    }

    on_open() {
        this.main_status = 'open';
        chrome.action.setBadgeText({text:''});
    }

    on_close() {
        this.main_status = 'close';
        chrome.action.setBadgeText({text:'off'});
    }

    get_problem_list() {
        return this.problem_list;
    }

    get_problem_list_again() {
        return this.pre_problem_list;
    }

    get_main_status() {
        return this.main_status;
    }

    clear_problem_list() {
        if (this.problem_list.length > 0) {
            this.pre_problem_list = this.problem_list;
        }
        this.problem_list = [];
    }
}

let swcback = new SWCBack();

function on_message(request, sender, callback) {
    if (request.type === "save_problem_to_bg") {
        let problem_text =
            request.problem['sentence'] + '\t' +
            request.problem['word_list'] + '\t' +
            request.problem['pos_list'] + '\t' +
            request.problem['answer_list'];
        swcback.problem_list.push(problem_text);
        callback({'success': true});
    } else if (request.type === "get_problem_list") {
        let problem_list = swcback.get_problem_list();
        swcback.clear_problem_list();
        callback({'problem_list': problem_list});
    } else if (request.type === "get_problem_list_again") {
        let problem_list = swcback.get_problem_list_again();
        callback({'problem_list': problem_list});
    } else if (request.type === "set_status_open") {
        swcback.on_open();
        callback({'success': true});
    } else if (request.type === "set_status_close") {
        swcback.on_close();
        callback({'success': true});
    } else if (request.type === "get_main_status") {
        let main_status = swcback.get_main_status();
        callback({'status': main_status});
    } else if (request.type === "ankiconnect_ooption_change") {
        let target_value = request.value;
        swcback.anki_options.deck = target_value;
        callback({'success': true});
    } else if (request.type === "get_anki_options") {
        (async () => {
            let version = await swcback.ankiconnect.getVersion();

            if (!version) {
                callback({'success': false});
            } else {
                let deck_name_list = await swcback.ankiconnect.getDeckNames();
                if (deck_name_list.length === 0) {
                    swcback.anki_options.deck = '';
                } else if (deck_name_list.length > 0 && swcback.anki_options.deck.length === 0) {
                    swcback.anki_options.deck = deck_name_list[0];
                } else if (deck_name_list.length > 0 && !deck_name_list.includes(swcback.anki_options.deck)) {
                    swcback.anki_options.deck = deck_name_list[0];
                }
                callback({
                    'success': true,
                    'deck_name_list': deck_name_list,
                    'anki_options': swcback.anki_options,
                });
            }
        })();
        return true;
    } else if (request.type === "detect_anki_connect") {
        (async () => {
            let version = await swcback.ankiconnect.getVersion();
            if (!version) {
                callback({'success': true, 'result': false});
            } else {
                callback({'success': true, 'result': true});
            }
        })();
        return true;
    } else if (request.type === "save_problem_to_anki") {
        (async () => {
            let note = {
                "deckName": swcback.anki_options.deck,
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
                        "deckName": swcback.anki_options.deck,
                        "checkChildren": false,
                        "checkAllModels": false
                    }
                },
                "tags": []
            };

            if (swcback.anki_options.tag.length > 0) {
                note.tags.push(swcback.anki_options.tag);
            }

            let response = await swcback.ankiconnect.addNote(note);

            if (response) {
                callback({'success': true});
            } else {
                callback({'success': false});
            }

        })();
        return true;
    }
}

chrome.runtime.onMessage.addListener(on_message);
chrome.action.setBadgeText({text:'off'});

