import { app_locale, csrf_token, defaultDtSize, domain_url, local } from '../utils';
import '../plugins/dataTable/js/jquery.dataTables.min.js';
import '../plugins/dataTable/js/dataTables.bootstrap5.min.js';
import '../plugins/dataTable/js/dataTables.checkboxes.min.js';
export function makeDataTable(table, op = {}) {
    let f = {};
    let s = [];
    f.glob = (op.glob == undefined) ? false : op.glob;
    f.searching = (op.searching == undefined) ? true : op.searching;
    f.ordering = (op.ordering == undefined) ? false : op.paging;
    f.paging = (op.paging == undefined) ? true : op.paging;
    f.info = (op.info == undefined) ? true : op.info;
    f.responsive = (op.responsive == undefined) ? true : op.responsive;
    f.lengthChange = (op.lengthChange == undefined) ? true : op.lengthChange;
    f.stateSave = (op.stateSave == undefined) ? false : op.stateSave;
    f.pageLength = (op.pageLength === undefined) ? defaultDtSize : op.pageLength;
    f.cache = (op.cache == undefined) ? false : op.cache;
    f.disabled = (op.disabled == undefined) ? [] : op.disabled;
    f.pagingType = 'simple_numbers',
    f.language = {
        url: domain_url + 'statics/locale/' + app_locale + '.json',
        paginate: {
            next: '<i class="fa-solid fa-angle-right"></i>',
            previous: '<i class="fa-solid fa-angle-left"></i>'
        }
    };
    if (op.select != undefined) {
        if (op.select) {
            s = [{
                targets: 0,
                checkboxes: {
                    selectRow: true,
                },
                render: function (data, type, row, meta) {
                    if (f.disabled.includes(parseInt(data))) {
                        return '';
                    }
                    return '<input type="checkbox" class="dt-checkboxes">';
                }
            }];
        }
    }
    f.selected = op.selected || [];
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
            order: [
                [0, 'DESC']
            ],
            lengthMenu: [
                [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100, 500, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 100000, 200000, 300000],
                [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100, 500, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 100000, 200000, 300000]
            ],
            'fnDrawCallback': function (settings) {
                let api = this.api();
                if (typeof window[table] === 'function') {
                    let tr = $('#' + table + ' thead tr');
                    let dataSrc = api.rows().data().toArray();
                    let columns = [];
                    if (tr) {
                        let elements = tr[0].children;
                        for (let i = 0; i < elements.length; i++) {
                            let title = elements[i].textContent.trim();
                            let styles = JSON.parse(elements[i].getAttribute('data-style')) ?? {};
                            let pdfWidth = styles?.pdfWidth ?? '*';
                            columns.push({ title, data: 'col_' + i, pdfWidth });
                        }
                        dataSrc = [...dataSrc].map((rows, rowIndex) => {
                            let ob = {};
                            rows.map((col, index) => {
                                ob['col_' + index] = rows[index];
                            });
                            return ob;
                        });

                    }
                    let newOp = { ...op, dataSrc: [...dataSrc], columns };
                    window[table](table, api, newOp);
                }
            }
        });
        selectAction(table, dt);
    }
}
export function makeAjaxDataTable(table, op = {}) {
    let f = {};
    let s = [];
    f.glob = (op.glob == undefined) ? false : op.glob;
    f.searching = (op.searching == undefined) ? true : op.searching;
    f.ordering = (op.ordering == undefined) ? false : op.ordering;
    f.paging = (op.paging == undefined) ? true : op.paging;
    f.info = (op.info == undefined) ? true : op.info;
    f.pageLength = (op.pageLength === undefined) ? defaultDtSize : op.pageLength;
    f.responsive = (op.responsive == undefined) ? true : op.responsive;
    f.bLengthChange = (op.bLengthChange == undefined) ? true : op.bLengthChange;
    f.stateSave = (op.stateSave == undefined) ? false : op.stateSave;
    f.cache = (op.cache == undefined) ? false : op.cache;
    f.url = op.url || '';
    f.columns = op.columns || [];
    f.body = op.body || {};
    f.pagingType = 'simple_numbers',
    f.language = {
        url: domain_url + 'statics/locale/' + app_locale + '.json',
        paginate: {
            next: '<i class="fa-solid fa-angle-right"></i>',
            previous: '<i class="fa-solid fa-angle-left"></i>'
        }
    };
    if (op.select != undefined) {
        if (op.select) {
            s = [{
                targets: 0,
                checkboxes: {
                    'selectRow': true
                },
                render: function (data, type, row, meta) {
                    if (row?.can_select == 'no') {
                        return '';
                    }
                    return '<input type="checkbox" class="dt-checkboxes">';
                }
            }];
        }
    }
    f.selected = op.selected || [];
    let post_data = { _token: csrf_token, lang: app_locale };
    for (let key in f.body) {
        post_data[key] = f.body[key];
    }
    if ($('#' + table).length > 0) {
        let dt = $('#' + table).DataTable({
            paging: f.paging,
            searching: f.searching,
            searchDelay: 500,
            serverSide: true,
            'bStateSave': true,
            ordering: f.ordering,
            info: f.info,
            responsive: f.responsive,
            bLengthChange: f.bLengthChange,
            stateSave: f.stateSave,
            cache: f.cache,
            language: f.language,
            pageLength: f.pageLength,
            columnDefs: s,
            processing: '<span class=\'fa-stack fa-lg\'>\n\
                        <i class=\'fa fa-spinner fa-spin fa-stack-2x fa-fw\'></i>\n\
                        </span>&nbsp;&nbsp;&nbsp;&nbsp;Processing ...',
            lengthMenu: [
                [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100, 500, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 100000, 200000, 300000],
                [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100, 500, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 100000, 200000, 300000]
            ],
            ajax: {
                type: 'POST',
                url: domain_url + f.url,
                data: post_data,
                dataSrc: function (data) {
                    op = { ...op, data: data, dataSrc: data.data };
                    if (local) {
                        console.log(data.data);
                    }
                    return data.data;
                },
                error: function (response) {
                    console.log(response);
                }
            },
            columns: f.columns,
            select: {
                style: 'multi'
            },
            order: [
                [0, 'DESC']
            ],
            'fnDrawCallback': function (oSettings) {
                let api = this.api();
                if (typeof window[table] === 'function') {
                    window[table](table, api, op);
                }
            }
        });
        selectAction(table, dt, op);
    }

}
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
    $('#' + table + ' thead', dt.table().container()).on('click', 'input[type="checkbox"]', function (e) {
        if (this.checked) {
            let cb = $('#' + table + ' tbody input[type="checkbox"]');
            cb.prop('checked', true);
            cb.parent().parent().addClass('selected');
        } else {
            let cb = $('#' + table + ' tbody input[type="checkbox"]');
            cb.prop('checked', false);
            cb.parent().parent().removeClass('selected');
        }
        showSelected(dt, op);
        e.stopPropagation();
    });
}
export function showSelected(dt, op = {}) {
    let count = dt.rows('.selected').data().length;
    if (count == '0') {
        $('#show_selected').html('');
        $('#show_selected_base').css({ marginLeft: '-500px' });
    } else {
        $('#show_selected_base').css({ marginLeft: 0 });
        $('#show_selected').html('Selected: ' + count);
    }
    if (op?.onSelectRows) {
        op?.onSelectRows(dt, op);
    }
}
// export function makeAjaxDataTable(table, op = {}) {
//     if (local) {
//         console.log(op);
//     }
//     let f = {};
//     let s = [];
//     f.glob = (op.glob == undefined) ? false : op.glob;
//     f.searching = (op.searching == undefined) ? true : op.searching;
//     f.ordering = (op.ordering == undefined) ? false : op.ordering;
//     f.paging = (op.paging == undefined) ? true : op.paging;
//     f.info = (op.info == undefined) ? true : op.info;
//     f.pageLength = (op.pageLength === undefined) ? defaultDtSize : op.pageLength;
//     f.responsive = (op.responsive == undefined) ? true : op.responsive;
//     f.lengthChange = (op.lengthChange == undefined) ? true : op.lengthChange;
//     f.stateSave = (op.stateSave == undefined) ? false : op.stateSave;
//     f.cache = (op.cache == undefined) ? false : op.cache;
//     f.url = op.url || '';
//     f.columns = op.columns || [];
//     f.body = op.body || {};
//     f.pagingType = 'simple_numbers',
//     f.language = {
//         url: domain_url + 'statics/locale/' + app_locale + '.json',
//         paginate: {
//             next: '<i class="fa-solid fa-angle-right"></i>',
//             previous: '<i class="fa-solid fa-angle-left"></i>'
//         }
//     };
//     if (op.select != undefined) {
//         if (op.select) {
//             s = [{
//                 targets: 0,
//                 checkboxes: {
//                     'selectRow': true
//                 },
//                 render: function (data, type, row, meta) {
//                     if (row?.can_select == 'no') {
//                         return '';
//                     }
//                     return '<input type="checkbox" class="dt-checkboxes">';
//                 }
//             }];
//         }
//     }
//     f.selected = op.selected || [];
//     let post_data = { _token: csrf_token, lang: app_locale };
//     for (let key in f.body) {
//         post_data[key] = f.body[key];
//     }
//     if ($.fn.DataTable.isDataTable('#' + table)) {
//         $('#' + table).DataTable().destroy();
//     }
//     if ($('#' + table).length > 0) {
//         let dt = $('#' + table).DataTable({
//             paging: f.paging,
//             searching: f.searching,
//             searchDelay: 500,
//             serverSide: true,
//             ordering: f.ordering,
//             info: f.info,
//             responsive: f.responsive,
//             lengthChange: f.lengthChange,
//             stateSave: f.stateSave,
//             cache: f.cache,
//             pagingType: f.pagingType,
//             language: f.language,
//             pageLength: f.pageLength,
//             columnDefs: s,
//             processing: true,
//             lengthMenu: [
//                 [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100, 500, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 100000, 200000, 300000],
//                 [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100, 500, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 100000, 200000, 300000]
//             ],
//             ajax: {
//                 type: 'POST',
//                 url: domain_url + f.url,
//                 data: function (d) {
//                     d.start = parseInt(d.start);
//                     d.length = parseInt(d.length);
//                     let data= { ...d, ...post_data };
//                     return data;
//                 },
//                 cache: false,
//                 dataSrc: function (data) {
//                     op = { ...op, data: data, dataSrc: data.data };
//                     if (local) {
//                         console.log(data);
//                     }
//                     return data.data;
//                 },
//                 error: function (response) {
//                     if (local) {
//                         console.log(response);
//                     }
//                 }
//             },
//             columns: f.columns,
//             select: {
//                 style: 'multi'
//             },
//             order: [
//                 [0, 'DESC']
//             ],
//             'fnDrawCallback': function (oSettings) {
//                 let api = this.api();
//                 if (typeof window[table] === 'function') {
//                     window[table](table, api, op);
//                 }
//             }
//         });
//         selectAction(table, dt, op);
//     }

// }
// export function selectAction(table, dt, op) {

//     $('#' + table + ' tbody').on('click', 'input[type="checkbox"]', function (e) {
//         let $row = $(this).closest('tr');
//         if (this.checked) {
//             $row.addClass('selected');
//         } else {
//             $row.removeClass('selected');
//         }
//         showSelected(dt, op);
//         e.stopPropagation();
//     });
//     $('#' + table + ' thead', dt.table().container()).on('click', 'input[type="checkbox"]', function (e) {
//         if (this.checked) {
//             let cb = $('#' + table + ' tbody input[type="checkbox"]');
//             cb.prop('checked', true);
//             cb.parent().parent().addClass('selected');
//         } else {
//             let cb = $('#' + table + ' tbody input[type="checkbox"]');
//             cb.prop('checked', false);
//             cb.parent().parent().removeClass('selected');
//         }
//         showSelected(dt, op);
//         e.stopPropagation();
//     });
// }
// export function showSelected(dt, op = {}) {
//     let count = dt.rows('.selected').data().length;
//     if (count == '0') {
//         $('#show_selected').html('');
//         $('#show_selected_base').addClass('hidden');
//     } else {
//         $('#show_selected_base').removeClass('hidden');
//         $('#show_selected').html('Selected: ' + count);
//     }
//     if (op?.onSelectRows) {
//         op?.onSelectRows(dt, op);
//     }
// }
export function getDtData(type, dt, col, c) {
    let data = [];
    dt.column(col).nodes().to$().each(function () {
        switch (type) {
        case 'input':
            data.push($(this).find('.' + c).val());
            break;
        case 'td':
            data.push($(this).text().trim());
            break;
        default:
            break;
        }
    });
    return data;
}