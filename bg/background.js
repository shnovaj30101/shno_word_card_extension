
let problem_list = [];
let pre_problem_list = [];
let main_status = 'close';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.type === "send_problem") {
        //console.log(request.problem);
        problem_list.push(request.problem);
        //console.log(problem_list)
        sendResponse({'success': true});
    } else if (request.type === "get_problem_list") {
        sendResponse({'problem_list': problem_list});
        if (problem_list.length > 0) {
            pre_problem_list = problem_list;
        }
		problem_list = [];
    } else if (request.type === "get_problem_list_again") {
        sendResponse({'problem_list': pre_problem_list});
    } else if (request.type === "set_status_open") {
        main_status = 'open';
        sendResponse({'success': true});
    } else if (request.type === "set_status_close") {
        main_status = 'close';
        sendResponse({'success': true});
    } else if (request.type === "get_main_status") {
        sendResponse({'status': main_status});
    }
});

chrome.action.setBadgeText({text:'off'});
