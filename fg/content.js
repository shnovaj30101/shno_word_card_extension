
//let anki_word_card_addition_options = {};
let awca_options = {
    prefix: 'awca_'
};

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

    $(document).on('mouseover', '.'+awca_options.prefix+'delete_chosen_word', function () {
        $(this).css('background-color', '#EC5151');
        $(this).css('color', '#FFFFFF');
    });

    $(document).on('mouseout', '.'+awca_options.prefix+'delete_chosen_word', function () {
        $(this).css('background-color', '');
        $(this).css('color', '#EC5151');
    });

    $(document).on('click', '.'+awca_options.prefix+'delete_chosen_word', function () {
        for (let elem of $('.'+awca_options.prefix+'word_span').toArray()) {
            if ($(elem).data('index') === $(this).data('index')) {
                $(elem).css('color', '');
                $(elem).css("text-decoration","");
            }
        }
        $(this).parent().parent().remove();
    });

    $(document).on('click', '.'+awca_options.prefix+'word_span', function () {
        choose_word($(this), $(this).data('index'), $(this).data('word'));
    });

    $(document).on('click', '.'+awca_options.prefix+'answer_info', function () {
    });

    $(document).on('click', '#'+awca_options.prefix+'ensure_problem_btn', function () {
        let problem_data_arr = [];
        problem_data_arr.push(problem_text);

        let problem_input_arr = [];
        if ($('.'+awca_options.prefix+'chosen_word').toArray().length === 0) {
            alert("No word is chosen");
            return;
        }
        for (let elem of $('.'+awca_options.prefix+'chosen_word').toArray()) {
            let problem_input = $(elem).find('.'+awca_options.prefix+'problem_input').val();
            if (problem_input.length === 0) {
                alert("some problem input's length is zero");
                return;
            }
            problem_input_arr.push(problem_input);
        }
        problem_data_arr.push(problem_input_arr.join(','));

        let word_index_arr = [];
        for (let elem of $('.'+awca_options.prefix+'chosen_word').toArray()) {
            let word_index = $(elem).data('index');
            word_index_arr.push(word_index);
        }
        problem_data_arr.push(word_index_arr.join(','));

        let answer_input_arr = [];
        for (let elem of $('.'+awca_options.prefix+'chosen_word').toArray()) {
            let answer_input = $(elem).find('.'+awca_options.prefix+'answer_input').val();
            if (answer_input.length === 0) {
                alert("some answer input's length is zero");
                return;
            }
            answer_input_arr.push(answer_input);
        }
        problem_data_arr.push(answer_input_arr.join(','));

        //alert(problem_data_arr.join('\t'));

        chrome.runtime.sendMessage({
            type: "send_problem",
            problem: problem_data_arr.join('\t')
        }, function (response) {
            if (display_elem !== null) {
                document.body.removeChild(display_elem);
                display_elem = null;
            }
        });

    });


    function hover_on_display_region() {
        return document.getElementById(awca_options.prefix+"select_text_display_region") !== null &&
            document.getElementById(awca_options.prefix+"select_text_display_region").matches(':hover');
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
                z-index: 999999 !important;\
                background-color:#FAFAFA;\
                top: 0;\
                right: 0;");
            display_elem.setAttribute("id", awca_options.prefix+"select_text_display_region");

            document.body.appendChild(display_elem);
            construct_display_interface();
        }
    }

    function construct_display_interface() {
        let render_arr = [];
        render_arr.push('<div id="'+awca_options.prefix+'sentence_region" \
            style="border: 1px solid #CCCCCC;\
                margin: 15px;\
                border-radius: 4px 4px 0px 0px;\
                background-color: #F7F7F7;\
                padding: 10px;\
                font-size: 13px;\
                display:flex;">')

        render_arr.push('<div>')

        let word_list = problem_text.split(/\s+/);
        for (let i = 0 ; i < word_list.length ; i++) {
            let word_encode = word_list[i].replace(/'/g, "&apos;").replace(/"/g, '&quot;').replace(/&/g,"&amp;");
            render_arr.push('<span class="'+awca_options.prefix+'word_span" data-index="' + i.toString() + '" data-word="' + word_encode + '">' + word_list[i] + "</span>");
        }

        render_arr.push('</div>')

        render_arr.push('</div>')
        render_arr.push('<div id="'+awca_options.prefix+'ensure_problem_btn"\
            style="border-radius: 4px;\
                width: 50px;\
                text-align:center;\
                line-height: 25px;\
                height: 25px;\
                margin: 15px;\
                background-color: #6C747D;\
                color: #FFFFFF;\
                font-size:13px;\
                margin-top: -10px;\
                margin-bottom: 5px;">')
        render_arr.push('Ensure')
        render_arr.push('</div>')


        $('#'+awca_options.prefix+'select_text_display_region').append(render_arr.join('\n'))

        let display_elem = document.getElementById(awca_options.prefix+"select_text_display_region");
        let now_display_elem_width = display_elem.offsetWidth;
        display_elem.setAttribute(
                "style",
                "min-height: 100px;\
                width: " + now_display_elem_width.toString() + "px;\
                border: 0.5px solid #E0E0E0;\
                position: fixed;\
                z-index: 999999 !important;\
                background-color:#FAFAFA;\
                top: 0;\
                right: 0;"
        );
    }

    function choose_word(target_elem, index, str) {
        $(target_elem).css("color","red");
        $(target_elem).css("text-decoration","underline");
        let render_arr = [];
        render_arr.push('<div class="'+awca_options.prefix+'chosen_word" data-index="' + index + '" \
            style="border-bottom: 1px solid #CCCCCC;\
                padding-top: 5px;\
                display: flex;\
                flex-wrap: wrap;\
                border-top: 0.1px solid #CCCCCC;\
                border-left: 1px solid #CCCCCC;\
                border-right: 1px solid #CCCCCC;\
                margin: 15px;\
                margin-top: -15px">');

        render_arr.push('<div class="'+awca_options.prefix+'problem_wrapper" \
            style="\
                flex: 1 1 auto;\
                display: flex;\
                min-width: 120px;">');

        render_arr.push('<div class="'+awca_options.prefix+'delete_chosen_word" data-index="' + index.toString() + '"\
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

        render_arr.push('<div class="'+awca_options.prefix+'problem_info" \
            style="margin: 5px;\
                margin-top: 0px;\
                margin-left: 0px;\
                width: 30px;\
                height:20px;\
                border: 1px solid #CED4DA;\
                flex: 0 0 auto;\
                text-align: center;\
                font-size: 13px;\
                border-radius: 4px 0px 0px 4px">')

        render_arr.push("題目");
        render_arr.push('</div>')

        render_arr.push('<input type="text" class="'+awca_options.prefix+'problem_input" \
            value= "' + str.replace(/'/g,"&apos;").replace(/"/g,'&quot;').replace(/,/g,'').replace(/\.$/g,'') + '"\
            style="margin: 5px;\
                margin-top: 0px;\
                margin-left: -5px;\
                height:20px;\
                border: 1px solid #CED4DA;\
                border-left: 0.1px;\
                flex: 1 1 auto;\
                padding-left: 5px;\
                border-radius: 0px 4px 4px 0px">')

        render_arr.push('</div>');

        render_arr.push('<div class="'+awca_options.prefix+'answer_wrapper" \
            style="\
                display: flex;\
                flex: 1 1 auto;\
                min-width: 150px;">');

        render_arr.push('<div class="'+awca_options.prefix+'answer_info" \
            style="margin: 5px;\
                margin-top: 0px;\
                width: 30px;\
                height:20px;\
                border: 1px solid #CED4DA;\
                flex: 0 0 auto;\
                text-align: center;\
                font-size: 13px;\
                border-radius: 4px 0px 0px 4px">')

        render_arr.push("答案");
        render_arr.push('</div>')

        render_arr.push('<input type="text" class="'+awca_options.prefix+'answer_input"\
            style="margin: 5px;\
                margin-top: 0px;\
                margin-left: -5px;\
                height:20px;\
                border: 1px solid #CED4DA;\
                border-left: 0.1px;\
                flex: 1 1 auto;\
                padding-left: 5px;\
                border-radius: 0px 4px 4px 0px">')

        render_arr.push('</div>');

        render_arr.push("</div>");

        let prev_elem = null;
        let is_last_elem = true;

        for (let elem of $('.'+awca_options.prefix+'chosen_word').toArray()) {
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
            $('#'+awca_options.prefix+'sentence_region').after(render_arr.join('\n'))
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
