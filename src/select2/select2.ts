// import $ from 'jquery';
// import $ from '@orians/core/jquery';
import 'select2';

interface MultiSelectOptions {
    element?: string;
    tags?: boolean;
    placeholder?: string;
    [key: string]: any;
}
export function multi_select(op: MultiSelectOptions = {}) {
    const { element = 'select2', tags = false, placeholder = '' } = op;
    const selector = `.${element}`;
    $(selector).each(function (this: HTMLElement) {
        const $el = $(this);
        if ($el.hasClass('select2-hidden-accessible')) return;
        // @ts-ignore
        $el.select2({
            tags,
            tokenSeparators: [','],
            placeholder,
            allowClear: true,
            width: '100%',
        });
    });
}
