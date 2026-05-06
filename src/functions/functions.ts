// import $ from 'jquery';
// import $ from '@orians/core/jquery';
import moment from 'moment';
import { ajax, ajaxOptions } from '../ajax/ajax.js';

/* --------------------------------
PAGE ACTION
-------------------------------- */

export function pageAction(): void {
    $('.viewAction')
        .off('click')
        .on('click', function (this: HTMLElement) {
            const prop: ajaxOptions = JSON.parse(($(this).attr('data-prop') as string) || '{}');
            const { page = 'addPage', server = 'no', method = 'post', type = 'request', target = 'loadEdit', afterSuccess = { type: 'load_html' }, dataType = 'json' } = prop;
            $('.pages').addClass('hidden').removeClass('block');
            $('#' + page)
                .removeClass('hidden')
                .addClass('block');
            if (server === 'yes') {
                ajax({
                    ...prop,
                    type,
                    method,
                    afterSuccess,
                    target,
                    dataType,
                    server,
                });
            }
        });

    $('.closeAction')
        .off('click')
        .on('click', function (this: HTMLElement) {
            const target = $(this).attr('data-cl-action');
            $('.pages').addClass('hidden').removeClass('block');
            $('#' + target)
                .removeClass('hidden')
                .addClass('block');
        });
}

/* --------------------------------
ARRAY UTILS
-------------------------------- */

export function splitArray<T>(arr: T[], chunkSize: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize));
    }
    return result;
}

/* --------------------------------
HTML SAFE
-------------------------------- */

export function escapeHtml(value: unknown): string {
    return (
        value
            ?.toString()
            .replace(/<[^>]*>/g, '')
            .trim() ?? ''
    );
}

/* --------------------------------
OBJECT PATH ACCESS
-------------------------------- */

export function getNestedValue(path: string, object: Record<string, any>): any {
    return path.split('.').reduce((o, i) => (o ? o[i] : undefined), object);
}

/* --------------------------------
URL PARSER
-------------------------------- */

export function getUrl(): string {
    const pathname = window.location.pathname.replace('/', '');

    if (pathname.includes('/edit/')) {
        return pathname.replace(/\/edit.*/, '');
    }

    if (pathname.includes('/view/')) {
        return pathname.replace(/\/view.*/, '');
    }

    return pathname;
}

/* --------------------------------
DATE PICKERS
-------------------------------- */

type DatePickerOptions = Record<string, any>;
export function dp(op: DatePickerOptions = {}): void {
    // @ts-ignore
    $('.dp' as HTMLElement).datetimepicker({
        timepicker: false,
        scrollMonth: false,
        scrollInput: false,
        validateOnChange: false,
        ...op,
    });
}

export function tp(op: DatePickerOptions = {}): void {
    // @ts-ignore
    $('.tp' as any).datetimepicker({
        datepicker: false,
        step: 5,
        validateOnBlur: false,
        validateOnChange: false,
        ...op,
    });
}

export function bdtp(op: DatePickerOptions = {}): void {
    // @ts-ignore
    $('.bdtp' as any).datetimepicker({
        maxDate: moment(),
        scrollMonth: false,
        scrollInput: false,
        ...op,
    });
}

export function adtp(op: DatePickerOptions = {}): void {
    // @ts-ignore
    $('.adtp' as any).datetimepicker({
        minDate: moment(),
        scrollMonth: false,
        scrollInput: false,
        ...op,
    });
}

export function dtp(op: DatePickerOptions = {}): void {
    // @ts-ignore
    $('.dtp' as any).datetimepicker({
        scrollMonth: false,
        scrollInput: false,
        ...op,
    });
}

/* --------------------------------
IMAGE URL
-------------------------------- */

export function createImageUrl(file: File): string {
    return URL.createObjectURL(file);
}
export const urlToBase64 = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();

    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/* --------------------------------
URL VALIDATION
-------------------------------- */

export function isValidUrl(value: string): boolean {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

/* --------------------------------
MIME PARSER
-------------------------------- */

export function getMimes(mimetypes: string): string {
    return mimetypes
        .split(',')
        .map((type) => type.split('/')[1])
        .join('|');
}

/* --------------------------------
ENGLISH → BANGLA NUMBER
-------------------------------- */

export function enToBnNumber(input: number | string): string {
    const map: Record<string, string> = {
        '0': '০',
        '1': '১',
        '2': '২',
        '3': '৩',
        '4': '৪',
        '5': '৫',
        '6': '৬',
        '7': '৭',
        '8': '৮',
        '9': '৯',
    };

    return input
        .toString()
        .split('')
        .map((char) => map[char] ?? char)
        .join('');
}

/* --------------------------------
LIVE CLOCK
-------------------------------- */

export function Clock(): void {
    setInterval(() => {
        $('.clock').text(moment().format('MMMM Do, YYYY, h:mm:ss A'));
    }, 1000);
}
