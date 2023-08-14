import { Ankiconnect } from './ankiconnect.js';

class SWCBack {
    constructor() {
        this.problem_list = [];
        this.pre_problem_list = [];
        this.main_status = 'close';

        this.ankiconnect = new Ankiconnect();
        this.anki_deck_list = [];
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
    if (request.type === "send_problem") {
        swcback.problem_list.push(request.problem);
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
    } else if (request.type === "detect_anki_connect") {
        (async () => {
            let version = await swcback.ankiconnect.getVersion();

            if (!version) {
                callback({'success': false});
            } else {
                let deck_name_list = await swcback.ankiconnect.getDeckNames();
                callback({'success': true, 'deck_name_list': deck_name_list});
            }
        })();
        return true;
    }
}

chrome.runtime.onMessage.addListener(on_message);
chrome.action.setBadgeText({text:'off'});

