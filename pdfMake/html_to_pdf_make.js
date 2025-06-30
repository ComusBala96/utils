import { splitArray } from '../functions/functions';
import { local } from '../utils';
import { addPageNumber, createDomObject, sanitizeHtml, tableStack } from './bootstrap_pdfmake';

export function html_to_pdf_make(op = {}) {
    let { id = 'pdf', dataTable = 'no', dataSrc = [], pdf = [], columns = [], perPage = 50 } = op;
    let defaultValues = {
        pageOrientation: op?.pageOrientation ?? 'portrait',
        pageSize: op?.pageSize ?? 'A4',
        pageMargins: op?.pageMargins ?? [15, 100, 15, 35],
    };


    let content = [];
    let images = {};
    let background = [];
    let watermark = {};
    const parentElement = document.getElementById(id);
    let pdfData = parentElement.querySelectorAll('.os-pdf-body');
    if (parentElement) {
        switch (dataTable) {
        case 'yes':
            if (dataSrc.length == 0) {
                content = [];
            }
            if (perPage) {
                dataSrc = splitArray(dataSrc, perPage);
            }
            op['filterColumn'] = [...columns].filter((item, key) => { return pdf.includes(key); });
            for (let index = 0; index < dataSrc.length; index++) {
                let ob = {
                    stack: [tableStack(dataSrc[index], op)]
                };
                if (index !== (dataSrc.length - 1)) {
                    ob.pageBreak = 'after';
                }
                content.push(ob);
                for (let i = 0; i < dataSrc[index].length; i++) {
                    for (let j = 0; j < op['filterColumn'].length; j++) {
                        const col = op['filterColumn'][j];
                        if (col?.renderData) {
                            let type = col?.renderData?.type ?? 'text';
                            if(type == 'image') {
                                images['image_'+dataSrc[index][i]?.id] = dataSrc[index][i][col?.renderData?.data];
                            }
                        }
                    }
                }
            }
            break;

        default:
            if (pdfData && pdfData[0]) {
                const pdfBody = createDomObject(sanitizeHtml(pdfData[0], 'os-pdf-body'));
                if (pdfBody) {
                    const { pdf = {}, stack } = pdfBody;
                    content = stack;
                    defaultValues = {
                        ...defaultValues,
                        ...pdf,
                    };
                }
            }
            break;
        }
        let header = parentElement.querySelectorAll('.os-pdf-header');
        if (header) {
            let headerObject = createDomObject(header[0]);
            defaultValues = {
                ...defaultValues,
                header: function (currentPage, pageCount, pageSize) {
                    let injectPageNumber = { ...headerObject, stack: addPageNumber(headerObject?.stack, { currentPage, pageCount }, 'tp') };
                    return [injectPageNumber];
                }
            };
        }
        let footer = parentElement.querySelectorAll('.os-pdf-footer');
        if (footer) {
            let footerObject = createDomObject(footer[0]);
            defaultValues = {
                ...defaultValues,
                footer: function (currentPage, pageCount) {
                    let injectPageNumber = { ...footerObject, stack: addPageNumber(footerObject?.stack, { currentPage, pageCount }, 'pp') };
                    return [injectPageNumber];
                }
            };
        }
        let domImages = parentElement.querySelectorAll('img');
        if (domImages) {
            domImages.forEach((imageElement) => {
                if (imageElement.hasAttribute('name')) {
                    images[imageElement.getAttribute('name')] = imageElement.getAttribute('src');
                }
            });
        }
        let domBackground = parentElement.querySelectorAll('.os-pdf-bg-image');
        if (domBackground && domBackground[0]) {
            let bgObject = createDomObject(domBackground[0]);
            background.push(bgObject);
        }

        let domCustomWaterMark = parentElement.querySelectorAll('.os-pdf-watermark-image');
        if (domCustomWaterMark && domCustomWaterMark[0]) {
            let domCustomWaterMarkObject = createDomObject(domCustomWaterMark[0]);
            background.push(domCustomWaterMarkObject);
        }

        let domWatermark = parentElement.querySelectorAll('.os-pdf-watermark');
        if (domWatermark && domWatermark[0]) {
            let watermarkStyles = {};
            if (domWatermark[0].hasAttribute('data-style')) {
                watermarkStyles = JSON.parse(domWatermark[0].getAttribute('data-style'));
            }
            let watermarkObject = {
                text: domWatermark[0].textContent.trim(),
                ...watermarkStyles,
            };
            watermark = watermarkObject;
        }
        if (local) {
            console.log(defaultValues);
        }

    } else {
        if (local) {
            console.log(`Element with ID '${parentElement}' not found.`);
        }
    }
    return {
        content,
        ...defaultValues,
        images,
        background,
        watermark
    };
}
