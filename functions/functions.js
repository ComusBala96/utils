import moment from 'moment/moment';
import { ajaxRequest } from '../utils';
import '../plugins/datetimepicker/js/jquery.datetimepicker.full.min.js';
export function pageAction(op = {}) {
    $('.viewAction').unbind('click');
    $('.viewAction').on('click', function () {
        const prop = JSON.parse($(this).attr('data-prop'));
        const { page = 'addPage', server = 'no', method = 'post', type = 'request', target = 'loadEdit', afterSuccess = { type: 'load_html' }, dataType = 'json' } = prop;
        $('.pages').addClass('hidden').removeClass('block');
        $('#' + page)
            .removeClass('hidden')
            .addClass('block');
        if (server == 'yes') {
            ajaxRequest({ ...prop, type, method, afterSuccess, target, dataType, server });
        }
    });
    $('.closeAction').unbind('click');
    $('.closeAction').on('click', function () {
        let target = $(this).attr('data-cl-action');
        $('.pages').addClass('hidden').removeClass('block');
        $('#' + target)
            .removeClass('hidden')
            .addClass('block');
    });
}

export function splitArray(arr, chunkSize) {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize));
    }
    return result;
}

export function escapeHtml(unsafe) {
    return unsafe?.toString().replace(/<[^>]*>/g, '').trim();
}
export function getNestedValue(path, object) {
    return path.split('.').reduce((o, i) => o[i], object);
}

export function getUrl() {
    const pathname = window.location.pathname.replace('/', '');

    let url;
    if (pathname.includes('/edit/')) {
        url = pathname.replace(/\/edit.*/, '');
    } else if (pathname.includes('/view/')) {
        url = pathname.replace(/\/view.*/, '');
    } else {
        url = pathname;
    }
    return url;
}

export function dp(op = {}) {
    $('.dp').datetimepicker({
        timepicker: false,
        scrollMonth: false,
        scrollInput: false,
        validateOnChange: false,
        ...op
    });
}
export function tp(op = {}) {
    $('.tp').datetimepicker({
        datepicker: false,
        showSecond: false,
        validateOnBlur: false,
        validateOnChange: false,
        step: 5,
        ...op
    });
}
export function bdtp(op = {}) {
    $('.bdtp').datetimepicker({
        showSecond: false,
        validateOnBlur: false,
        validateOnChange: false,
        scrollMonth: false,
        scrollInput: false,
        maxDate: moment(),
        ...op
    });
}
export function adtp(op = {}) {
    $('.adtp').datetimepicker({
        showSecond: false,
        validateOnBlur: false,
        validateOnChange: false,
        scrollMonth: false,
        scrollInput: false,
        minDate: moment(),
        ...op
    });
}
export function dtp(op = {}) {
    $('.dtp').datetimepicker({
        showSecond: false,
        validateOnBlur: false,
        validateOnChange: false,
        scrollMonth: false,
        scrollInput: false,
        ...op
    });
}

export function createImageUrl(file) {
    return URL.createObjectURL(file);
}

export function dynamicDom(op) {
    var { clickId = '', domId = '', cloneId = '', addRemoveClass = '', labelClass = [], inputClass = [], errorClass = [], } = op;
    $('#' + clickId).on('click', function () {
        var html = $('#' + domId).html();
        var d = $(html).find('.' + addRemoveClass).html('<button type="button" class="deleteField mr-6 rounded-sm bg-body-blue px-2 py-1"><i class="fa fa-minus text-white"></i></button>').parent().parent().html();
        $('#' + cloneId).append('<div class="">' + d + '</div>');
        if (labelClass.length > 0) {
            for (let i = 0; i < labelClass.length; i++) {
                replaceLabelFor(labelClass[i]);
            }
        }
        if (inputClass.length > 0) {
            for (let i = 0; i < inputClass.length; i++) {
                replaceInputID(inputClass[i]);
            }
        }
        if (errorClass.length > 0) {
            for (let i = 0; i < errorClass.length; i++) {
                replaceErrorID(inputClass[i]);
            }
        }
        removeFiled('deleteField');
    });
}

function replaceLabelFor(className = '') {
    var collection = $(document).find('.' + className);
    if (collection.length > 0) {
        for (let i = 0; i < collection.length; i++) {
            collection[i].htmlFor = className.replace('_for', '') + '.' + i;
        }
    }
}
function replaceInputID(className = '') {
    var collection = $(document).find('.' + className);
    if (collection.length > 0) {
        for (let i = 0; i < collection.length; i++) {
            collection[i].id = className.replace('_file', '') + '.' + i;
        }
    }
}
function replaceErrorID(className = '') {
    var collection = $(document).find('.' + className + '_error');
    if (collection.length > 0) {
        for (let i = 0; i < collection.length; i++) {
            collection[i].id = className + '.' + i + '_error';
        }
    }
}
function removeFiled(removeClass) {
    $('.' + removeClass).on('click', function () {
        $(this).parent().parent().parent().remove();
    });
}

export function isValidUrl(value) {
    try {
        new URL(value);
        return true;
    } catch (_) {
        return false;
    }
}

export function getMimes(mimetypes) {
    return mimetypes.split(',')
        .map(type => type.split('/')[1])
        .join('|');
}