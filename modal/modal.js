import { inflateSuccess } from '../errors/errors';
import { ajaxRequest, domain_url, G, local } from '../utils';

export function actionModal(op = {}) {
    const { element = 'NA', script = '/', body = {}, title = 'No title provided', modalSize = undefined } = op;
    $('.modal-body').html('<div class="w-full flex justify-center items-center"><img src="' + domain_url + G.paths().loader + '" style="width: 20px;height:20px;"> Loading...</div>');
    // let modalSizeClass = "modal-dialog modal-xl";
    // if (modalSize) {
    //     modalSizeClass = `modal-dialog modal-${modalSize}`;
    //     $(".modal-dialog").removeClass().addClass(modalSizeClass);
    // }
    ajaxRequest({
        ...op,
        element,
        script,
        body,
        dataType: 'json',
        type: 'request',
        target: element,
        title,
        noLoaderImg: true
    }, (op) => {
        let type = typeof (op);
        if (local) {
            console.log(op);
        }
        if (type === 'object') {
            const { response, title, modalCallback = undefined, globLoader = true } = op;
            if (response.success) {
                let { extraData = { inflate: G?.lang()?.no_message_return, redirect: window.location.href }, view = 'reached' } = response.data;
                if (globLoader) {
                    inflateSuccess(extraData?.inflate);
                }
                $('.modal-title').html(title);
                $('.modal-body').html(view);
                if (modalCallback) {
                    if (window[modalCallback]) {
                        window[modalCallback](response);
                    }
                }
            }
        } else {
            $('#theGlobalLoader').removeClass('activeGlobalLoader').css({ 'display': 'none' });
        }
    });
}