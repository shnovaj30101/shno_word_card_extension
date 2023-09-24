import { localStorageData } from './storage.js';

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
        if (localStorageData.main_status == 'open') {
            this.init_err = false;
            chrome.action.setBadgeText({text:''});
        } else if (localStorageData.main_status == 'close') {
            this.init_err = false;
            chrome.action.setBadgeText({text:'off'});
        } else {
            this.init_err = true;
            chrome.action.setBadgeText({text:'err'});
        }
    }

    on_open() {
        if (init_err) {
            throw new SWCBackInitFail();
        }
        localStorageData.main_status = 'open';
        chrome.action.setBadgeText({text:''});
    }

    on_close() {
        if (init_err) {
            throw new SWCBackInitFail();
        }
        localStorageData.main_status = 'close';
        chrome.action.setBadgeText({text:'off'});
    }

    push_problem (problem_text) {
        if (init_err) {
            throw new SWCBackInitFail();
        }
        let now_problem_list = localStorageData.problem_list;
        now_problem_list.push(problem_text);
        localStorageData.problem_list = now_problem_list;
    }

    get_problem_list() {
        if (init_err) {
            throw new SWCBackInitFail();
        }
        return localStorageData.problem_list;
    }

    get_problem_list_again() {
        if (init_err) {
            throw new SWCBackInitFail();
        }
        return localStorageData.pre_problem_list;
    }

    get_main_status() {
        if (init_err) {
            return 'err';
        }
        return localStorageData.main_status;
    }

    clear_problem_list() {
        if (init_err) {
            throw new SWCBackInitFail();
        }
        if (localStorageData.problem_list.length > 0) {
            localStorageData.pre_problem_list = localStorageData.problem_list;
        }
        localStorageData.problem_list = [];
    }
}

export { SWCBack, SWCBackInitFail };
