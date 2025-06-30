import Swal from 'sweetalert2';
import { G, domain_url, local } from '@orian/utils';
export function noServer() {
    $.confirm({
        title: '<span style="font-size: 16px;color: #ff0101;"> <i class="fa fa-exclamation-circle"></i> ' + G.mgs.errors.server_not_found + ' </span> <hr> <span style="font-size: 13px;color: #ff0101;"> Check your internet connection or try reload the page </span>',
        content: '',
        buttons: {
            confirm: {
                text: 'OK',
                btnClass: 'px-3 py-1 text-white bg-cyan-500 rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-500',
                action: () => { },
            },
        },
    });
}

export function scriptError(xhr) {
    const { status, responseJSON, responseText } = xhr;
    if (local) {
        if (responseJSON !== undefined) {
            scriptErrorAlert(responseJSON?.message);
        } else if (status == 500) {
            Swal.fire({
                html: '<div class="text-start text-xs">' + responseText + '</div>',
                confirmButtonText: G.mgs.btns.close,
            });
        } else if (status !== 422) {
            Swal.fire({
                html: '<div class="text-start text-xs">' + responseText?.message + '</div>',
                confirmButtonText: G.mgs.btns.close,
            });
        }
    }
    if (status == 422) {
        const res = JSON.parse(responseText);
        if (res?.errors !== undefined) {
            let errorHtml = '<ul class="text-danger text-start text-xs" style="margin-left: 1rem;">';
            for (const field in res.errors) {
                res.errors[field].forEach(msg => {
                    errorHtml += `<li>${msg}</li>`;
                });
            }
            errorHtml += '</ul>';
            Swal.fire({
                html: errorHtml,
                confirmButtonText: G.mgs.btns.close,
            });
        } else if (res?.message !== undefined) {
            Swal.fire({
                html: '<div class="text-start text-xs">' + res?.message + '</div>',
                confirmButtonText: G.mgs.btns.close,
                width: '800px',
            });
        }
    }

}
export function scriptErrorAlert(message) {
    Swal.fire({
        html: '<div class="text-start text-xs text-xs text-red-600">' + message + '</div>',
        confirmButtonText: G.mgs.btns.close,
    });
    // $.confirm({
    //     title: '<span style="font-size: 14px;color: #ff0101;"> <i class="fa fa-exclamation-circle"></i> ' + G.mgs.errors.server_wrong + ' </span>',
    //     content: '<span style="font-size: 12px;color: black;"> <i class="fa fa-exclamation-circle"></i> ' + message + ' </span>',
    //     buttons: {
    //         confirm: {
    //             text: 'OK',
    //             btnClass: 'px-3 py-1 text-white bg-cyan-500 rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-500',
    //             action: () => { },
    //         },
    //     },
    // });
}
export function inflateSuccess(msg, r = null) {
    if (msg != null) {
        var d = '<div class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400">' + msg + '</div>';
        $('#inflate').append(d);
    }
    var t = setTimeout(function () {
        $('#inflate').html('');
        clearTimeout(t);
        $('#theGlobalLoader').removeClass('activeGlobalLoader').css({ display: 'none' });
    }, 500);
}

export function inflateRequire(msg) {
    if (msg != null) {
        var d = '<div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">' + msg + '</div>';
        $('#inflate').append(d);
    }
    var t = setTimeout(function () {
        $('#inflate').html('');
        clearTimeout(t);
        $('#theGlobalLoader').removeClass('activeGlobalLoader').css({ display: 'none' });
    }, 500);
}

export function hideLoader() {
    $('#theGlobalLoader').removeClass('activeGlobalLoader').css({ display: 'none' });
}

export function displayAllErrors(op) {
    const { response = {}, page = 'addPage', server = false } = op;
    var err = G.mgs.errors.inflate_error;
    var big_err = G.mgs.errors.action_error;
    if (server) {
        $('#defaultPage').addClass('block').removeClass('hidden');
        $('#' + page).addClass('hidden').removeClass('block');
    }
    if (response.bigError) {
        var ele = '<div style="margin-bottom: 10px;font-size: 14px;font-weight:300;"><ul style="padding-left: 20px;display:flex;flex-direction:column;gap:2"><li style="color:red;">' + big_err + '</li>';
        for (var i = 0; i < response.bigErrors.length; i++) {
            ele += '<li style="color:red;text-decoration:none;">' + response.bigErrors[i] + '</li>';
        }
        ele += '</ul></div> ';
        inflateRequire(G.mgs.errors.action_error);
        $('#showErros').html(ele);
        $('#errorBase').addClass('activateErrors').fadeIn(500);
        $('#theGlobalLoader').removeClass('activeGlobalLoader').css({ display: 'none' });
    } else {
        if (response.noUpdate) {
            $('#theGlobalLoader').removeClass('activeGlobalLoader').css({ display: 'none' });
            noUpdate(op);
        } else {
            jsonShow(response.errors);
            $('#theGlobalLoader').removeClass('activeGlobalLoader').css({ display: 'none' });
            if (response.msg != undefined) {
                if (!response.partial) {
                    inflateRequire(err + ' <br> ' + response.msg);
                }
            } else {
                if (!response.partial) {
                    inflateRequire(err);
                }
            }
        }
    }
}
export function showErrorNormal(errors) {
    for (var k in errors) {
        if (Object.hasOwnProperty.call(errors, k)) {
            $('#' + k + '_error')
                .addClass('text-red-600')
                .html(errors[k]);
        }
    }
}

export function jsonShow(errors) {
    for (var k in errors) {
        if (Object.hasOwnProperty.call(errors, k)) {
            let hasAr = k.split('.');
            if (hasAr.length == 1) {
                $('#' + k + '_error')
                    .addClass('text-red-600')
                    .html(errors[k][0]);
            } else {
                $('#' + hasAr[0] + '\\.' + hasAr[1] + '_error')
                    .addClass('text-red-600')
                    .html(errors[k][0]);
            }
        }
    }
}

export function noUpdate(op) {
    const { response = {} } = op;
    Swal.fire({
        html: response.title,
        confirmButtonText: G.mgs.btns.close,
    });
}

export function showAlert(title, content) {
    Swal.fire({
        title: title,
        html: content,
        confirmButtonText: G.mgs.btns.ok,
    });
}

export function timeoutReloadFull(url, t = 1200) {
    var p = setTimeout(function () {
        clearTimeout(p);
        window.location.href = url;
    }, t);
}

export function timeoutReload(url, t = 1200) {
    setTimeout(() => reload(url), t);
}

export function reload(url = null) {
    if (url == null) {
        window.location.reload();
    } else {
        window.location.href = domain_url + url;
    }
}
