import { app_locale, csrf_token, G } from '../variables/variables';

export function hasInternet() {
    var status = navigator.onLine;
    if (status) {
        return true;
    } else {
        $.alert('<span style="font-size: 16px;color: #ff0101;">' + G.mgs.errors.no_internet + '</span>');
        return false;
    }
}

export function getRequestData(op) {
    const { form = null, body = {} } = op;
    let data = null;
    if (form != null) {
        let fData = new FormData(form);
        fData.append('_token', csrf_token);
        fData.append('client', 'w');
        fData.append('lang', app_locale);
        data = fData;
    } else {
        body['client'] = 'w';
        data = body;
    }
    return data;
}

export function getMessageBags(rules, mgs) {
    let messages = {};
    let langOb = {};
    for (const key in rules) {
        if (Object.hasOwnProperty.call(rules, key)) {
            const element = rules[key];
            for (const mgsKey in element) {
                if (Object.hasOwnProperty.call(element, mgsKey)) {
                    const mgsElement = element[mgsKey];
                    let digits = G.digits[mgsElement];
                    if (digits !== void 0) {
                        langOb['digits'] = digits;
                    }
                    let attributes = G.attributes[mgsElement];
                    if (attributes !== void 0) {
                        langOb['attributes'] = attributes;
                    }
                }
            }
        }
    }
    for (const key in rules) {
        if (Object.hasOwnProperty.call(rules, key)) {
            messages[key] = G.lang(langOb);
        }
    }
    return messages;
}
export function fReset(f) {
    $('#' + f)[0].reset();
}
