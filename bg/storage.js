
const key_defaut_value_map = {
    problem_list: [],
    pre_problem_list: [],
    main_status: 'close',
    anki_options: {
        deck: '',
        tag: 'SWC',
    },
};

let key_now_value_map = JSON.parse(JSON.stringify(key_defaut_value_map));

let localStorageData = {};

function set_storage(key, value) {
    const dataToStore = {};
    dataToStore[key] = value;

    chrome.storage.sync.set(dataToStore, function() {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        }
    });
}

function init_storage(key, default_value) {
    chrome.storage.local.get([key], function(result) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else {
            let variable = result[key];
            if (typeof variable === 'undefined') {
                const dataToStore = {};
                dataToStore[key] = default_value;

                chrome.storage.sync.set(dataToStore, function() {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                    } else {
                        console.log(`Key ${key} default_value is set: ${JSON.stringify(default_value)}`);
                    }
                });
            }

            if (typeof variable === 'undefined') {
                key_now_value_map[key] = default_value;
            } else {
                key_now_value_map[key] = result[key];
            }

            Object.defineProperty(localStorageData, key, {
                get: function () {
                    return key_now_value_map[key];
                },
                set: function (val) {
                    set_storage(key, val);
                    key_now_value_map[key] = val;
                }
            });
		}
	});
}

Object.entries(key_defaut_value_map).forEach(([key, value]) => {
    init_storage(key, value);
});

export { localStorageData };
