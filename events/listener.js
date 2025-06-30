export function clickToHide(handleEvent = undefined) {
    document.addEventListener('click', (e) => handleEvent(e));
}
export function backToTop(el, handleEvent = undefined) {
    $('#' + el)[0].addEventListener('click', () => handleEvent());
}

export function changeColor(op = {}) {
    const { elements = [], targets = [] } = op;
    elements.forEach((element, i) => {
        $('#' + element).on('input change', function () {
            $('#' + targets[i]).val($(this).val());
        });
    });
}