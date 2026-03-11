import { app_locale, csrf_token, defaultDtSize, domain_url, enToBnNumber, local, } from '../utils';

/* -----------------------------
   DataTables Lazy Loader
----------------------------- */

let dtLib = null;

async function loadDataTables() {
    if (dtLib) return dtLib;

    const [DataTable] = await Promise.all([
        import('datatables.net-dt'),
        import('datatables.net-buttons-dt'),
        import('datatables.net-buttons/js/buttons.html5.mjs'),
        import('datatables.net-buttons/js/buttons.print.mjs'),
        import('datatables.net-responsive-dt'),
        import('datatables.net-searchbuilder-dt'),
        import('datatables.net-searchpanes-dt'),
    ]);

    dtLib = DataTable.default;

    return dtLib;
}

/* -----------------------------
   DataTables Language Cache
----------------------------- */

let dtLangCache = null;

async function loadDtLang() {
    if (dtLangCache) return dtLangCache;

    dtLangCache = await $.getJSON(
        domain_url + 'statics/locale/' + app_locale + '.json',
    );

    return dtLangCache;
}

/* -----------------------------
   AJAX DataTable
----------------------------- */

export async function makeAjaxDataTable(table, op = {}) {
    const DataTable = await loadDataTables();

    let f = {};
    let s = [];

    f.glob = op.glob == undefined ? false : op.glob;
    f.searching = op.searching == undefined ? true : op.searching;
    f.ordering = op.ordering == undefined ? false : op.ordering;
    f.paging = op.paging == undefined ? true : op.paging;
    f.info = op.info == undefined ? true : op.info;
    f.pageLength = op.pageLength === undefined ? defaultDtSize : op.pageLength;
    f.responsive = op.responsive == undefined ? true : op.responsive;
    f.bLengthChange = op.bLengthChange == undefined ? true : op.bLengthChange;
    f.stateSave = op.stateSave == undefined ? false : op.stateSave;
    f.cache = op.cache == undefined ? false : op.cache;

    f.url = op.url || '';
    f.columns = op.columns || [];
    f.body = op.body || {};
    f.disabled = op.disabled == undefined ? [] : op.disabled;

    f.pagingType = 'simple_numbers';

    f.language = await loadDtLang();

    if (op.select != undefined) {
        if (op.select) {
            s = [
                {
                    orderable: false,
                    targets: 0,
                    render: function (data, type, row) {
                        if (row?.select == 'no') {
                            return '';
                        }

                        return '<input type="checkbox" class="dt-checkboxes">';
                    },
                },
            ];
        }
    }

    f.selected = op.selected || [];

    let post_data = { _token: csrf_token, lang: app_locale };

    for (let key in f.body) {
        post_data[key] = f.body[key];
    }

    if (DataTable.isDataTable('#' + table)) {
        $('#' + table)
            .DataTable()
            .destroy();
    }

    if ($('#' + table).length > 0) {
        let dt = $('#' + table).DataTable({
            paging: f.paging,
            searching: f.searching,
            searchDelay: 500,
            serverSide: true,

            bStateSave: true,
            ordering: f.ordering,
            info: f.info,
            responsive: f.responsive,
            bLengthChange: f.bLengthChange,
            stateSave: f.stateSave,

            cache: f.cache,
            language: f.language,

            pageLength: f.pageLength,

            columnDefs: s,

            processing:
                '<span class="fa-stack fa-lg">\<i class="fa fa-spinner fa-spin fa-stack-2x fa-fw"></i>\</span>&nbsp;&nbsp;&nbsp;&nbsp;Processing ...',

            lengthMenu: [
                [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100, 500, 1000, 1500, 2000],
                [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100, 500, 1000, 1500, 2000],
            ],

            ajax: {
                type: 'POST',
                url: domain_url + f.url,

                data: post_data,

                dataSrc: function (data) {
                    op = { ...op, data: data, dataSrc: data.data };

                    if (local) console.log(data.data);

                    return data.data;
                },

                error: function (response) {
                    console.log(response);
                },
            },

            columns: f.columns,

            select: {
                style: 'multi',
                selector: 'td:first-child',
            },

            order: [[1, 'DESC']],

            drawCallback: function () {
                if (
                    $('#' + table + ' thead th:first-child input[type="checkbox"]')
                        .length === 0 &&
                    op.select
                ) {
                    $('#' + table + ' thead th:first-child').html(
                        '<input type="checkbox" class="dt-select-all">',
                    );
                }

                if (app_locale === 'bn') {
                    setTimeout(() => {
                        $('.dt-info').text(enToBnNumber($('.dt-info').text()));

                        if ($('.dt-paging-button').length > 0) {
                            $('.dt-paging-button').each(function () {
                                if (/^\d+$/.test($(this).text().trim())) {
                                    $(this).html(enToBnNumber($(this).text().trim()));
                                }
                            });
                        }
                    }, 10);
                }

                let api = this.api();

                if (typeof window[table] === 'function') {
                    window[table](table, api, op);
                }
            },
        });

        selectAction(table, dt, op);
    }
}

/* -----------------------------
   Normal DataTable
----------------------------- */

export async function makeDataTable(table, op = {}) {
    const DataTable = await loadDataTables();

    let f = {};
    let s = [];

    f.glob = op.glob == undefined ? false : op.glob;
    f.searching = op.searching == undefined ? true : op.searching;
    f.ordering = op.ordering == undefined ? false : op.ordering;
    f.paging = op.paging == undefined ? true : op.paging;
    f.info = op.info == undefined ? true : op.info;

    f.responsive = op.responsive == undefined ? true : op.responsive;
    f.lengthChange = op.lengthChange == undefined ? true : op.lengthChange;
    f.stateSave = op.stateSave == undefined ? false : op.stateSave;

    f.pageLength = op.pageLength === undefined ? defaultDtSize : op.pageLength;

    f.cache = op.cache == undefined ? false : op.cache;

    f.disabled = op.disabled == undefined ? [] : op.disabled;

    f.pagingType = 'simple_numbers';

    f.language = await loadDtLang();

    if (op.select != undefined) {
        if (op.select) {
            s = [
                {
                    targets: 0,

                    render: function (data) {
                        if (f.disabled.includes(parseInt(data))) {
                            return '';
                        }

                        return '<input type="checkbox" class="dt-checkboxes">';
                    },
                },
            ];
        }
    }

    if ($('#' + table).length > 0) {
        let dt = $('#' + table).DataTable({
            paging: f.paging,
            searching: f.searching,
            ordering: f.ordering,
            info: f.info,

            responsive: f.responsive,

            lengthChange: f.lengthChange,

            stateSave: f.stateSave,

            pageLength: f.pageLength,

            pagingType: f.pagingType,

            language: f.language,

            cache: f.cache,

            columnDefs: s,

            select: {
                style: 'multi',
            },

            order: [[0, 'DESC']],

            drawCallback: function () {
                if (
                    $('#' + table + ' thead th:first-child input[type="checkbox"]')
                        .length === 0
                ) {
                    $('#' + table + ' thead th:first-child').html(
                        '<input type="checkbox" class="dt-select-all">',
                    );
                }

                if (app_locale === 'bn') {
                    setTimeout(() => {
                        $('.dt-info').text(enToBnNumber($('.dt-info').text()));
                    }, 10);
                }

                let api = this.api();

                if (typeof window[table] === 'function') {
                    window[table](table, api, op);
                }
            },
        });

        selectAction(table, dt, op);
    }
}

/* -----------------------------
   Row Select Logic
----------------------------- */

export function selectAction(table, dt, op) {
    $('#' + table + ' tbody').on('click', 'input[type="checkbox"]', function (e) {
        let $row = $(this).closest('tr');

        if (this.checked) {
            $row.addClass('selected');
        } else {
            $row.removeClass('selected');
        }

        showSelected(dt, op);

        e.stopPropagation();
    });

    $('#' + table + ' thead th:first-child').on(
        'click',
        'input[type="checkbox"]',
        function (e) {
            let cb = $('#' + table + ' tbody input[type="checkbox"]');

            if (this.checked) {
                cb.prop('checked', true);
                cb.closest('tr').addClass('selected');
            } else {
                cb.prop('checked', false);
                cb.closest('tr').removeClass('selected');
            }

            showSelected(dt, op);

            e.stopPropagation();
        },
    );
}

/* -----------------------------
   Show Selected Rows
----------------------------- */

export function showSelected(dt, op = {}) {
    let count = dt.rows('.selected').data().length;

    if (count == 0) {
        $('#show_selected').html('');
        $('#show_selected_base').addClass('hidden');
    } else {
        let lang = dt.settings()[0].oLanguage;

        let text = lang.select.aria.rowCheckbox.replace('_COUNT_', count);

        $('#show_selected_base').removeClass('hidden');

        $('#show_selected').html(app_locale == 'bn' ? enToBnNumber(text) : text);
    }

    if (op?.onSelectRows) {
        op.onSelectRows(dt, op);
    }
}

/* -----------------------------
   Get Column Data
----------------------------- */

export function getDtData(type, dt, col, c) {
    let data = [];

    dt.column(col)
        .nodes()
        .to$()
        .each(function () {
            switch (type) {
                case 'input':
                    data.push(
                        $(this)
                            .find('.' + c)
                            .val(),
                    );
                    break;

                case 'td':
                    data.push($(this).text().trim());
                    break;
            }
        });

    return data;
}
