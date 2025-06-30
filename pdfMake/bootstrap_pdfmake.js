import { escapeHtml, getNestedValue } from '../functions/functions';
import { local } from '../utils';

export function createDomObject(element) {
    if (!element) {
        return { text: '', opacity: .2 };
    }
    let classes = Array.from(element.classList);
    let tag = element.tagName.toLowerCase();
    let obj = {
        tag,
    };
    if (element.classList.length > 0) {
        if (classes.includes('os-pdf-page') && classes.includes('break-after')) {
            obj.pageBreak = 'after';
        }
        obj.class = classes;
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
    if (element.hasAttribute('data-pdf')) {
        obj.pdf = JSON.parse(element.getAttribute('data-pdf'));
    }
    if (element.hasAttribute('data-style')) {
        obj = { ...obj, ...JSON.parse(element.getAttribute('data-style')) };
    }
    if (element.style.length > 0) {
        obj.style = {};
        for (let i = 0; i < element.style.length; i++) {
            const propertyName = element.style[i];
            obj.style[cssToCamelCase(propertyName)] = element.style.getPropertyValue(propertyName);
        }
    }
    return obj;

}
export function sanitizeHtml(data, className = undefined) {
    const string = data.innerHTML.toString().replace(/[\n\r]+|[\s]{2,}/g, '');
    let temp = document.createElement('div');
    if (className) {
        temp.className = className;
    }
    temp.innerHTML = string;
    return temp;
}
function getQrCodeObject(element, op = {}) {
    let styles = JSON.parse(element.getAttribute('data-style'));
    let text = element.getAttribute('data-qr-text').toString().trim();
    let obj = {
        qr: text,
        tag: 'div',
        ...styles
    };
    return obj;
}
function getPageCount(element) {
    let styles = JSON.parse(element.getAttribute('data-style'));
    let obj = {
        text: '',
        tag: 'text',
        pageCount: 'yes',
        ...styles
    };
    return obj;
}
function getInlineText(element, op = {}) {
    let styles = JSON.parse(element.getAttribute('data-style'));
    const innerText = element.innerHTML;
    const regex = /<span[^>]*data-style="(.*?)">(.*?)<\/span>/;
    const splitText = innerText.split(regex).map((item, index) => {
        if (index % 3 === 1) {
            const dataStyle = JSON.parse(JSON.stringify(item));
            const jsonString = dataStyle.replace(/&quot;/g, '"');
            const jsonObject = JSON.parse(jsonString);
            return { type: 'style', style: jsonObject };
        } else if (index % 3 === 2) {
            return { type: 'text', text: item };
        } else {
            return { type: 'plain', text: item };
        }
    }).filter(Boolean);
    const inputArray = splitText;
    let mergedArray = [];
    for (let i = 0; i < inputArray.length; i++) {
        const currentElement = inputArray[i];
        if (currentElement.type === 'style') {
            const nextTextElement = inputArray[i + 1];
            if (nextTextElement && nextTextElement.type === 'text') {
                const mergedObject = {
                    type: 'merged',
                    style: currentElement.style,
                    text: nextTextElement.text
                };
                mergedArray.push(mergedObject);
                i++;
            }
        } else {
            mergedArray.push(currentElement);
        }
    }
    let obj = {
        text: mergedArray,
        tag: 'text',
        ...styles
    };
    return obj;
}
function getSvgObject(element, op = {}) {
    let defaultSvg = '<svg width="100" height="100"><text>Test</text></svg>';
    let obj = {
        svg: defaultSvg.toString(),
    };
    let svg = element.innerHTML;
    if (svg && svg != '') {
        obj = {
            svg: svg.toString(),
        };
    }
    if (local) {
        console.log(obj);
    }
    return obj;
}
function getImageObject(element, op = {}) {
    // const canvas = document.createElement('canvas');
    // canvas.width = element.width;
    // canvas.height = element.height;
    // const ctx = canvas.getContext('2d');
    // ctx.drawImage(element, 0, 0);
    // let image = canvas.toDataURL('image/png');
    // let obj = {
    //     image: image,
    // };
    // return obj;
    let image_name = element.getAttribute('name');
    let obj = {
        image: (image_name) ? image_name : 'no_name_given',
    };
    return obj;
}
function getTableObject(element, op = {}) {
    let tableObject = {};
    if (element.hasAttribute('data-style')) {
        tableObject = { ...JSON.parse(element.getAttribute('data-style')) };
    }
    let { layout = 'noBorders', headerRows = undefined } = tableObject;
    let nodes = element.childNodes;
    let content = getTableBodyContent(nodes);
    let body = content.body;
    let headerWidth = content.headerWidth;
    let obj = {
        layout,
        table: {
            widths: headerWidth,
            body: body
        }
    };
    if (headerRows) {
        obj.headerRows = headerRows;
    }
    return obj;
}
function getTableBodyContent(nodes) {
    let body = [];
    let headerWidth = [];
    nodes.forEach((node) => {
        if (node.tagName === 'THEAD' || node.tagName === 'TBODY') {
            let TR = node.childNodes;
            TR.forEach((tr) => {
                let columns = [];
                let trStyles = JSON.parse(tr.getAttribute('data-style'));
                if (tr.tagName === 'TR') {
                    let TD = tr.childNodes;
                    TD.forEach((td, index) => {
                        if (td) {
                            let styles = JSON.parse(td.getAttribute('data-style'));
                            if (td.tagName === 'TH' || td.tagName === 'TD') {
                                let moreNodes = td.childNodes;
                                let rowSpanObject = (styles?.rowSpan) ? { rowSpan: styles?.rowSpan } : {};
                                let colSpanObject = (styles?.colSpan) ? { colSpan: styles?.colSpan } : {};
                                let css = {};
                                for (let i = 0; i < td.style.length; i++) {
                                    const propertyName = td.style[i];
                                    css[cssToCamelCase(propertyName)] = td.style.getPropertyValue(propertyName);
                                }
                                css = { ...css, ...styles };
                                if (moreNodes.length > 0) {
                                    columns.push({ stack: [createDomObject(td)], ...css, ...trStyles, ...colSpanObject, ...rowSpanObject });
                                } else {
                                    columns.push({ text: td.textContent.trim(), ...css, ...colSpanObject, ...rowSpanObject });
                                }
                            }
                        }
                    });
                    if (columns.length > 0) {
                        body.push(columns);
                    }
                }
            });
        }
    });

    body = getRowColSpanData(body);
    [...body].map((widthValue, widthIndex) => {
        if (widthIndex == 0) {
            widthValue.map((value) => {
                if (value?.width) {
                    headerWidth.push(value?.width);
                } else {
                    headerWidth.push('*');
                }
            });
        }
    });
    return { body, headerWidth };
}
function getRowColSpanData(data) {
    let draftBody = [];
    let draftRowSpanData = [];
    [...data].map((item, index) => {
        let columns = [];
        item.map((value, itemIndex) => {
            if (value?.colSpan) {
                for (let i = 0; i < value?.colSpan; i++) {
                    if (i == 0) {
                        columns.push({ ...value });
                    } else {
                        columns.push('');
                    }
                }
            } else {
                columns.push(value);
            }
        });
        draftRowSpanData.push(columns);
    });
    [...draftRowSpanData].map((item, index) => {
        if (index == 0) {
            draftBody.push(item);
        } if (index > 0 && (index < ([...draftRowSpanData].length) - 1)) {
            let prevItem = [...draftRowSpanData][index - 1];
            let columns = [];
            let takenIndex = 0;
            if (prevItem) {
                if (prevItem.length > [...item].length) {
                    prevItem.map((value, valueIndex) => {
                        if (value?.rowSpan) {
                            columns.push({ text: '' });
                        } else {
                            columns.push(([...item][takenIndex]) ? [...item][takenIndex] : '');
                            takenIndex++;
                        }
                    });
                }
            }
            draftBody.push(columns);
        } if (index > 0 && index == (([...draftRowSpanData].length) - 1)) {
            draftBody.push(item);
        }
    });

    let body = [];
    [...draftBody].map((value, index) => {
        if (value.length == 0) {
            body.push([...draftRowSpanData][index]);
        } else {
            body.push(value);
        }
    });
    return body;
}
function mapChildren(element, type = undefined) {
    let stack = [];
    for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes[i];
        let size = undefined;
        if (type) {
            let sizeDefined = $(child).attr('data-col-size');
            if (sizeDefined) {
                size = (100 / 12) * sizeDefined + '%';
            }
        }
        if (child.nodeType === Node.ELEMENT_NODE) {
            let stackObject = { ...createDomObject(child) };
            if (size) {
                stackObject.width = size;
            }
            stack.push(stackObject);
        } else if (child.nodeType === Node.TEXT_NODE) {
            const textContent = child.textContent.trim();
            if (textContent !== '') {
                let stackObject = { text: textContent, tag: 'text' };
                if (size) {
                    stackObject.width = size;
                }
                stack.push(stackObject);
            }
        }
    }
    return stack;
}
export function addPageNumber(items, op = {}, type) {
    const { currentPage = 0, pageCount = 0, pageSize = 0 } = op;
    if (items && items[0]) {
        let columns = items[0]?.columns ?? [];
        let newColumns = [...columns].map((item, key) => {
            if (item?.pageCount == 'yes') {
                item = {
                    ...item,
                    text: (type == 'pp') ? currentPage.toString() + '/' + pageCount : 'Total Page: ' + pageCount
                };
            }
            if (item?.stack?.length > 0) {
                item = [...item.stack].map((item, key) => {
                    if (item?.pageCount == 'yes') {
                        item = {
                            ...item,
                            text: (type == 'pp') ? currentPage.toString() + '/' + pageCount : 'Total Page: ' + pageCount
                        };
                    }
                    return item;
                });
                return item;
            }
            return item;
        });
        items[0].columns = newColumns;
    }
    return items;
}
function cssToCamelCase(cssProp) {
    return cssProp.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

export function tableStack(rows, op) {
    const { filterColumn } = op;
    const headerStyles = { fontSize: 10, alignment: 'center', color: 'white', fillColor: '#243545', ...op?.headerStyles };
    const bodyStyles = { fontSize: 8, alignment: 'center', ...op?.bodyStyles };
    let body = [];
    let header = [];
    let width = [];
    for (let index = 0; index < filterColumn.length; index++) {
        const col = filterColumn[index];
        header.push({ text: col.title, ...headerStyles });
        let colWidth = '*';
        if (col?.pdfWidth) {
            if (col?.pdfWidth == 'auto') {
                colWidth = 'auto';
            } else {
                colWidth = col?.pdfWidth;
            }
        }
        width.push(colWidth);
    }
    body.push(header);
    for (let i = 0; i < rows.length; i++) {
        let row = [];
        for (let j = 0; j < filterColumn.length; j++) {
            const col = filterColumn[j];
            let access = col.data;
            if (col?.renderData) {
                access = col?.renderData?.data;
                let type = col?.renderData?.type ?? 'text';
                if (type == 'image') {
                    access = col?.renderData?.data ?? access;
                    row.push({ image: 'image_' + rows[i]?.id, ...bodyStyles, ...col?.renderData?.imageStyles });
                } else {
                    row.push({ text: escapeHtml(getNestedValue(access, rows[i])), ...bodyStyles });
                }
            } else {
                row.push({ text: escapeHtml(getNestedValue(access, rows[i])), ...bodyStyles });
            }
        }
        body.push(row);
    }
    return {
        layout: 'allBorders',
        table: {
            widths: width,
            body,
        }
    };
}