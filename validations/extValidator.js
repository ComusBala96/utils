import { G } from '../utils';

$.fn.textWidth = function (text, font) {
    if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $('<span>').hide().appendTo(document.body);
    $.fn.textWidth.fakeEl.text(text || this.val() || this.text()).css('font', font || this.css('font'));
    return $.fn.textWidth.fakeEl.width();
};
$.fn.textHeight = function (text, font) {
    if (!$.fn.textHeight.fakeEl) $.fn.textHeight.fakeEl = $('<span>').hide().appendTo(document.body);
    $.fn.textHeight.fakeEl.text(text || this.val() || this.text()).css('font', font || this.css('font'));
    return $.fn.textHeight.fakeEl.height();
};
$.validator.addMethod(
    'validateNumber',
    function (value, el, param) {
        if (value == '') {
            $.validator.messages.validateNumber = G?.lang()?.email_or_number;
            return false;
        } else if (!Number.isInteger(parseInt(value))) {
            if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
                $.validator.messages.validateNumber = G?.lang()?.email;
                return false;
            } else {
                $.validator.messages.validateNumber = '';
                return true;
            }
        } else if (value.length < 11) {
            $.validator.messages.validateNumber = G?.lang({ digits: G.digits['11'] || 0 })?.minlength;
            return false;
        } else if (value.length > 11) {
            $.validator.messages.validateNumber = G?.lang({ digits: G.digits['11'] || 0 })?.maxlength;
            return false;
        } else {
            $.validator.messages.validateNumber = '';
            return true;
        }
    },
    $.validator.messages.validateNumber,
);

$.validator.addMethod(
    'allowFile',
    function (value, element, param) {
        param = typeof param === 'string' ? param.replace(/,/g, '|') : 'png|jpe?g|gif';
        return this.optional(element) || value.match(new RegExp('\\.(' + param + ')$', 'i')) || value.indexOf('.') == -1;
    },
    $.validator.format('Please enter a value with a valid extension.'),
);

// $.validator.addMethod('filesize', function (value, element, param) {
//     return this.optional(element) || (element.files[0].size <= param)
// }, $.validator.format("File Size Exceded."));
