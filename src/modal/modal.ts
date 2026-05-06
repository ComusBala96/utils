// import $ from 'jquery';
// import $ from '@orians/core/jquery';
import { domain_url, config, local } from '../config/config.js';
import { ajax, inflateSuccess } from '../ajax/ajax.js';

/* --------------------------------
Types
-------------------------------- */

interface ModalResponse {
    success: boolean;
    data?: {
        extraData?: {
            inflate?: string;
            redirect?: string;
        };
        view?: string;
        [key: string]: any;
    };
}

interface ActionModalOptions {
    element?: string;
    script?: string;
    body?: Record<string, any>;
    title?: string;
    modalSize?: string;
    modalCallback?: string;
    globLoader?: boolean;
    response?: ModalResponse;
    [key: string]: any;
}

/* --------------------------------
Modal Loader
-------------------------------- */
export function actionModal(op: ActionModalOptions = {}): void {
    const { element = 'NA', script = '/', body = {}, title = 'No title provided' } = op;
    /* loading UI */
    $('.modal-body').html(`
        <div class="w-full flex justify-center items-center">
            <img src="${domain_url + config.paths.loader}" 
            style="width:20px;height:20px;"> Loading...
        </div>
    `);

    ajax({ ...op, element, script, body, dataType: 'json', type: 'request', target: element, title, noLoaderImg: true }, (op) => {
        const type = typeof op;
        if (local) {
            console.log(op);
        }
        if (type === 'object') {
            const { response, title, modalCallback = undefined, globLoader = true } = op;
            if (response.success) {
                const { extraData = { inflate: config?.lang()?.no_message_return, redirect: window.location.href }, view = 'reached' } = response.data;
                if (globLoader) {
                    inflateSuccess(extraData?.inflate);
                }
                $('.modal-title').html(title);
                $('.modal-body').html(view);
                if (modalCallback) {
                    if (window[modalCallback]) {
                        (window as any)[modalCallback](response);
                    }
                }
            }
        } else {
            $('#theGlobalLoader').removeClass('activeGlobalLoader').css({ display: 'none' });
        }
    });
}
