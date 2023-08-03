{{FrontSide}}

<script>
function add_answer() {
    let answer_list = "{{answer_list}}".split(',');
    for (let [index,input_elem] of $('.answer_input').toArray().entries()) {
        $(input_elem).val(answer_list[index]);
    }
}
add_answer();
</script>
