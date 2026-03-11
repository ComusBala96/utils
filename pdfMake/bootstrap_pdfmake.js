import { escapeHtml, getNestedValue } from '../functions/functions';
import { local } from '../utils';

const parseJSON = (value, fallback = {}) => {
    try {
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
};

export function createDomObject(element) {
    if (!element) return { text: '', opacity: 0.2 };

    const classes = [...element.classList];
    const tag = element.tagName.toLowerCase();

    let obj = { tag };

    if (classes.length) {
        obj.class = classes;

        if (classes.includes('os-pdf-page') && classes.includes('break-after')) {
            obj.pageBreak = 'after';
        }
    }

    if (classes.includes('row')) {
        obj.columns = mapChildren(element, 'col');
    } else if (classes.includes('table')) {
        obj = getTableObject(element);
    } else if (classes.includes('os-pdf-image')) {
        obj = getImageObject(element);
    } else if (classes.includes('os-pdf-svg')) {
        obj = getSvgObject(element);
    } else if (classes.includes('os-pdf-qr')) {
        obj = getQrCodeObject(element);
    } else if (classes.includes('os-pdf-inline-text')) {
        obj = getInlineText(element);
    } else if (classes.includes('os-pdf-page-count')) {
        obj = getPageCount(element);
    } else {
        obj.stack = mapChildren(element);
    }

    const pdfAttr = element.getAttribute('data-pdf');
    if (pdfAttr) obj.pdf = parseJSON(pdfAttr);

    const styleAttr = element.getAttribute('data-style');
    if (styleAttr) obj = { ...obj, ...parseJSON(styleAttr) };

    if (element.style.length) {
        const style = {};
        for (let i = 0; i < element.style.length; i++) {
            const name = element.style[i];
            style[cssToCamelCase(name)] = element.style.getPropertyValue(name);
        }
        obj.style = style;
    }

    return obj;
}

export function sanitizeHtml(data, className) {
    const html = data.innerHTML.replace(/[\n\r]+|[\s]{2,}/g, '');
    const temp = document.createElement('div');

    if (className) temp.className = className;

    temp.innerHTML = html;

    return temp;
}

function getQrCodeObject(element) {
    const styles = parseJSON(element.getAttribute('data-style'));

    return {
        qr: element.getAttribute('data-qr-text')?.trim(),
        tag: 'div',
        ...styles,
    };
}

function getPageCount(element) {
    const styles = parseJSON(element.getAttribute('data-style'));

    return {
        text: '',
        tag: 'text',
        pageCount: 'yes',
        ...styles,
    };
}

function getInlineText(element) {
    const styles = parseJSON(element.getAttribute('data-style'));

    const innerText = element.innerHTML;

    const regex = /<span[^>]*data-style="(.*?)">(.*?)<\/span>/;

    const parts = innerText.split(regex).filter(Boolean);

    const text = [];

    for (let i = 0; i < parts.length; i++) {
        if (i % 3 === 1) {
            const style = parseJSON(parts[i].replace(/&quot;/g, '"'));
            const content = parts[i + 1];

            text.push({ style, text: content });
            i++;
        } else {
            text.push({ text: parts[i] });
        }
    }

    return {
        text,
        tag: 'text',
        ...styles,
    };
}

function getSvgObject(element) {
    const svg =
        element.innerHTML ||
        '<svg width="100" height="100"><text>Test</text></svg>';

    const obj = { svg };

    if (local) console.log(obj);

    return obj;
}

function getImageObject(element) {
    return {
        image: element.getAttribute('name') || 'no_name_given',
    };
}

function getTableObject(element) {
    const tableObject = parseJSON(element.getAttribute('data-style'));

    const { layout = 'noBorders', headerRows } = tableObject;

    const { body, headerWidth } = getTableBodyContent(element.childNodes);

    return {
        layout,
        headerRows,
        table: {
            widths: headerWidth,
            body,
        },
    };
}

function getTableBodyContent(nodes) {
    const body = [];
    const headerWidth = [];

    nodes.forEach((node) => {
        if (node.tagName !== 'THEAD' && node.tagName !== 'TBODY') return;

        node.childNodes.forEach((tr) => {
            if (tr.tagName !== 'TR') return;

            const trStyles = parseJSON(tr.getAttribute('data-style'));

            const columns = [];

            tr.childNodes.forEach((td) => {
                if (!td || !['TH', 'TD'].includes(td.tagName)) return;

                const styles = parseJSON(td.getAttribute('data-style'));

                const css = {};

                for (let i = 0; i < td.style.length; i++) {
                    const name = td.style[i];
                    css[cssToCamelCase(name)] = td.style.getPropertyValue(name);
                }

                const cell = {
                    ...css,
                    ...styles,
                    ...trStyles,
                };

                if (styles?.rowSpan) cell.rowSpan = styles.rowSpan;
                if (styles?.colSpan) cell.colSpan = styles.colSpan;

                if (td.childNodes.length) {
                    columns.push({
                        stack: [createDomObject(td)],
                        ...cell,
                    });
                } else {
                    columns.push({
                        text: td.textContent.trim(),
                        ...cell,
                    });
                }
            });

            if (columns.length) body.push(columns);
        });
    });

    const processedBody = getRowColSpanData(body);

    processedBody[0]?.forEach((col) => {
        headerWidth.push(col?.width || '*');
    });

    return { body: processedBody, headerWidth };
}

function getRowColSpanData(data) {
    const body = [];

    data.forEach((row) => {
        const newRow = [];

        row.forEach((cell) => {
            if (cell?.colSpan) {
                newRow.push(cell);

                for (let i = 1; i < cell.colSpan; i++) {
                    newRow.push('');
                }
            } else {
                newRow.push(cell);
            }
        });

        body.push(newRow);
    });

    return body;
}

function mapChildren(element, type) {
    const stack = [];

    element.childNodes.forEach((child) => {
        let width;

        if (type) {
            const size = child.getAttribute?.('data-col-size');
            if (size) width = (100 / 12) * size + '%';
        }

        if (child.nodeType === Node.ELEMENT_NODE) {
            const obj = createDomObject(child);

            if (width) obj.width = width;

            stack.push(obj);
        } else if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent.trim();

            if (!text) return;

            const obj = { text, tag: 'text' };

            if (width) obj.width = width;

            stack.push(obj);
        }
    });

    return stack;
}

export function addPageNumber(items, op = {}, type) {
    const { currentPage = 0, pageCount = 0 } = op;

    if (!items?.[0]?.columns) return items;

    items[0].columns = items[0].columns.map((col) => {
        if (col?.pageCount === 'yes') {
            col.text =
                type === 'pp'
                    ? `${currentPage}/${pageCount}`
                    : `Total Page: ${pageCount}`;
        }

        if (col?.stack) {
            col.stack = col.stack.map((item) => {
                if (item?.pageCount === 'yes') {
                    item.text =
                        type === 'pp'
                            ? `${currentPage}/${pageCount}`
                            : `Total Page: ${pageCount}`;
                }

                return item;
            });
        }

        return col;
    });

    return items;
}

function cssToCamelCase(prop) {
    return prop.replace(/-([a-z])/g, (_, l) => l.toUpperCase());
}

export function tableStack(rows, op) {
    const { filterColumn } = op;

    const headerStyles = {
        fontSize: 10,
        alignment: 'center',
        color: 'white',
        fillColor: '#243545',
        ...op?.headerStyles,
    };

    const bodyStyles = {
        fontSize: 8,
        alignment: 'center',
        ...op?.bodyStyles,
    };

    const header = [];
    const widths = [];

    filterColumn.forEach((col) => {
        header.push({ text: col.title, ...headerStyles });

        widths.push(col?.pdfWidth === 'auto' ? 'auto' : col?.pdfWidth || '*');
    });

    const body = [header];

    rows.forEach((row) => {
        const dataRow = [];

        filterColumn.forEach((col) => {
            let access = col.data;

            if (col.renderData) {
                access = col.renderData.data;

                if (col.renderData.type === 'image') {
                    dataRow.push({
                        image: `image_${row.id}`,
                        ...bodyStyles,
                        ...col.renderData.imageStyles,
                    });

                    return;
                }
            }

            dataRow.push({
                text: escapeHtml(getNestedValue(access, row)),
                ...bodyStyles,
            });
        });

        body.push(dataRow);
    });

    return {
        layout: 'allBorders',
        table: {
            widths,
            body,
        },
    };
}
