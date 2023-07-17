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
    let word_render_arr = [];
    for (let word of word_list) {
        word_render_arr.push('<li class="list-group-item problem_item">');
        word_render_arr.push(construct_problem_item(word));
        word_render_arr.push('</li>');
    }
    $("#problem_list").append(word_render_arr.join("\n"));
}

function construct_problem_item(word) {
    let item_render_arr = [];
    item_render_arr.push('<div class="row">');

    item_render_arr.push('<div class="input-group input-group-sm col-sm-5">');
    item_render_arr.push('<div class="input-group-prepend">');
    item_render_arr.push('<span class="input-group-text">題目</span>');
    item_render_arr.push('</div>');
    item_render_arr.push('<input type="text" class="form-control" value="'+word+'" readonly>');
    item_render_arr.push('</div>');

    item_render_arr.push('<div class="input-group input-group-sm col-sm-5">');
    item_render_arr.push('<div class="input-group-prepend">');
    item_render_arr.push('<span class="input-group-text">答案</span>');
    item_render_arr.push('</div>');
    item_render_arr.push('<input type="text" class="form-control answer_input">');
    item_render_arr.push('</div>');

    item_render_arr.push('</div>');
    return item_render_arr.join('\n');
}

function construct_problem_text() {
    let word_list = "{{word_list}}".split(',');
    let word_set = new Set(word_list);
    let text_render_arr = [];
    if ("{{pos_list}}".length === 0) {
        let sentence_word_list = "{{sentence}}".split(/\s+/);
        for (let word of sentence_word_list) {
            if (word_set.has(word)) {
                text_render_arr.push('<span style="text-decoration:underline; color:red;">'+word+'</span>');
            } else {
                text_render_arr.push('<span>'+word+'</span>');
            }
        }
    } else {
        let pos_list = "{{pos_list}}".split(',').map(x => parseInt(x));
        let pos_set = new Set(pos_list);
        let sentence_word_list = "{{sentence}}".split(/\s+/);
        for (let [index,word] of sentence_word_list.entries()) {
            if (pos_set.has(index)) {
                text_render_arr.push('<span style="text-decoration:underline; color:red;">'+word+'</span>');
            } else {
                text_render_arr.push('<span>'+word+'</span>');
            }
        }
    }
    $("#problem_text").append(text_render_arr.join("\n"));

}
construct_problem_text();
construct_problem_list();
</script>

