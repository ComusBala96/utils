// import $ from 'jquery';
// import $ from '@orians/core/jquery';
import { app_locale, csrf_token, domain_url, config, local } from '../config/config.js';
import Swal from 'sweetalert2';
export type DataType = 'formData' | 'json';
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';
export type AjaxType = 'submit' | 'request' | 'n/a';
interface AfterSuccessOptions {
    type?: string;
    reload?: boolean;
    target?: string;
    afterLoad?: (op: ajaxOptions, response?: any) => undefined;
}
export interface ajaxOptions {
    select?: boolean;
    token?: string | null;
    globLoader?: boolean;
    confirm?: boolean;
    customConfirm?: boolean;
    confirmTitle?: string;
    confirmMessage?: string;
    type?: AjaxType;
    rules?: object;
    validation?: boolean;
    element?: string;
    script?: string;
    method?: HttpMethod;
    body?: object | FormData;
    dataType?: DataType;
    target?: string;
    server?: boolean | string;
    afterValidation?: (form: HTMLFormElement, op: ajaxOptions) => void;
    beforeSend?: (op: ajaxOptions, next: (op: ajaxOptions) => void) => undefined;
    afterLoad?: (op: ajaxOptions, response?: any) => undefined;
    afterSuccess?: AfterSuccessOptions;
    messages?: object;
    page?: string;
    form?: HTMLFormElement;
    [key: string]: any;
}
export function ajax(op: ajaxOptions = {}, callBack?: (op: ajaxOptions) => void): number | void {
    if (Object.keys(op).length === 0) {
        return 0;
    }

    const { type = 'n/a', element = 'n/a', validation = false } = op;

    if (validation) {
        validate(op, callBack);
        return;
    }
    switch (type) {
        case 'submit':
            $(`#${element}`).on('submit', function (this: HTMLElement, e: JQuery.SubmitEvent) {
                e.preventDefault();
                const form = $(this)[0] as HTMLFormElement;
                const formData = getRequestData({ ...op, form });
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
export function getRequestData(op: ajaxOptions) {
    const { form = null, body = {} } = op;
    if (form) {
        const data: FormData = new FormData(form);
        if (csrf_token && app_locale) {
            data.append('_token', csrf_token);
            data.append('client', 'w');
            data.append('lang', app_locale);
            return data;
        }
    }
    return {
        ...body,
        client: 'w',
        lang: app_locale,
    };
}
export function getMessageBags(rules: Record<string, any>) {
    const messages: Record<string, any> = {};
    const langOb: Record<string, any> = {};
    Object.values(rules).forEach((rule: any) => {
        Object.values(rule).forEach((value: any) => {
            const digits = config.digits?.[value];
            if (digits !== undefined) {
                langOb.digits = digits;
            }
            const attributes = config.attributes?.[value];
            if (attributes !== undefined) {
                langOb.attributes = attributes;
            }
        });
    });
    Object.keys(rules).forEach((key) => {
        messages[key] = config.lang(langOb);
    });
    return messages;
}
export function validate(op: ajaxOptions, callBack?: (op: ajaxOptions) => void): boolean | void {
    const { element, rules = {}, messages = {}, afterValidation } = op;
    const $form = $('#' + element);
    if (!$form.length) return;
    const commonMessages = getMessageBags(rules);
    // @ts-ignore
    $form.validate({
        rules,
        messages: config.isEmptyObject(messages) ? commonMessages : messages,
        errorElement: 'em',
        errorPlacement(error: HTMLFormElement, el: HTMLFormElement) {
            error.addClass('text-red-600');
            if (el.prop('type') === 'checkbox') {
                error.insertAfter(el.next('label'));
                return;
            }
            error.insertAfter(el);
        },
        highlight(el: HTMLFormElement) {
            $(el).addClass('border-yellow-400 placeholder:text-red-600 focus:border-yellow-400').removeClass('border-stroke placeholder:text-black focus:border-primary');
        },
        unhighlight(el: HTMLFormElement) {
            $(el).addClass('border-stroke placeholder:text-black focus:border-primary').removeClass('border-yellow-400 placeholder:text-red-600 focus:border-yellow-400');
        },
        submitHandler(form: HTMLFormElement) {
            if (afterValidation) {
                afterValidation(form, op);
                return false;
            }
            if (!hasInternet()) return false;
            const data = new FormData(form);
            if (csrf_token && app_locale) {
                data.append('_token', csrf_token);
                data.append('client', 'w');
                data.append('lang', app_locale);
            }
            send({ ...op, body: data }, callBack);
            return false;
        },
    });
}

export function hasInternet(): boolean {
    const status: boolean = navigator.onLine;
    if (status) return true;
    Swal.fire({ html: `<span style="font-size:16px;color:#ff0101;">${config.mgs.errors.no_internet}</span>` });
    return false;
}

export function send(op: ajaxOptions, callBack?: (op: ajaxOptions) => void): void {
    const { confirm = false, afterSuccess, beforeSend } = op;

    if ((afterSuccess?.type === 'load_html' && afterSuccess?.reload) || afterSuccess?.type === 'api_response') {
        const { target = 'none' } = afterSuccess || {};
        if (target !== 'none') {
            $(`#${target}`).html('');
        }
    }

    if (confirm) {
        confirmAlert(op, (op) => {
            ajaxHandler(op, (op) => {
                callBack ? callBack(op) : success(op);
            });
        });
    } else {
        if (beforeSend) {
            beforeSend(op, (op) =>
                ajaxHandler(op, (op) => {
                    callBack ? callBack(op) : success(op);
                }),
            );
        } else {
            ajaxHandler(op, (op) => {
                callBack ? callBack(op) : success(op);
            });
        }
    }
}

export function confirmAlert(op: ajaxOptions, callBack: (op: ajaxOptions) => void): void {
    const { element = 'n/a', confirmTitle = config.mgs.confirm, confirmMessage = '', customConfirm = false } = op;
    if (customConfirm) {
        switch (element) {
            default:
                Swal.fire({ title: `Case not found in confirm for ${element}` });
                break;
        }
        return;
    }
    Swal.fire({
        title: 'Are you sure?',
        text: confirmTitle || confirmMessage,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes',
    }).then((result) => {
        if (!result.isConfirmed) return;
        if (callBack) {
            callBack(op);
            return;
        }
        if (local) {
            console.warn(`No callback defined for confirm in ${element}`);
        }
    });
}

export function ajaxHandler<T = any>(op: ajaxOptions, callBack: (op: ajaxOptions) => void): void {
    const { script = '/', body = {}, method = 'post', dataType = 'formData', globLoader = true, token = null } = op;

    const config: JQuery.AjaxSettings = {
        method,
        url: domain_url + script,
        data: body,
        contentType: false,
        cache: true,
        processData: false,
    };

    if (dataType === 'json') {
        config.dataType = 'json';
        config.headers = {
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/json',
            Authorization: `Bearer ${token ?? csrf_token}`,
            'X-CSRF-Token': token ?? csrf_token,
        };

        config.data = JSON.stringify(body);
        config.contentType = 'application/json; charset=utf-8';
    }

    if (globLoader) {
        $('#theGlobalLoader').show();
    }

    $('.error_view').html('');

    $.ajax(config)
        .done((response: T) => {
            callBack({ ...op, response });
        })
        .fail((xhr: JQuery.jqXHR, status: string, error: string) => {
            if (local) {
                console.log(xhr);
                console.log(status);
                console.log(error);
            }

            if (globLoader) {
                $('#theGlobalLoader').hide();
            }

            if (xhr.readyState === 0) {
                noServer();
            } else {
                scriptError(xhr);
            }
        });
}
export function noServer() {
    Swal.fire({
        icon: 'error',
        html: '<span style="font-size: 16px;color: #ff0101;"> <i class="fa fa-exclamation-circle"></i> ' + config.mgs.errors.server_not_found + ' </span> <hr> <span style="font-size: 13px;color: #ff0101;"> Check your internet connection or try reload the page </span>',
        text: 'Something went wrong!',
    });
}
export function scriptError(xhr: any) {
    const { status, responseJSON, responseText } = xhr;
    if (local) {
        if (responseJSON !== undefined) {
            scriptErrorAlert(responseJSON?.message);
        } else if (status == 500) {
            Swal.fire({
                html: '<div class="text-start text-xs">' + responseText + '</div>',
                confirmButtonText: config.mgs.btns.close,
            });
        } else if (status !== 422) {
            Swal.fire({
                html: '<div class="text-start text-xs">' + responseText?.message + '</div>',
                confirmButtonText: config.mgs.btns.close,
            });
        }
    }
    if (status == 422) {
        const res = JSON.parse(responseText);
        if (res?.errors !== undefined) {
            let errorHtml = '<ul class="text-danger text-start text-xs" style="margin-left: 1rem;">';
            for (const field in res.errors) {
                res.errors[field].forEach((msg: string) => {
                    errorHtml += `<li>${msg}</li>`;
                });
            }
            errorHtml += '</ul>';
            Swal.fire({
                html: errorHtml,
                confirmButtonText: config.mgs.btns.close,
            });
        } else if (res?.message !== undefined) {
            Swal.fire({
                html: '<div class="text-start text-xs">' + res?.message + '</div>',
                confirmButtonText: config.mgs.btns.close,
                width: '800px',
            });
        }
    }
}
export function scriptErrorAlert(message: string) {
    Swal.fire({
        html: '<div class="text-start text-xs text-xs text-red-600">' + message + '</div>',
        confirmButtonText: config.mgs.btns.close,
    });
}
export function success(op: ajaxOptions): void {
    const { response = null, element = 'no', customHideLoader = true, status = true, afterSuccess = {} } = op;
    $(`#${element} label span`).html('').removeClass('text-red-600');
    if (local) {
        console.log(response);
    }
    if (!response || typeof response !== 'object') {
        $('#theGlobalLoader').removeClass('activeGlobalLoader').hide();
        return;
    }
    if (!response.success) {
        displayAllErrors(op);
        return;
    }
    const extraData = response.data ?? {
        inflate: config?.lang()?.no_message_return,
        redirect: window.location.href,
    };
    const view = response.data?.view ?? '';
    const { afterLoad, target = 'editView', type } = afterSuccess;
    const obj = { ...op, response };
    switch (type) {
        case 'inflate_response_data':
            inflateSuccess(extraData.alert);
            break;

        case 'inflate_reset_response_data':
            inflateSuccess(extraData.alert);
            fReset(element);
            break;

        case 'inflate_redirect_response_data':
            inflateSuccess(extraData.alert);
            timeoutReload(extraData.redirect, 400);
            break;

        case 'load_html':
            if (status) {
                inflateSuccess(extraData.alert);
            }
            $(`#${target}`).html(view);
            break;

        case 'api_response':
            if (customHideLoader) {
                hideLoader();
            }
            break;

        default:
            inflateSuccess(config?.lang()?.action_success);
            timeoutReload(extraData.redirect, 400);
    }
    if (afterLoad) {
        afterLoad(obj, response.data);
    }
}

export function displayAllErrors(op: ajaxOptions): void {
    const { response = {}, page = 'addPage', server = false } = op;
    const err = config.mgs.errors.inflate_error;
    const bigErr = config.mgs.errors.action_error;

    if (server) {
        $('#defaultPage').addClass('block').removeClass('hidden');
        $('#' + page)
            .addClass('hidden')
            .removeClass('block');
    }
    if (response.bigError) {
        let ele = `<div style="margin-bottom:10px;font-size:14px;font-weight:300;">
            <ul style="padding-left:20px;display:flex;flex-direction:column;gap:2">
            <li style="color:red;">${bigErr}</li>`;

        response.bigErrors?.forEach((e: HTMLElement) => {
            ele += `<li style="color:red;text-decoration:none;">${e}</li>`;
        });

        ele += '</ul></div>';

        inflateRequire(config.mgs.errors.action_error);
        $('#showErrors').html(ele);
        $('#errorBase').addClass('activateErrors').fadeIn(500);
        hideLoader();
    } else {
        if (response.noUpdate) {
            hideLoader();
            noUpdate(op);
        } else {
            jsonShow(response.errors || {});
            hideLoader();

            if (!response.partial) {
                inflateRequire(response.msg ? `${err}<br>${response.msg}` : err);
            }
        }
    }
}

export function inflateSuccess(msg: string | null): void {
    if (msg) {
        const d = `<div class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400">${msg}</div>`;
        $('#inflate').append(d);
    }

    const t = setTimeout(() => {
        $('#inflate').html('');
        clearTimeout(t);
        hideLoader();
    }, 500);
}

export function hideLoader(): void {
    $('#theGlobalLoader').removeClass('activeGlobalLoader').css({ display: 'none' });
}

export function fReset(formId: string) {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (form) form.reset();
}

export function timeoutReload(url: string, t = 1200): void {
    setTimeout(() => reload(url), t);
}

export function reload(url: string | null = null): void {
    if (!url) {
        window.location.reload();
    } else {
        window.location.href = domain_url + url;
    }
}

export function inflateRequire(msg: string) {
    if (msg) {
        const d = `<div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">${msg}</div>`;
        $('#inflate').append(d);
    }
    const t = setTimeout(() => {
        $('#inflate').html('');
        clearTimeout(t);
        hideLoader();
    }, 500);
}

export function noUpdate(op: ajaxOptions): void {
    const { response = {} } = op;
    Swal.fire({
        html: response.title,
        confirmButtonText: config.mgs.btns.close,
    });
}

export function jsonShow(errors: Record<string, string[]>) {
    for (const k in errors) {
        const parts = k.split('.');
        const id = parts.length === 1 ? `#${k}_error` : `#${parts[0]}\\.${parts[1]}_error`;
        $(id).addClass('text-red-600').html(errors[k][0]);
    }
}

export function showAlert(title: string, content: string) {
    Swal.fire({
        title,
        html: content,
        confirmButtonText: config.mgs.btns.ok,
    });
}
