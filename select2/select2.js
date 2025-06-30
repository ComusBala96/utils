import '../plugins/select2/js/select2.min.js';
export function multi_select(op = {}) {
    const { element = 'select2', tags = false, placeholder = '' } = op;
    $('.' + element).select2({
        tags: tags,
        tokenSeparators: [',',],
        placeholder: placeholder,
        allowClear: true
    });
}