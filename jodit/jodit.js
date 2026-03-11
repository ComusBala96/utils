import { app_locale, } from '../utils';

export async function jodit(op = {}) {
    const [{ Jodit }] = await Promise.all([import('jodit'), import('jodit/es5/jodit.min.css'), import('jodit/esm/plugins/all.js'),]);
    const { element = '', height = '', placeholder = '', removeButtons = [], } = op;
    const fontFamily = app_locale === 'bn' ? 'SolaimanLipi' : 'Roboto';
    const editor = new Jodit('.' + element, {
        readonly: false,
        width: '100%',
        height: height,
        placeholder: placeholder,
        style: {
            background: 'rgba(209, 213, 219, 0.2)',
            fontSize: '18px',
            fontFamily: fontFamily,
        },
        defaultMode: Jodit.MODE_WYSIWYG,
        language: app_locale === 'bn' ? 'bn' : 'en',
        toolbarAdaptive: false,
        uploader: {
            insertImageAsBase64URI: true,
        },
        image: {
            editSrc: true,
            width: '300px',
            useImageEditor: true,
        },
        removeButtons: ['speechRecognize', 'file', ...removeButtons],
    });
    editor.editor.style.fontFamily = fontFamily;

    return editor;
}
