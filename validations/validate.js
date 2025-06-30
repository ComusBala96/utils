import { send } from '../ajax/send';
import { getMessageBags, hasInternet } from '../setup/envStp';
import { app_locale, csrf_token, G } from '../variables/variables';

export function validate(op = {}, callBack) {
    const { element = 'no', rules = {}, messages = {}, afterValidation = undefined } = op;
    let common_message = getMessageBags(rules, G.mgs);
    $('#' + element).validate({
        rules: rules,
        messages: G.isEmptyObject(messages) ? common_message : messages,
        errorElement: 'em',
        errorPlacement: function (error, element) {
            error.addClass('text-red-600');
            if (element.prop('type') === 'checkbox') {
                error.insertAfter(element.next('label'));
            } else {
                error.insertAfter(element);
            }
        },
        highlight: function (element, errorClass, validClass) {
            $(element).addClass('border-yellow-400 placeholder:text-red-600 focus:border-yellow-400').removeClass('border-stroke placeholder:text-black focus:border-primary');
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).addClass('border-stroke placeholder:text-black focus:border-primary').removeClass('border-yellow-400 placeholder:text-red-600 focus:border-yellow-400');
        },
        submitHandler: function (form) {
            if (afterValidation) {
                afterValidation(form, op);
            } else {
                let data = new FormData(form);
                data.append('_token', csrf_token);
                data.append('client', 'w');
                data.append('lang', app_locale);
                if (hasInternet()) {
                    op.body = data;
                    send(op, callBack);
                }
            }
            return false;
        },
    });
}
