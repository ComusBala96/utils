import { escapeHtml, getNestedValue } from '../functions/functions';

export function getExcelBody(rows,op){
    const {filterColumn} = op;
    let body = [];
    let header = [];
    let width = [];
    for (let index = 0; index < filterColumn.length; index++) {
        const col = filterColumn[index];
        let colWidth = 20;
        if(col?.excelWidth) {
            if(col?.excelWidth == 'auto') {
                colWidth = {auto: 1};
            } else {
                colWidth = col?.excelWidth;
            }
        }
        width.push(colWidth);
        header.push(col.title);
    }
    body.push(header);
    for (let i = 0; i < rows.length; i++) {
        let row = [];
        for (let j = 0; j < filterColumn.length; j++) {
            const col = filterColumn[j];
            let access = col.data;
            if(col?.renderData){
                access = col?.renderData?.data;
                let type  = col?.renderData?.type ?? 'text';
                if(type == 'image') {
                    //row.push({image: escapeHtml(getNestedValue(access,rows[i])), ...bodyStyles,...col?.renderData?.imageStyles});
                } else {
                    row.push(escapeHtml(getNestedValue(access,rows[i])));
                }
            } else {
                row.push(escapeHtml(getNestedValue(access,rows[i])));
            }
           
        }
        body.push(row);
    }
    return {body,width};
}