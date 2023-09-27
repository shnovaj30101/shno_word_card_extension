import { localStorageData } from './storage.js';
import { Ankiconnect } from './ankiconnect.js';

class SWCBackInitFail extends Error {
	constructor (message) {
		super(message)
		this.name = this.constructor.name;
	}
}

class SWCBack {
    constructor() {
        this.ankiconnect = new Ankiconnect();
        this.init_err = true;
        if (localStorageData.main_status === 'open') {
            this.init_err = false;
            chrome.action.setBadgeText({text:''});
        } else if (localStorageData.main_status === 'close') {
            this.init_err = false;
            chrome.action.setBadgeText({text:'off'});
        } else {
            this.init_err = true;
            chrome.action.setBadgeText({text:'err'});
        }
    }

    on_open() {
        if (this.init_err) {
            throw new SWCBackInitFail();
        }
        localStorageData.main_status = 'open';
        chrome.action.setBadgeText({text:''});
    }

    on_close() {
        if (this.init_err) {
            throw new SWCBackInitFail();
        }
        localStorageData.main_status = 'close';
        chrome.action.setBadgeText({text:'off'});
    }

    push_problem (problem_text) {
        if (this.init_err) {
            throw new SWCBackInitFail();
        }
        let now_problem_list = JSON.parse(JSON.stringify(localStorageData.problem_list));
        now_problem_list.push(problem_text);
        localStorageData.problem_list = now_problem_list;
    }

    get_problem_list() {
        if (this.init_err) {
            throw new SWCBackInitFail();
        }
        return localStorageData.problem_list;
    }

    get_problem_list_again() {
        if (this.init_err) {
            throw new SWCBackInitFail();
        }
        return localStorageData.pre_problem_list;
    }

    get_main_status() {
        if (this.init_err) {
            return 'err';
        }
        return localStorageData.main_status;
    }

    clear_problem_list() {
        if (this.init_err) {
            throw new SWCBackInitFail();
        }
        if (localStorageData.problem_list.length > 0) {
            localStorageData.pre_problem_list = localStorageData.problem_list;
        }
        localStorageData.problem_list = [];
    }

    set_anki_options(key, value) {
        if (this.init_err) {
            throw new SWCBackInitFail();
        }
        let now_anki_option = JSON.parse(JSON.stringify(localStorageData.anki_options));
        now_anki_option[key] = value;
        localStorageData.anki_options = now_anki_option;
    }

    get_anki_options() {
        if (this.init_err) {
            throw new SWCBackInitFail();
        }
        return localStorageData.anki_options;
    }
}

export { SWCBack, SWCBackInitFail };
