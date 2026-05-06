import { app_locale } from '../config/config.js';
import type { Jodit } from 'jodit';

interface JoditOptions {
    element?: string;
    height?: number | string;
    placeholder?: string;
    removeButtons?: string[];
}

export async function jodit(op: JoditOptions = {}): Promise<Jodit> {
    // @ts-ignore
    const [{ Jodit }] = await Promise.all([import('jodit'), import('jodit/es5/jodit.min.css'), import('jodit/esm/plugins/all.js')]);
    const { element = '', height = '', placeholder = '', removeButtons = [] } = op;
    const fontFamily = app_locale === 'bn' ? 'SolaimanLipi' : 'Roboto';
    const editor = Jodit.make(`.${element}`, {
        readonly: false,
        width: '100%',
        height,
        placeholder,
        style: {
            background: 'rgba(209, 213, 219, 0.2)',
            fontSize: '18px',
            fontFamily,
        },
        // @ts-ignore
        defaultMode: Jodit.MODE_WYSIWYG,
        language: app_locale === 'bn' ? 'bn' : 'en',
        toolbarAdaptive: false,
        uploader: {
            insertImageAsBase64URI: true,
        },
        image: {
            editSrc: true,
            // @ts-ignore
            width: '300px',
            useImageEditor: true,
        },
        removeButtons: ['speechRecognize', 'file', ...removeButtons],
    });

    if (editor?.editor) {
        editor.editor.style.fontFamily = fontFamily;
    }

    return editor;
}
