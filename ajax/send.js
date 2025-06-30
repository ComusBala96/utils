import { confirmAlert } from '../message/confirm';
import { success } from '../message/success';
import { ajax } from './ajax';

export function send(op, callBack) {
    const { confirm = false, afterSuccess = undefined, beforeSend = undefined } = op;
    if ((afterSuccess?.type && afterSuccess?.type == 'load_html' && afterSuccess?.reload) || afterSuccess?.type == 'api_response') {
        const { target = 'none' } = afterSuccess;
        $('#' + target).html('');
    }
    if (confirm) {
        confirmAlert(op, (op) => {
            ajax(op, (op) => {
                callBack ? callBack(op) : success(op);
            });
        });
    } else {
        if (beforeSend) {
            beforeSend(op, (op) =>
                ajax(op, (op) => {
                    callBack ? callBack(op) : success(op);
                }),
            );
        } else {
            ajax(op, (op) => {
                callBack ? callBack(op) : success(op);
            });
        }
    }
}
