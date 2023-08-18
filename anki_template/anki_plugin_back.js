{{FrontSide}}

<script>
function add_answer() {
    var answer_list = "{{answer_list}}".split(',');
    var inputElems = document.querySelectorAll('.answer_input');

    for (var index = 0; index < inputElems.length; index++) {
        var inputElem = inputElems[index];
        inputElem.value = answer_list[index];
    }
}
add_answer();
</script>
