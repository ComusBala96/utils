import { getRequestData, hasInternet } from '../setup/envStp';
import { validate } from '../validations/validate';
import { send } from './send';

export function ajaxRequest(op = {}, callBack = undefined) {
    if (op == {}) {
        return 0;
    }
    const { type = 'n/a', element = 'n/a', validation = false } = op;
    if (validation) {
        validate(op, callBack);
    } else {
        switch (type) {
        case 'submit':
            $('#' + element).on('submit', function (e) {
                e.preventDefault();
                let formData = getRequestData({ ...op, form: this });
                if (hasInternet()) {
                    op.body = formData;
                    send(op, callBack);
                }
            });
            break;
        case 'request':
            if (hasInternet()) {
                send(op, callBack);
            }
            break;
        default:
            return 0;
        }
    }
}
