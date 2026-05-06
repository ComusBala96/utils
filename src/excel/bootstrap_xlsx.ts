import { escapeHtml, getNestedValue } from '../functions/functions.js';

type ExcelWidth = number | { auto: 1 };

interface RenderDataConfig {
    data: string;
    type?: 'text' | 'image';
    imageStyles?: Record<string, any>;
}

export interface FilterColumn {
    title: string;
    data: string;
    excelWidth?: number | 'auto';
    renderData?: RenderDataConfig;
}

interface ExcelOptions {
    filterColumn?: FilterColumn[];
}

interface ExcelResult {
    body: (string | number)[][];
    width: ExcelWidth[];
}

export function getExcelBody(rows: Record<string, any>[], op: ExcelOptions): ExcelResult {
    const { filterColumn } = op;
    const body: (string | number)[][] = [];
    const header: string[] = [];
    const width: ExcelWidth[] = [];
    /* ---------- headers + widths ---------- */
    if (typeof filterColumn !== 'undefined') {
        filterColumn.forEach((col) => {
            let colWidth: ExcelWidth = 20;
            if (col.excelWidth) {
                colWidth = col.excelWidth === 'auto' ? { auto: 1 } : col.excelWidth;
            }
            width.push(colWidth);
            header.push(col.title);
        });
    }

    body.push(header);

    /* ---------- rows ---------- */

    rows.forEach((rowData) => {
        const row: (string | number)[] = [];
        if (typeof filterColumn !== 'undefined') {
            filterColumn.forEach((col) => {
                let access = col.data;
                if (col.renderData) {
                    access = col.renderData.data;
                    const type = col.renderData.type ?? 'text';
                    if (type === 'image') {
                        // Excel image handling (optional future feature)
                        // row.push({ image: escapeHtml(getNestedValue(access, rowData)) });

                        row.push('');
                    } else {
                        row.push(escapeHtml(getNestedValue(access, rowData)));
                    }
                } else {
                    row.push(escapeHtml(getNestedValue(access, rowData)));
                }
            });
        }
        body.push(row);
    });

    return { body, width };
}
