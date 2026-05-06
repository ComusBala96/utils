// import $ from 'jquery';
// import $ from '@orians/core/jquery';
import type { Api } from 'datatables.net';
import { app_locale, csrf_token, defaultDtSize, domain_url, local } from '../config/config.js';
import { enToBnNumber } from '../functions/functions.js';
import { ajax, AjaxType, DataType, showAlert } from '../ajax/ajax.js';
import { Lang } from '@orians/core';
export interface DataTableOptions {
    glob?: boolean;
    searching?: boolean;
    ordering?: boolean;
    paging?: boolean;
    info?: boolean;
    pageLength?: number;
    responsive?: boolean;
    lengthChange?: boolean;
    stateSave?: boolean;
    url?: string;
    columns?: any[];
    body?: Record<string, any>;
    disabled?: number[];
    select?: boolean;
    processing?: boolean;
    selected?: number[];
    res?: any;
    dataSrc?: any;
    data?: any;
    onSelectRows?: (dt: Api, op: DataTableOptions) => void;
}

let dtLib: any = null;

/* -----------------------------
   Lazy load DataTables
----------------------------- */
async function initDataTables() {
    if (dtLib) return dtLib;
    const [DataTable] = await Promise.all([import('datatables.net-dt'), import('datatables.net-responsive-dt')]);
    dtLib = DataTable.default;
    return dtLib;
}

/* -----------------------------
   AJAX DataTable
----------------------------- */
export async function loadDataTable(table: string, op: DataTableOptions = {}) {
    const DataTable = await initDataTables();

    const f: DataTableOptions = { glob: false, searching: true, ordering: false, paging: true, info: true, pageLength: defaultDtSize, responsive: true, lengthChange: true, stateSave: false, url: '', columns: [], body: {}, disabled: [], select: false, selected: [], processing: true, ...op };

    const columnDefs: any[] = [];

    if (f.select) {
        columnDefs.push({
            orderable: false,
            targets: 0,
            render: (row: any) => (row?.select === false ? '' : '<input type="checkbox" class="dt-checkboxes">'),
        });
    }

    const postData = { _token: csrf_token, lang: app_locale, ...f.body };

    if (DataTable.isDataTable(`#${table}`)) {
        $(`#${table}`).DataTable().destroy();
    }

    if (!$(`#${table}`).length) return;

    const dt = $(`#${table}`).DataTable({
        paging: f.paging,
        searching: f.searching,
        searchDelay: 500,
        serverSide: true,
        ordering: f.ordering,
        info: f.info,
        responsive: f.responsive,
        lengthChange: f.lengthChange,
        stateSave: f.stateSave,
        pageLength: f.pageLength,
        columnDefs,
        pagingType: 'simple_numbers',
        language: Lang.datatable,
        processing: f.processing,
        lengthMenu: [
            [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100, 500, 1000, 1500, 2000],
            [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100, 500, 1000, 1500, 2000],
        ],
        ajax: {
            type: 'POST',
            url: `${domain_url}${f.url}`,
            data: postData,
            dataSrc: (data: Record<string, any>) => {
                op = { ...op, data, dataSrc: data.data };
                if (local) console.log(data.data);
                return data.data;
            },
            error: (err: unknown) => console.log(err),
        },
        columns: f.columns,
        order: [[1, 'desc']],
        drawCallback: function () {
            if (!$(`#${table} thead th:first-child input[type="checkbox"]`).length && f.select) {
                $(`#${table} thead th:first-child`).html('<input type="checkbox" class="dt-select-all">');
            }
            if (app_locale === 'bn') {
                setTimeout(() => {
                    $('.dt-info').text(enToBnNumber($('.dt-info').text()));
                    $('.dt-paging-button').each(function (this: HTMLElement): void {
                        const txt = $(this).text().trim();
                        if (/^\d+$/.test(txt)) $(this).html(enToBnNumber(txt));
                    });
                }, 10);
            }
            const api = this.api();
            if (typeof (window as any)[table] === 'function') (window as any)[table](table, api, op);
        },
    });

    selectAction(table, dt, f);
}
export async function makeDataTable(table: string, op: DataTableOptions = {}) {
    const DataTable = await initDataTables();

    const f: DataTableOptions = {
        glob: false,
        searching: true,
        ordering: false,
        paging: true,
        info: true,
        pageLength: defaultDtSize,
        responsive: true,
        lengthChange: true,
        stateSave: false,
        disabled: [],
        select: false,
        processing: true,
        ...op,
    };

    const columnDefs: any[] = [];

    if (f.select) {
        columnDefs.push({
            targets: 0,
            render: function (data: any) {
                if (typeof f.disabled !== 'undefined') {
                    return f.disabled.includes(Number(data)) ? '' : '<input type="checkbox" class="dt-checkboxes">';
                } else {
                    return '';
                }
            },
        });
    }

    if (DataTable.isDataTable(`#${table}`)) {
        $(`#${table}`).DataTable().destroy();
    }

    if (!$(`#${table}`).length) return;

    const dt = $(`#${table}`).DataTable({
        paging: f.paging,
        searching: f.searching,
        ordering: f.ordering,
        info: f.info,
        responsive: f.responsive,
        lengthChange: f.lengthChange,
        stateSave: f.stateSave,
        pageLength: f.pageLength,
        pagingType: 'simple_numbers',
        processing: f.processing,
        language: Lang.datatable,
        lengthMenu: [
            [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100, 500, 1000, 1500, 2000],
            [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100, 500, 1000, 1500, 2000],
        ],
        columnDefs,
        order: [[0, 'desc']],
        drawCallback: function () {
            if ($(`#${table} thead th:first-child input[type="checkbox"]`).length === 0) {
                $(`#${table} thead th:first-child`).html('<input type="checkbox" class="dt-select-all">');
            }

            if (app_locale === 'bn') {
                setTimeout(() => {
                    $('.dt-info').text(enToBnNumber($('.dt-info').text()));
                }, 10);
            }

            const api: Api = this.api();
            const win = window as unknown as Record<string, any>;
            if (typeof win[table] === 'function') {
                win[table](table, api, f);
            }
        },
    });

    selectAction(table, dt, f);
}
/* -----------------------------
   Row Select Logic
----------------------------- */
export function selectAction(table: string, dt: Api, op: DataTableOptions) {
    const $table = $(`#${table}`);
    $table.find('tbody').on('click', 'input[type="checkbox"]', function (this: any, e: JQuery.ClickEvent<HTMLElement>) {
        const $row = $(this).closest('tr');
        this.checked ? $row.addClass('selected') : $row.removeClass('selected');
        showSelected(dt, op);
        e.stopPropagation();
    });

    $table.find('thead th:first-child').on('click', 'input[type="checkbox"]', function (this: any, e: JQuery.ClickEvent<HTMLElement>) {
        const cb = $table.find('tbody input[type="checkbox"]');
        this.checked ? cb.prop('checked', true).closest('tr').addClass('selected') : cb.prop('checked', false).closest('tr').removeClass('selected');
        showSelected(dt, op);
        e.stopPropagation();
    });
}

/* -----------------------------
   Show Selected Rows
----------------------------- */
export function showSelected(dt: Api, op: DataTableOptions = {}) {
    const count = dt.rows('.selected').data().length;
    if (count === 0) {
        $('#show_selected').html('');
        $('#show_selected_base').addClass('hidden');
    } else {
        const dtLang = dt.settings()[0].oLanguage;
        console.log(dtLang);
        
        const text = dtLang.select.aria.rowCheckbox.replace('_COUNT_', count);
        $('#show_selected_base').removeClass('hidden');
        $('#show_selected').html(app_locale === 'bn' ? enToBnNumber(text) : text);
    }
    if (op.onSelectRows) op.onSelectRows(dt, op);
}

/* -----------------------------
   Get Column Data
----------------------------- */
export function getDtData(type: 'input' | 'td', dt: Api, col: number, c: string) {
    const data: any[] = [];
    dt.column(col)
        .nodes()
        .to$()
        .each(function () {
            if (type === 'input') data.push($(this).find(`.${c}`).val());
            else if (type === 'td') data.push($(this).text().trim());
        });
    return data;
}

interface AfterSuccess {
    type: string;
}

interface DeleteAllOptions {
    element?: string;
    script?: string;
    extra?: any;
    api?: any;
    dataType?: DataType;
    type?: AjaxType;
    afterSuccess?: AfterSuccess;
    tableLoadType?: 'ajax' | 'dom';
}

export function deleteAll(op: DeleteAllOptions) {
    const { element = 'N/A', script = '/', extra = {}, api = [], dataType = 'json', type = 'request', afterSuccess = { type: 'inflate_redirect_response_data' }, tableLoadType = 'ajax' } = op;
    $('.' + element).unbind('click');
    $('.' + element).on('click', function (this: HTMLElement) {
        const rows_selected = api.rows('.selected').data().toArray();
        if (rows_selected.length > 0) {
            let d: Record<string, any> = {};
            if (extra != 'no') {
                d['extra'] = extra;
            }
            const bodyDataAttr: string | undefined = $(this).attr('data-bodyData') ?? undefined;
            if (bodyDataAttr) {
                const bodyData: Record<string, unknown> = JSON.parse(bodyDataAttr);
                d = {
                    ...d,
                    bodyData,
                };
            }
            const ids: (number | string)[] = [];
            if (tableLoadType === 'ajax') {
                rows_selected.forEach((v: any) => {
                    ids.push(v?.id);
                });
            } else {
                rows_selected.forEach((v: any) => {
                    ids.push(v[0]);
                });
            }
            d.ids = ids;
            ajax({
                ...op,
                element,
                script,
                body: d,
                dataType,
                type,
                afterSuccess,
            });
        } else {
            showAlert(`<span class="text-red-600 text-base">${Lang.errors.no_data_selected}</span>`, '');
        }
    });
}

type DtValue = string | number | string[] | undefined;

interface DataColItem {
    type: 'input' | 'td';
    index: number;
    name: string;
    data?: DtValue[];
}

interface DataCols {
    key: string;
    items: DataColItem[];
}

interface UpdateAllOptions {
    element?: string;
    script?: string;
    extra?: Record<string, any> | 'no';
    api?: Api;
    dataType?: DataType;
    type?: AjaxType;
    afterSuccess?: any;
    dataCols?: DataCols;
}
export function updateAll(op: UpdateAllOptions = {}) {
    const { element = 'N/A', script = '/', extra = {}, api, dataType = 'json', type = 'request', afterSuccess = { type: 'inflate_redirect_response_data' }, dataCols } = op;
    $('.' + element)
        .off('click')
        .on('click', () => {
            const d: Record<string, any> = {};
            if (extra !== 'no') {
                d.extra = extra;
            }
            if (dataCols && api) {
                for (const colValue of dataCols.items) {
                    colValue.data = getDtData(colValue.type, api, colValue.index, colValue.name);
                }
                const keyDataItem = dataCols.items.find((v) => v.name === dataCols.key);
                if (keyDataItem?.data) {
                    const keyData = keyDataItem.data;

                    for (const colValue of dataCols.items) {
                        const dataArray: Record<string, DtValue> = {};

                        colValue.data?.forEach((value, i) => {
                            const k = keyData[i];
                            if (k !== undefined) {
                                dataArray[String(k)] = value;
                            }
                        });

                        d[colValue.name] = dataArray;
                    }
                }
            }
            ajax({
                ...op,
                element,
                script,
                body: d,
                dataType,
                type,
                afterSuccess,
            });
        });
}
