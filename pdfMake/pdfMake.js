import { ajaxRequest, domain_url, local } from '../utils';
import { html_to_pdf_make } from './html_to_pdf_make';

let pdfMakeInstance = null;

/* ---------------------------
   Load pdfMake lazily
----------------------------*/
async function getPdfMake() {

    if (pdfMakeInstance) return pdfMakeInstance;

    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    pdfMakeInstance = pdfMakeModule.default || pdfMakeModule;

    /* Default fonts */
    pdfMakeInstance.fonts = {
        Roboto: {
            normal: `${domain_url}statics/fonts/english/RobotoRegular.ttf`,
            bold: `${domain_url}statics/fonts/english/RobotoBold.ttf`,
            italics: `${domain_url}statics/fonts/english/RobotoItalic.ttf`,
            bolditalics: `${domain_url}statics/fonts/english/RobotoBoldItalic.ttf`
        },
        SolaimanLipi: {
            normal: `${domain_url}statics/fonts/bengali/SolaimanLipi.ttf`,
            bold: `${domain_url}statics/fonts/bengali/SolaimanLipi-Bold.ttf`,
            italics: `${domain_url}statics/fonts/bengali/SolaimanLipi-Italic.ttf`,
            bolditalics: `${domain_url}statics/fonts/bengali/SolaimanLipi.ttf`
        }
    };

    /* Table layouts */
    pdfMakeInstance.tableLayouts = {
        allDashBorders: {
            hLineStyle: () => ({ dash: { length: 3, space: 5 } }),
            vLineStyle: () => ({ dash: { length: 3, space: 5 } })
        },

        admitCardBorder: {
            hLineWidth: () => 2,
            vLineWidth: () => 2,
            hLineColor: () => '#252161',
            vLineColor: () => '#252161'
        },

        allBorders: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => 'black',
            paddingLeft: () => 5,
            paddingRight: () => 5
        },

        horizontalBorders: {
            hLineWidth: () => 1,
            vLineWidth: () => 0,
            hLineColor: () => '#d1d1d1',
            paddingLeft: () => 8,
            paddingRight: () => 8
        }
    };

    return pdfMakeInstance;
}


/* ---------------------------
   Add Custom Fonts
----------------------------*/
function addCustomFonts(pdfMake, fonts = []) {

    if (!Array.isArray(fonts)) return;

    fonts.forEach(font => {

        if (!font?.name) return;

        pdfMake.fonts[font.name] = {
            normal: font.n,
            bold: font.b ?? font.n,
            italics: font.i ?? font.n,
            bolditalics: font.bi ?? font.n
        };

    });

}


/* ---------------------------
   Add Table Layouts
----------------------------*/
function addCustomTableLayouts(pdfMake, layouts = []) {

    if (!Array.isArray(layouts)) return;

    layouts.forEach(layout => {

        if (!layout?.name || !layout?.value) return;

        pdfMake.tableLayouts[layout.name] = layout.value;

    });

}


/* ---------------------------
   Generate PDF
----------------------------*/
export async function MakePdf(op = {}) {

    const {
        file_name = 'file_name',
        id = 'pdf',
        script,
        body = {},
        pdfFonts = [],
        tableLayouts = []
    } = op;

    try {

        const pdfMake = await getPdfMake();

        const docDefinition = {
            defaultStyle: { font: 'SolaimanLipi' },
            ...html_to_pdf_make(op)
        };

        if (local) {
            console.log('PDF Definition', docDefinition);
        }

        addCustomFonts(pdfMake, pdfFonts);
        addCustomTableLayouts(pdfMake, tableLayouts);

        $('#theDownloadLoader').show();

        pdfMake.createPdf(docDefinition).download(`${file_name}.pdf`, () => {

            $('#theDownloadLoader').hide();

            if (script) {

                ajaxRequest({
                    element: id,
                    script,
                    body,
                    dataType: 'json',
                    type: 'request',
                    afterSuccess: { type: 'inflate_response_data' }
                });

            }

        });

    } catch (error) {

        console.error('PDF generation failed:', error);
        $('#theDownloadLoader').hide();

    }

}


/* ---------------------------
   Bind Button
----------------------------*/
export function downloadPdf(op = {}) {

    const btn = op?.btn ?? 'pdfDownload';

    $(`#${btn}`).off('click').on('click', async function () {

        try {

            const attr = $(this).attr('data-pdf-op');
            const extra = attr ? JSON.parse(attr) : {};

            const newOp = { ...op, ...extra };

            await MakePdf(newOp);

        } catch (error) {

            console.error('PDF initialization error:', error);

        }

    });

}