import select2 from 'select2';
select2();
export function multi_select(op = {}) {
    const { element = 'select2', tags = false, placeholder = '' } = op;
    $('.' + element).select2({
        tags: tags,
        tokenSeparators: [',',],
        placeholder: placeholder,
        allowClear: true
    });
}