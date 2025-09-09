import { noServer, scriptError } from '../errors/errors';
import { domain_url, csrf_token, local } from '../variables/variables';

export function ajax(op = {}, callBack) {
    const { script = '/', body = {}, method = 'post', dataType = 'formData', target = 'loadEdit', server = false, globLoader = true, token = null } = op;
    let config = {
        method: method,
        url: domain_url + script,
        data: body,
        contentType: false,
        cache: true,
        processData: false,
    };
    if (dataType == 'json') {
        config.dataType = 'json';
        config.headers = {
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/json',
            Authorization: `Bearer ${csrf_token}`,
            'X-CSRF-Token': csrf_token,
        };
        config.data = JSON.stringify(body);
        config.contentType = 'application/json; charset=utf-8';
    }
    if (globLoader) {
        // $('#theGlobalLoader').addClass('activeGlobalLoader').css({ display: 'block' });
        $('#theGlobalLoader').show();
    }
    $('.error_view').html('');
    $.ajax(config)
        .done(function (response) {
            callBack({ ...op, response });
            return false;
        })
        .fail(function (xhr, status, error, req) {
            if (local) {
                console.log(xhr);
                console.log(status);
                console.log(error);
                console.log(req);
            }
            if (globLoader) {
                // $('#theGlobalLoader').removeClass('activeGlobalLoader').css({ display: 'none' });
                $('#theGlobalLoader').hide();
            }
            if (xhr.readyState == 0) {
                noServer();
            } else {
                scriptError(xhr);
            }
        });
}
