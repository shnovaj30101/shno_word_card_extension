<div class="container mt-2">
    <div class="row justify-content-center">
        <div class="card mt-2 mb-2">
            <div class="card-header" id="problem_text">
            </div>

            <ul class="list-group list-group-flush" id='problem_list'>
            </ul>
        </div>
    </div>
</div>

<script>
function construct_problem_list() {
    let word_list = "{{word_list}}".split(',');
    var itemContainer = document.querySelector("#problem_list");

    for (let word of word_list) {
        var liContainer = document.createElement("li");
        liContainer.className = "list-group-item problem_item";
        construct_problem_item(word, liContainer);
        itemContainer.appendChild(liContainer);
    }
}

function construct_problem_item(word, liContainer) {
    var rowDiv = document.createElement("div");
    rowDiv.className = "row";

    var questionInputGroup = document.createElement("div");
    questionInputGroup.className = "input-group input-group-sm col-sm-5";

    var questionInputGroupPrepend = document.createElement("div");
    questionInputGroupPrepend.className = "input-group-prepend";

    var questionSpan = document.createElement("span");
    questionSpan.className = "input-group-text";
    questionSpan.textContent = "題目";

    var questionInput = document.createElement("input");
    questionInput.type = "text";
    questionInput.className = "form-control";
    questionInput.value = word;
    questionInput.readOnly = true;

    questionInputGroupPrepend.appendChild(questionSpan);
    questionInputGroup.appendChild(questionInputGroupPrepend);
    questionInputGroup.appendChild(questionInput);

    var answerInputGroup = document.createElement("div");
    answerInputGroup.className = "input-group input-group-sm col-sm-5";

    var answerInputGroupPrepend = document.createElement("div");
    answerInputGroupPrepend.className = "input-group-prepend";

    var answerSpan = document.createElement("span");
    answerSpan.className = "input-group-text";
    answerSpan.textContent = "答案";

    var answerInput = document.createElement("input");
    answerInput.type = "text";
    answerInput.className = "form-control answer_input";

    answerInputGroupPrepend.appendChild(answerSpan);
    answerInputGroup.appendChild(answerInputGroupPrepend);
    answerInputGroup.appendChild(answerInput);

    rowDiv.appendChild(questionInputGroup);
    rowDiv.appendChild(answerInputGroup);

    liContainer.appendChild(rowDiv);
}

function construct_problem_text() {
    var word_list = "{{word_list}}".split(',');
    var word_set = new Set(word_list);
    var text_render_arr = [];
    var problemText = document.querySelector("#problem_text");

    if ("{{pos_list}}".length === 0) {
        var sentence_word_list = "{{sentence}}".split(/\s+/);
        for (var word of sentence_word_list) {
            if (word_set.has(word)) {
                var span = document.createElement("span");
                span.style.textDecoration = "underline";
                span.style.color = "red";
                span.textContent = word + " ";
                text_render_arr.push(span);
            } else {
                var span = document.createElement("span");
                span.textContent = word + " ";
                text_render_arr.push(span);
            }
        }
    } else {
        var pos_list = "{{pos_list}}".split(',').map(x => parseInt(x));
        var pos_set = new Set(pos_list);
        var sentence_word_list = "{{sentence}}".split(/\s+/);
        for (var [index, word] of sentence_word_list.entries()) {
            if (pos_set.has(index)) {
                var span = document.createElement("span");
                span.style.textDecoration = "underline";
                span.style.color = "red";
                span.textContent = word + " ";
                text_render_arr.push(span);
            } else {
                var span = document.createElement("span");
                span.textContent = word + " ";
                text_render_arr.push(span);
            }
        }
    }

    text_render_arr.forEach(function(span) {
        problemText.appendChild(span);
    });

    var itemContainer = document.querySelector("#problem_list");
    if ("{{url}}".length > 0) {
        var liContainer = document.createElement("li");
        liContainer.className = "list-group-item problem_item";
        add_url("{{url}}", liContainer);
        itemContainer.appendChild(liContainer);
    }

    if ("{{remark}}".length > 0) {
        var liContainer = document.createElement("li");
        liContainer.className = "list-group-item problem_item";
        add_remark("{{remark}}", liContainer);
        itemContainer.appendChild(liContainer);
    }
}

function add_url(url, liContainer) {
    var rowDiv = document.createElement("div");
    rowDiv.className = "row";

    var questionInputGroup = document.createElement("div");
    questionInputGroup.className = "input-group input-group-sm col-sm-12";

    var questionInputGroupPrepend = document.createElement("div");
    questionInputGroupPrepend.className = "input-group-prepend";

    var questionSpan = document.createElement("span");
    questionSpan.className = "input-group-text";
    questionSpan.textContent = "網址";

    var questionInput = document.createElement("input");
    questionInput.type = "text";
    questionInput.className = "form-control";
    questionInput.value = url;
    questionInput.readOnly = true;

    questionInputGroupPrepend.appendChild(questionSpan);
    questionInputGroup.appendChild(questionInputGroupPrepend);
    questionInputGroup.appendChild(questionInput);

    rowDiv.appendChild(questionInputGroup);

    liContainer.appendChild(rowDiv);
}

function add_remark(remark, liContainer) {
    var rowDiv = document.createElement("div");
    rowDiv.className = "row";

    var questionInputGroup = document.createElement("div");
    questionInputGroup.className = "input-group input-group-sm col-sm-12";

    var questionInput = document.createElement("input");
    questionInput.type = "text";
    questionInput.className = "form-control";
    questionInput.value = "備註";
    questionInput.readOnly = true;

    questionInputGroup.appendChild(questionInput);

    rowDiv.appendChild(questionInputGroup);

    var questionInputGroup_2 = document.createElement("div");
    questionInputGroup_2.className = "input-group input-group-sm col-sm-12";

    var questionInput_2 = document.createElement("textarea");
    questionInput_2.type = "text";
    questionInput_2.className = "form-control";
    questionInput_2.value = remark.replace(/\\n/g, '\n');
    questionInput_2.readOnly = true;

    questionInputGroup_2.appendChild(questionInput_2);

    rowDiv.appendChild(questionInputGroup_2);

    liContainer.appendChild(rowDiv);
}

construct_problem_text();
construct_problem_list();

</script>
