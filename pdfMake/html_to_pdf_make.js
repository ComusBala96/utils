import { splitArray } from '../functions/functions';
import { local } from '../utils';
import {
    addPageNumber,
    createDomObject,
    sanitizeHtml,
    tableStack,
} from './bootstrap_pdfmake';

export function html_to_pdf_make(op = {}) {
    const {
        id = 'pdf',
        dataTable = 'no',
        dataSrc = [],
        pdf = [],
        columns = [],
        perPage = 50,
        pageOrientation = 'portrait',
        pageSize = 'A4',
        pageMargins = [15, 100, 15, 35],
    } = op;

    const parentElement = document.getElementById(id);

    if (!parentElement) {
        if (local) console.warn(`Element with ID "${id}" not found`);
        return {};
    }

    let content = [];
    let images = {};
    let background = [];
    let watermark = {};

    let defaultValues = {
        pageOrientation,
        pageSize,
        pageMargins,
    };

    const pdfData = parentElement.querySelector('.os-pdf-body');

    /* -----------------------
         DATA TABLE MODE
      ----------------------- */

    if (dataTable === 'yes') {
        if (!Array.isArray(dataSrc) || dataSrc.length === 0) {
            return { content: [] };
        }

        const filterColumn = columns.filter((_, key) => pdf.includes(key));
        const dataPages = perPage ? splitArray(dataSrc, perPage) : [dataSrc];

        dataPages.forEach((rows, pageIndex) => {
            content.push({
                stack: [tableStack(rows, { ...op, filterColumn })],
                ...(pageIndex !== dataPages.length - 1 && { pageBreak: 'after' }),
            });

            rows.forEach((row) => {
                filterColumn.forEach((col) => {
                    if (col?.renderData?.type === 'image') {
                        const key = `image_${row?.id}`;
                        const src = row[col.renderData.data];

                        if (src) images[key] = src;
                    }
                });
            });
        });
    } else {

        /* -----------------------
             HTML MODE
          ----------------------- */
        if (pdfData) {
            const pdfBody = createDomObject(sanitizeHtml(pdfData, 'os-pdf-body'));

            if (pdfBody) {
                const { pdf: pdfOptions = {}, stack } = pdfBody;

                content = stack ?? [];

                defaultValues = {
                    ...defaultValues,
                    ...pdfOptions,
                };
            }
        }
    }

    /* -----------------------
         HEADER
      ----------------------- */

    const header = parentElement.querySelector('.os-pdf-header');

    if (header) {
        const headerObject = createDomObject(header);

        defaultValues.header = (currentPage, pageCount) => {
            const stack = addPageNumber(
                headerObject?.stack,
                { currentPage, pageCount },
                'tp',
            );

            return [{ ...headerObject, stack }];
        };
    }

    /* -----------------------
         FOOTER
      ----------------------- */

    const footer = parentElement.querySelector('.os-pdf-footer');

    if (footer) {
        const footerObject = createDomObject(footer);

        defaultValues.footer = (currentPage, pageCount) => {
            const stack = addPageNumber(
                footerObject?.stack,
                { currentPage, pageCount },
                'pp',
            );

            return [{ ...footerObject, stack }];
        };
    }

    /* -----------------------
         DOM IMAGES
      ----------------------- */

    parentElement.querySelectorAll('img[name]').forEach((img) => {
        const name = img.getAttribute('name');
        const src = img.getAttribute('src');

        if (name && src) images[name] = src;
    });

    /* -----------------------
         BACKGROUND
      ----------------------- */

    const bg = parentElement.querySelector('.os-pdf-bg-image');

    if (bg) background.push(createDomObject(bg));

    const watermarkImage = parentElement.querySelector('.os-pdf-watermark-image');

    if (watermarkImage) background.push(createDomObject(watermarkImage));

    /* -----------------------
         TEXT WATERMARK
      ----------------------- */

    const watermarkElement = parentElement.querySelector('.os-pdf-watermark');

    if (watermarkElement) {
        let styles = {};

        const styleAttr = watermarkElement.getAttribute('data-style');

        if (styleAttr) {
            try {
                styles = JSON.parse(styleAttr);
            } catch (e) {
                console.warn('Invalid watermark style JSON');
            }
        }

        watermark = {
            text: watermarkElement.textContent.trim(),
            ...styles,
        };
    }

    if (local) console.log('PDF CONFIG:', defaultValues);

    return {
        content,
        ...defaultValues,
        images,
        background,
        watermark,
    };
}
