

$("#open-btn").click(function() {
    //chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        //chrome.tabs.sendMessage(
            //tabs[0].id,
            //{main_status_set: "open"},
            //function (response) {
                ////console.log(response);
            //}
        //)
    //});
	chrome.runtime.sendMessage({ type: "set_status_open" }, function(response) {
        chrome.action.setBadgeText({text:''});
        console.log(response);
	});
});

$("#close-btn").click(function() {
	//chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		//chrome.tabs.sendMessage(
			//tabs[0].id,
			//{main_status_set: "close"},
			//function (response) {
				////console.log(response);
			//}
		//)
	//});
	chrome.runtime.sendMessage({ type: "set_status_close" }, function(response) {
        chrome.action.setBadgeText({text:'off'});
        console.log(response);
	});
});

$("#download-btn").click(function() {
	chrome.runtime.sendMessage({ type: "get_problem_list" }, function(response) {
		//console.log(response.problem_list);
        if (response.problem_list.length > 0) {
            saveText('anki_problem.txt', response.problem_list.join('\n'));
        }
	});
});

$("#redownload-btn").click(function() {
	chrome.runtime.sendMessage({ type: "get_problem_list_again" }, function(response) {
		//console.log(response.problem_list);
        if (response.problem_list.length > 0) {
            saveText('anki_problem.txt', response.problem_list.join('\n'));
        }
	});
});

function saveText(filename, text) {
	var tempElem = document.createElement('a');
	tempElem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	tempElem.setAttribute('download', filename);
	tempElem.click();
}

