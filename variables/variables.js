import { ajaxRequest } from '../ajax/ajaxRequest';
import { showAlert } from '../errors/errors';
import { getDtData } from '../dataTable/dataTable';

export const domain_url = import.meta.env.VITE_APP_URL;
export const csrf_token = $('meta[name="_token"]').attr('content');
export const app_locale = $('meta[name="app_locale"]').attr('content');
export const local = import.meta.env.VITE_APP_LOCAL_ENV == 'local' ? true : false;
export const defaultDtSize = $('#dt_size').val() ?? 10;

export const G = {
    ed: {
        file_name: 'text',
        pdf: {
            orientation: 'landscape',
            size: 'A4',
            margin: [15, 75, 15, 20],
            left_mar: 15,
            right_mar: 15,
            display_base: 9.5,
            display_one: 7,
            display_two: 7.5,
            display_three: 8.5,
            display_four: 11.5,
        },
    },
    paths: () => {
        return {
            'summernote': 'storage/uploads/summernote/',
            'logo': 'storage/uploads/logo/',
            'news_main': 'storage/uploads/news/main/',
            'news_images': 'storage/uploads/news/additional/',
            'news_files': 'storage/uploads/news/file/',
            'loader': 'statics/images/loader.gif',
        };
    },
    CN: (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    l: $('#l').val(),
    deleteAll: (op) => {
        const { element = 'N/A', script = '/', extra = {}, api = [], dataType = 'json', type = 'request', afterSuccess = { type: 'inflate_redirect_response_data' }, tableLoadType = 'ajax' } = op;
        $('.' + element).unbind('click');
        $('.' + element).on('click', function () {
            let rows_selected = api.rows('.selected').data().toArray();
            if (rows_selected.length > 0) {
                let d = {};
                if (extra != 'no') {
                    d['extra'] = extra;
                }
                let bodyData = $(this).attr('data-bodyData') ?? null;
                if ($(this).attr('data-bodyData')) {
                    bodyData = JSON.parse(bodyData);
                    d = {
                        ...d,
                        bodyData,
                    };
                }
                let ids = [];
                if (tableLoadType == 'ajax') {
                    rows_selected.map((v, k) => {
                        ids.push(v?.id);
                    });
                } else {
                    rows_selected.map((v, k) => {
                        ids.push(v[0]);
                    });
                }
                d['ids'] = ids;
                ajaxRequest({
                    ...op,
                    element,
                    script,
                    body: d,
                    dataType,
                    type,
                    afterSuccess,
                });
            } else {
                showAlert(`<span class="text-red-600 text-base">${G.mgs.errors.no_data_selected}</span>`, '');
            }
        });
    },
    updateAll: (op = {}) => {
        const { element = 'N/A', script = '/', extra = {}, api = [], dataType = 'json', type = 'request', afterSuccess = { type: 'inflate_redirect_response_data' }, dataCols = [] } = op;
        $('.' + element).unbind('click');
        $('.' + element).on('click', function () {
            let d = {};
            if (extra != 'no') {
                d['extra'] = extra;
            }
            let colData = {};
            dataCols.items.map((colValue, colKey) => {
                colValue.data = getDtData(colValue.type, api, colValue.index, colValue.name);
                return colValue;
            });
            let keyDataItem = dataCols.items.find((value) => {
                return value.name == dataCols.key;
            });
            if (keyDataItem) {
                let keyData = keyDataItem.data;
                dataCols.items.map((colValue, colKey) => {
                    let dataArray = {};
                    colValue.data.map((value, key) => {
                        dataArray[keyData[key]] = value;
                    });
                    d[colValue.name] = dataArray;
                });
            }
            ajaxRequest({
                ...op,
                element,
                script,
                body: d,
                dataType,
                type,
                afterSuccess,
            });
        });
    },
    mgs: JSON.parse(document.getElementById('lang').value),
    digits: JSON.parse(document.getElementById('digits').value),
    attributes: JSON.parse(document.getElementById('attributes').value),
    pageLang: $('#pageLang').length > 0 ? JSON.parse($('#pageLang').val()) : null,
    lang: function (op = {}) {
        let ob = {};
        let lang = this.mgs;
        for (const langKey in lang) {
            if (Object.hasOwnProperty.call(lang, langKey)) {
                const langElement = lang[langKey];
                if (typeof langElement == 'object') {
                    for (const key in langElement) {
                        if (Object.hasOwnProperty.call(langElement, key)) {
                            const element = langElement[key].toString();
                            ob[key] = this.getMatchedString(element, op);
                        }
                    }
                }
                if (typeof langElement == 'string') {
                    ob[langKey] = this.getMatchedString(langElement, op);
                }
            }
        }
        return ob;
    },
    getMatchedString: function (element, op) {
        let str = element.replace(/:digits|:type|:attribute/gi, function (matched) {
            let s = op[matched.split(':')[1]];
            return s == void 0 ? matched : s;
        });
        return str;
    },
    isEmptyObject: (obj) => {
        for (let key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    },
    monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
