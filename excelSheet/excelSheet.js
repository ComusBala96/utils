import { getExcelBody } from './boostrap_xlsx';

let xlsxLib = null;

/* -----------------------------
   Lazy Load XLSX
----------------------------- */

async function loadXLSX() {
    if (xlsxLib) return xlsxLib;

    const XLSX = await import('xlsx');

    xlsxLib = XLSX;

    return XLSX;
}

/* -----------------------------
   Excel Button Handler
----------------------------- */

export function downloadExcel(op = {}) {
    let btn = op?.btn ?? 'excelDownload';

    $('#' + btn).unbind('click');

    $('#' + btn).on('click', async function () {
        let newOp = {
            ...op,
            ...JSON.parse($(this).attr('data-excel-op') ?? '{"no":"no"}'),
        };

        await MakeExcel(newOp);
    });
}

/* -----------------------------
   Excel Generator
----------------------------- */

async function MakeExcel(op = {}) {
    const XLSX = await loadXLSX();

    const {
        file_name = 'file_name',
        dataTable = undefined,
        dataSrc = [],
        columns = [],
        pdf = [],
    } = op;

    let data = [];

    if (dataSrc.length == 0) {
        data = [];
    }

    op['filterColumn'] = [...columns].filter((item, key) => {
        return pdf.includes(key);
    });

    let { body = [], width = [] } = getExcelBody(dataSrc, op);

    if (body.length > 0) {
        const wb = XLSX.utils.book_new();

        const ws = XLSX.utils.aoa_to_sheet(body);

        ws['!cols'] = width.map((w) => ({ wch: w }));

        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

        XLSX.writeFile(wb, file_name + '.xlsx');
    }
}
