import { ajaxRequest, domain_url, local } from '../utils';
import { html_to_pdf_make } from './html_to_pdf_make';
import pdfMake from 'pdfmake/build/pdfmake';
// import { vfs } from './vfs_fonts';
// Set up fonts


// pdfMake.fonts = {
//     Roboto: {
//         normal: 'RobotoRegular.ttf',
//         bold: 'RobotoBold.ttf',
//         italics: 'RobotoItalic.ttf',
//         bolditalics: 'RobotoBoldItalic.ttf',
//     },
//     SolaimanLipi: {
//         normal: 'SolaimanLipi.ttf',
//         bold: 'SolaimanLipi-Bold.ttf',
//         italics: 'SolaimanLipi-Italic.ttf',
//         bolditalics: 'SolaimanLipi.ttf',
//     },
//     Kalpurush: {
//         normal: 'Kalpurush.woff',
//         bold: 'Kalpurush.woff2',
//         italics: 'Kalpurush.woff',
//         bolditalics: 'Kalpurush.woff2',
//     },
// };
pdfMake.fonts = {
    Roboto: {
        normal: domain_url + 'statics/fonts/english/RobotoRegular.ttf',
        bold: domain_url + 'statics/fonts/english/RobotoBold.ttf',
        italics: domain_url + 'statics/fonts/english/RobotoItalic.ttf',
        bolditalics: domain_url + 'statics/fonts/english/RobotoBoldItalic.ttf',
    },
    SolaimanLipi: {
        normal: domain_url + 'statics/fonts/bengali/SolaimanLipi.ttf',
        bold: domain_url + 'statics/fonts/bengali/SolaimanLipi-Bold.ttf',
        italics: domain_url + 'statics/fonts/bengali/SolaimanLipi-Italic.ttf',
        bolditalics: domain_url + 'statics/fonts/bengali/SolaimanLipi.ttf',
    }
},
// Set up table layouts
pdfMake.tableLayouts = {
    allDashBorders: {
        hLineStyle: () => ({ dash: { length: 3, space: 5 } }),
        vLineStyle: () => ({ dash: { length: 3, space: 5 } }),
    },
    admitCardBorder: {
        hLineWidth: () => 2,
        vLineWidth: () => 2,
        hLineColor: () => '#252161',
        vLineColor: () => '#252161',
    },
    allBorders: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => 'black',
        paddingLeft: () => 5,
        paddingRight: () => 5,
    },
    horizontalBorders: {
        hLineWidth: () => 1,
        vLineWidth: () => 0,
        hLineColor: () => '#d1d1d1',
        paddingLeft: () => 8,
        paddingRight: () => 8,
    }
};

// pdfMake.vfs = vfs;


// Function to dynamically add fonts
function addCustomFonts(pdfMakeInstance, fonts = []) {
    fonts.forEach(font => {
        pdfMakeInstance.fonts[font.name] = {
            normal: font.n,
            bold: font.n,
            italics: font.i,
            bolditalics: font.bi,
        };
    });
}

// Function to dynamically add table layouts
function addCustomTableLayouts(pdfMakeInstance, layouts = []) {
    layouts.forEach(layout => {
        pdfMakeInstance.tableLayouts[layout.name] = layout.value;
    });
}

// Function to generate and download the PDF
export function MakePdf(op = {}) {
    try {
        const { file_name = 'file_name', id = 'pdf', script, body = {}, pdfFonts = [], tableLayouts = [] } = op;

        // Merge document definition with default style
        let docDefinition = Object.assign({ defaultStyle: { font: 'SolaimanLipi' } }, html_to_pdf_make(op));

        if (local){
            console.log(docDefinition);
        } 

        // Add custom fonts and table layouts if provided
        addCustomFonts(pdfMake, pdfFonts);
        addCustomTableLayouts(pdfMake, tableLayouts);

        // Show loader
        $('#theDownloadLoader').show();

        // Generate and download PDF
        pdfMake.createPdf(docDefinition).download(`${file_name}.pdf`, function () {
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
        console.error('Error generating PDF:', error);
        $('#theDownloadLoader').hide();
    }
}

// Function to attach event listener for PDF download
export function downloadPdf(op = {}) {
    let btn = op?.btn ?? 'pdfDownload';

    $(`#${btn}`).off('click').on('click', function () {
        try {
            let newOp = Object.assign({}, op, JSON.parse($(this).attr('data-pdf-op') || '{"no":"no"}'));
            MakePdf(newOp);
        } catch (error) {
            console.error('Error initializing PDF download:', error);
        }
    });
}
