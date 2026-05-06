// import $ from 'jquery';
// import $ from '@orians/core/jquery';
import { getExcelBody } from './bootstrap_xlsx.js';

let xlsxLib: typeof import('xlsx') | null = null;

/* -----------------------------
   Types
----------------------------- */

interface DownloadExcelOptions {
    btn?: string;
    file_name?: string;
    dataTable?: unknown;
    dataSrc?: Record<string, any>[];
    columns?: any[];
    pdf?: number[];
    filterColumn?: any[];
}

/* -----------------------------
   Lazy Load XLSX
----------------------------- */

async function loadXLSX(): Promise<typeof import('xlsx')> {
    if (xlsxLib) return xlsxLib;
    const XLSX = await import('xlsx');
    xlsxLib = XLSX;
    return XLSX;
}

/* -----------------------------
   Excel Button Handler
----------------------------- */

export function downloadExcel(op: DownloadExcelOptions = {}): void {
    const btn = op.btn ?? 'excelDownload';
    const $btn = $('#' + btn);
    $btn.off('click');
    $btn.on('click', async function (this: HTMLElement) {
        const dataset = $(this).attr('data-excel-op');
        const parsed = dataset ? JSON.parse(dataset) : {};
        const newOp: DownloadExcelOptions = {
            ...op,
            ...parsed,
        };
        await makeExcel(newOp);
    });
}

/* -----------------------------
   Excel Generator
----------------------------- */

async function makeExcel(op: DownloadExcelOptions = {}): Promise<void> {
    const XLSX = await loadXLSX();
    const { file_name = 'file_name', dataSrc = [], columns = [], pdf = [] } = op;

    /* filter export columns */

    op.filterColumn = columns.filter((_, index) => pdf.includes(index));
    const { body = [], width = [] } = getExcelBody(dataSrc, op);
    if (!body.length) return;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(body);
    ws['!cols'] = width.map((w: any) => ({
        wch: typeof w === 'number' ? w : 20,
    }));
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${file_name}.xlsx`);
}
