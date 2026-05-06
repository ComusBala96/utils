// import $ from 'jquery';
// import $ from '@orians/core/jquery';

// @ts-ignore
export const domain_url: string | undefined = import.meta.env.VITE_APP_URL;
export const csrf_token: string | undefined = $('meta[name="_token"]').attr('content');
export const app_locale: string | undefined = $('meta[name="app_locale"]').attr('content');
// @ts-ignore
export const local: boolean = import.meta.env.VITE_APP_LOCAL_ENV == 'local' ? true : false;
// @ts-ignore
export const defaultDtSize: number = Number($('#dtSize').val()) ?? import.meta.env.VITE_APP_DEFAULT_DT_SIZE;

type LangMap = {
    errors: Record<string, string>;
    confirm: string;
    btns: {
        [key: string]: string;
    };
} & Record<string, string | Record<string, string>>;

interface LangOptions {
    digits?: string | number;
    type?: string;
    attribute?: string;
    [key: string]: any;
}

function getJsonFromInput<T>(id: string): T {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (!el || !el.value || typeof el.value === 'string') return {} as T;
    return JSON.parse(el.value) as T;
}

export const config = {
    mgs: getJsonFromInput<LangMap>('lang'),
    digits: getJsonFromInput<Record<string, any>>('digits'),
    attributes: getJsonFromInput<Record<string, any>>('attributes'),
    pageLang: getJsonFromInput<Record<string, any>>('pageLang'),
    dtLang: getJsonFromInput<Record<string, any>>('dtLang'),
    paths: getJsonFromInput<Record<string, any>>('paths'),
    oldPaths: getJsonFromInput<Record<string, any>>('oldPaths'),
    metaImage: getJsonFromInput<Record<string, any>>('metaImage'),
    monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    lang(op: LangOptions = {}) {
        const ob: Record<string, string> = {};
        const lang = this.mgs;
        for (const langKey in lang) {
            const langElement = lang[langKey];
            if (typeof langElement === 'object') {
                for (const key in langElement) {
                    const element = String(langElement[key]);
                    ob[key] = this.getMatchedString(element, op);
                }
            } else if (typeof langElement === 'string') {
                ob[langKey] = this.getMatchedString(langElement, op);
            }
        }
        return ob;
    },
    getMatchedString(element: string, op: LangOptions) {
        return element.replace(/:digits|:type|:attribute/gi, (matched) => {
            const key = matched.split(':')[1];
            const value = op[key];

            return value === undefined ? matched : String(value);
        });
    },
    isEmptyObject(obj: object) {
        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    },
};
