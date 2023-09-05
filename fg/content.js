
class ProblemFormatError extends Error {
    constructor (message) {
        super(message);
		this.name = this.constructor.name;
    }
}

(async function() {
    let main_status = "close";
    let select_text = '';
    let problem_text = '';
    // 會被 onmousedown 以及 onmousechange 影響
    // 如果直接被 ensure problem event 使用可能會有問題
    // 題目裡的文字可能會和select_text不一樣
    // 例如可能有以下狀況(反白選取一段文字，然後點擊反白區域再放開):
        // onmousedown -> onnouseup(題目文字不變) -> onmousechane (select_text改變)
    // problem_text必須和 onmouseup 綁定 並且被 ensure_problem event 使用
    let display_elem = null;
    let select_text_display_region_hover = false;
    let load_url = false;

    $(document).on('mouseover', '#select_text_display_region', function () {
        select_text_display_region_hover = true;
    });

    $(document).on('mouseout', '#select_text_display_region', function () {
        select_text_display_region_hover = false;
    });

    $(document).on('mouseover', '.delete_chosen_word', function () {
        $(this).css('background-color', '#EC5151');
        $(this).css('color', '#FFFFFF');
    });

    $(document).on('mouseout', '.delete_chosen_word', function () {
        $(this).css('background-color', '');
        $(this).css('color', '#EC5151');
    });

    $(document).on('mouseover', '#load_url', function () {
        if (load_url) {
            $(this).css('background-color', '#EC5151');
            $(this).css('color', '#FFFFFF');
        } else {
            $(this).css('background-color', '#238636');
            $(this).css('color', '#FFFFFF');
        }
    });

    $(document).on('mouseout', '#load_url', function () {
        if (load_url) {
            $(this).css('background-color', '');
            $(this).css('color', '#EC5151');
        } else {
            $(this).css('background-color', '');
            $(this).css('color', '#238636');
        }
    });

    $(document).on('click', '#load_url', function () {
        if (load_url) {
            load_url = false;
            $('#url_input').val('');
            $('#load_url').css('background-color', '#238636');
            $('#load_url').css('border', '1px solid #238636');
            $('#load_url').css('color', '#FFFFFF');
            $('#load_url').html('V');
        } else {
            load_url = true;
            $('#url_input').val(window.location.href);
            $('#load_url').css('background-color', '#EC5151');
            $('#load_url').css('border', '1px solid #EC5151');
            $('#load_url').css('color', '#FFFFFF');
            $('#load_url').html('X');
        }
    });

    $(document).on('click', '.delete_chosen_word', function () {
        for (let elem of $('.word_span').toArray()) {
            if ($(elem).data('index') === $(this).data('index')) {
                $(elem).css('color', '');
                $(elem).css("text-decoration","");
            }
        }
        $(this).parent().parent().remove();
    });

    $(document).on('click', '.word_span', function () {
        choose_word($(this), $(this).data('index'), $(this).data('word'));
    });

    $(document).on('click', '.answer_info', function () {
    });

    $(document).on('click', '#add_to_anki_btn', function () {
        let problem_data;
        try {
            problem_data = format_problem_data();
            chrome.runtime.sendMessage({
                type: "save_problem_to_anki",
                problem: problem_data
            }, function (response) {
                if (response.success) {
                    if (display_elem !== null) {
                        document.body.removeChild(display_elem);
                        display_elem = null;
                    }
                } else {
                    // 顯示 XX
                }
            });
        } catch (err) {
            if (err instanceof ProblemFormatError) {
            } else {
                throw err;
            }
        }
    });

    function format_problem_data () {
        let problem_data = {}; 
        problem_data['sentence'] = problem_text;

        let problem_input_arr = [];
        if ($('.chosen_word').toArray().length === 0) {
            alert("No word is chosen");
            throw new ProblemFormatError("No word is chosen");
        }
        for (let elem of $('.chosen_word').toArray()) {
            let problem_input = $(elem).find('.problem_input').val();
            if (problem_input.length === 0) {
                alert("some problem input's length is zero");
                throw new ProblemFormatError("some problem input's length is zero");
            }
            problem_input_arr.push(problem_input);
        }
        problem_data['word_list'] = problem_input_arr.join(',');

        let word_index_arr = [];
        for (let elem of $('.chosen_word').toArray()) {
            let word_index = $(elem).data('index');
            word_index_arr.push(word_index);
        }
        problem_data['pos_list'] = word_index_arr.join(',');

        let answer_input_arr = [];
        for (let elem of $('.chosen_word').toArray()) {
            let answer_input = $(elem).find('.answer_input').val();
            if (answer_input.length === 0) {
                alert("some answer input's length is zero");
                throw new ProblemFormatError("some answer input's length is zero");
            }
            answer_input_arr.push(answer_input);
        }
        problem_data['answer_list'] = answer_input_arr.join(',');

        problem_data['url'] = $("#url_input").val();
        problem_data['remark'] = $("#remark_input").val();

        return problem_data;
    }

    $(document).on('click', '#ensure_problem_btn', function () {
        let problem_data;
        try {
            problem_data = format_problem_data();
            chrome.runtime.sendMessage({
                type: "save_problem_to_bg",
                problem: problem_data
            }, function (response) {
                if (display_elem !== null) {
                    document.body.removeChild(display_elem);
                    display_elem = null;
                }
            });
        } catch (err) {
            if (err instanceof ProblemFormatError) {
            } else {
                throw err;
            }
        }
    });

    function hover_on_display_region() {
        //return document.getElementById("select_text_display_region") !== null &&
            //document.getElementById("select_text_display_region").matches(':hover');
        return document.getElementById("select_text_display_region") !== null &&
            select_text_display_region_hover;
    }

    function getSelectionText() {
        var text = "";
        var activeEl = document.activeElement;
        var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
        if (
          (activeElTagName == "textarea") || (activeElTagName == "input" &&
          /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
          (typeof activeEl.selectionStart == "number")
        ) {
            text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
        } else if (window.getSelection) {
            text = window.getSelection().toString();
        }
        select_text = text.trim(); // 避免結尾會有\n 這樣再最後寫檔的時候 同一筆資料卻有兩行
    }

    function displaySelectionText(e) {

        if (display_elem !== null) {
            document.body.removeChild(display_elem);
            display_elem = null;
        }

        problem_text = select_text.trim().replace(/[\n\t]+/g,' '); // 去掉所有換行符號和tab

        if (problem_text.trim().length > 0) {
            display_elem = document.createElement("div");
            display_elem.setAttribute(
                "style",
                "min-height: 100px;\
                min-width: 300px;\
                max-width: 500px;\
                border: 0.5px solid #E0E0E0;\
                position: fixed;\
                color:#969696;\
                z-index: 999999 !important;\
                background-color:#FAFAFA;\
                top: 0;\
                right: 0;");
            display_elem.setAttribute("id", "select_text_display_region");

            document.body.appendChild(display_elem);
            construct_display_interface();
        }
    }

    function construct_display_interface() {
        let render_arr = [];
        render_arr.push('<div id="sentence_region" \
            style="border: 1px solid #CCCCCC;\
                margin: 15px;\
                border-radius: 4px 4px 0px 0px;\
                color:#343541;\
                background-color: #F7F7F7;\
                padding: 10px;\
                font-size: 13px;\
                display:flex;">')

        render_arr.push('<div>')

        let word_list = problem_text.split(/\s+/);
        for (let i = 0 ; i < word_list.length ; i++) {
            let word_encode = word_list[i].replace(/'/g, "&apos;").replace(/"/g, '&quot;').replace(/&/g,"&amp;");
            render_arr.push('<span class="word_span" data-index="' + i.toString() + '" data-word="' + word_encode + '">' + word_list[i] + "</span>");
        }

        render_arr.push('</div>') // #sentence_region inner_div

        render_arr.push('</div>') // #sentence_region

        render_arr.push('<div id="url_region"\
            style="border-bottom: 1px solid #CCCCCC;\
                padding-top: 5px;\
                display: flex;\
                flex-wrap: wrap;\
                color:#343541;\
                border-top: 0.1px solid #CCCCCC;\
                border-left: 1px solid #CCCCCC;\
                border-right: 1px solid #CCCCCC;\
                margin: 15px;\
                margin-top: -15px">');

        render_arr.push('<div id="url_wrapper" \
            style="\
                flex: 1 1 auto;\
                display: flex;\
                min-width: 120px;">');

        render_arr.push('<div id="load_url"\
            style="border-radius: 4px;\
                border: 1px solid #EC5151;\
                text-align:center;\
                margin: 5px;\
                height:20px;\
                line-height: 20px;\
                color: #EC5151;\
                width:20px;\
                margin-top: 0px;">');
        render_arr.push('X</div>'); // #load_url

        render_arr.push('<div id="url_info" \
            style="margin: 5px;\
                margin-top: 0px;\
                margin-left: 0px;\
                width: 30px;\
                height:20px;\
                border: 1px solid #CED4DA;\
                color:#343541;\
                flex: 0 0 auto;\
                text-align: center;\
                font-size: 13px;\
                border-radius: 4px 0px 0px 4px">')

        render_arr.push("網址");
        render_arr.push('</div>'); // #url_info

        render_arr.push('<input type="text" id="url_input" \
            value= "' + window.location.href + '"\
            style="margin: 5px;\
                margin-top: 0px;\
                margin-left: -5px;\
                height:20px;\
                border: 1px solid #CED4DA;\
                background: #FFFFFF;\
                color: #000000;\
                border-left: 0.1px;\
                flex: 1 1 auto;\
                padding-left: 5px;\
                border-radius: 0px 4px 4px 0px">')

        render_arr.push('</div>'); // #url_wrapper
        render_arr.push('</div>'); // #url_region

        render_arr.push('<div id="remark_region"\
            style="border-bottom: 1px solid #CCCCCC;\
                padding-top: 5px;\
                display: flex;\
                flex-wrap: wrap;\
                color:#343541;\
                border-top: 0.1px solid #CCCCCC;\
                border-left: 1px solid #CCCCCC;\
                border-right: 1px solid #CCCCCC;\
                margin: 15px;\
                margin-top: -15px">');

        render_arr.push('<div id="mark_wrapper" \
            style="\
                flex: 1 1 auto;\
                display: flex;\
                min-width: 120px;">');

        render_arr.push('<div id="mark_info" \
            style="margin: 5px;\
                margin-top: 0px;\
                margin-left: 5px;\
                width: 60px;\
                height:20px;\
                border: 1px solid #CED4DA;\
                color:#343541;\
                flex: 0 0 auto;\
                text-align: center;\
                font-size: 13px;\
                border-radius: 4px 4px 4px 4px">')

        render_arr.push("備註");
        render_arr.push('</div>'); // #mark_info

        render_arr.push('<textarea id="remark_input"\
            style="background: #FFFFFF;\
                border:3px orange dashed;\
                width: 300px;\
                height:100px;\
                color: #000000;\
                border-radius: 4px 4px 4px 4px">')
        render_arr.push('</textarea>');

        render_arr.push('</div>'); // #mark_wrapper
        render_arr.push('</div>'); // #mark_region

        render_arr.push('<div id="ensure_problem_btn"\
            style="border-radius: 4px;\
                width: 50px;\
                text-align:center;\
                line-height: 25px;\
                height: 25px;\
                margin: 15px;\
                background-color: #6C747D;\
                color: #FFFFFF;\
                font-size:13px;\
                display: inline-block;\
                margin-top: 0px;\
                margin-right: 0px;\
                margin-bottom: 5px;">')
        render_arr.push('Ensure')
        render_arr.push('</div>')

        $('#select_text_display_region').append(render_arr.join('\n'))

        let display_elem = document.getElementById("select_text_display_region");
        let now_display_elem_width = display_elem.offsetWidth;
        display_elem.setAttribute(
                "style",
                "min-height: 100px;\
                width: " + now_display_elem_width.toString() + "px;\
                border: 0.5px solid #E0E0E0;\
                position: fixed;\
                color:#343541;\
                z-index: 999999 !important;\
                background-color:#FAFAFA;\
                top: 0;\
                right: 0;"
        );

        chrome.runtime.sendMessage({
            type: "detect_anki_connect",
        }, function (response) {
            if (response.success && response.result) {
                let render_anki_connect_arr = [];
                render_anki_connect_arr.push('<div id="add_to_anki_btn"\
                    style="border-radius: 4px;\
                        width: 50px;\
                        text-align:center;\
                        line-height: 25px;\
                        height: 25px;\
                        margin: 15px;\
                        background-color: #6C747D;\
                        color: #FFFFFF;\
                        font-size:13px;\
                        display: inline-block;\
                        margin-top: 0px;\
                        margin-right: 0px;\
                        margin-bottom: 5px;">')
                render_anki_connect_arr.push('Add')
                render_anki_connect_arr.push('</div>')

                $('#select_text_display_region').append(render_anki_connect_arr.join('\n'))
            }
        });

        load_url = true;
    }

    function choose_word(target_elem, index, str) {
        $(target_elem).css("color","red");
        $(target_elem).css("text-decoration","underline");
        let render_arr = [];
        render_arr.push('<div class="chosen_word" data-index="' + index + '" \
            style="border-bottom: 1px solid #CCCCCC;\
                padding-top: 5px;\
                display: flex;\
                flex-wrap: wrap;\
                color:#343541;\
                border-top: 0.1px solid #CCCCCC;\
                border-left: 1px solid #CCCCCC;\
                border-right: 1px solid #CCCCCC;\
                margin: 15px;\
                margin-top: -15px">');

        render_arr.push('<div class="problem_wrapper" \
            style="\
                flex: 1 1 auto;\
                display: flex;\
                min-width: 120px;">');

        render_arr.push('<div class="delete_chosen_word" data-index="' + index.toString() + '"\
            style="border-radius: 4px;\
                border: 1px solid #EC5151;\
                text-align:center;\
                margin: 5px;\
                height:20px;\
                line-height: 20px;\
                color: #EC5151;\
                width:20px;\
                margin-top: 0px;">');
        render_arr.push('X</div>');

        render_arr.push('<div class="problem_info" \
            style="margin: 5px;\
                margin-top: 0px;\
                margin-left: 0px;\
                width: 30px;\
                height:20px;\
                border: 1px solid #CED4DA;\
                color:#343541;\
                flex: 0 0 auto;\
                text-align: center;\
                font-size: 13px;\
                border-radius: 4px 0px 0px 4px">')

        render_arr.push("題目");
        render_arr.push('</div>')

        render_arr.push('<input type="text" class="problem_input" \
            value= "' + str.replace(/'/g,"&apos;").replace(/"/g,'&quot;').replace(/,/g,'').replace(/\.$/g,'') + '"\
            style="margin: 5px;\
                margin-top: 0px;\
                margin-left: -5px;\
                height:20px;\
                border: 1px solid #CED4DA;\
                background: #FFFFFF;\
                color: #000000;\
                border-left: 0.1px;\
                flex: 1 1 auto;\
                padding-left: 5px;\
                border-radius: 0px 4px 4px 0px">')

        render_arr.push('</div>');

        render_arr.push('<div class="answer_wrapper" \
            style="\
                display: flex;\
                flex: 1 1 auto;\
                min-width: 150px;">');

        render_arr.push('<div class="answer_info" \
            style="margin: 5px;\
                margin-top: 0px;\
                width: 30px;\
                height:20px;\
                border: 1px solid #CED4DA;\
                flex: 0 0 auto;\
                color:#343541;\
                text-align: center;\
                font-size: 13px;\
                border-radius: 4px 0px 0px 4px">')

        render_arr.push("答案");
        render_arr.push('</div>')

        render_arr.push('<input type="text" class="answer_input"\
            style="margin: 5px;\
                margin-top: 0px;\
                margin-left: -5px;\
                height:20px;\
                border: 1px solid #CED4DA;\
                background: #FFFFFF;\
                color: #000000;\
                border-left: 0.1px;\
                flex: 1 1 auto;\
                padding-left: 5px;\
                border-radius: 0px 4px 4px 0px">')

        render_arr.push('</div>');

        render_arr.push("</div>");

        let prev_elem = null;
        let is_last_elem = true;

        for (let elem of $('.chosen_word').toArray()) {
            if (parseInt($(elem).data('index')) > index) {
                is_last_elem = false;
                break;
            }
            if (parseInt($(elem).data('index')) === index) {
                return;
            }
            prev_elem = elem;
        }

        if (prev_elem === null) {
            $('#sentence_region').after(render_arr.join('\n'))
        } else {
            $(prev_elem).after(render_arr.join('\n'))
        }

    }

    async function get_main_status() {
        return new Promise(async (resolve,reject) => {
            chrome.runtime.sendMessage({
                type: "get_main_status",
            }, function (response) {
                return resolve(response.status);
            });
        })
    }

    document.onmouseup = async function(e) {
        let status = await get_main_status();
        if (!hover_on_display_region() && status === "open") {
            displaySelectionText(e);
        }
    };

    document.onselectionchange = async function(e) {
        let status = await get_main_status();
        if (!hover_on_display_region() && status === "open") {
            getSelectionText();
        }
    };

    document.onmousedown = async function(e) {
        let status = await get_main_status();
        if (!hover_on_display_region() && status === "open") {
            getSelectionText();
        }
    }

})();
