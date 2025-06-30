import 'jodit/es5/jodit.min.css';
import { Jodit } from 'jodit';
import 'jodit/esm/plugins/all.js';
import { app_locale, csrf_token, domain_url, local } from '../utils';
export function jodit(op = {}) {
    const { element = '', height = '', placeholder = '', removeButtons = [] } = op;
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
            insertImageAsBase64URI: true
        },
        image: {
            editSrc: true,
            width: '300px',
            useImageEditor: true
        },
        removeButtons: ['speechRecognize', 'file', ...removeButtons],
    });
    
    editor.editor.style.fontFamily = fontFamily;

    editor.events.on('afterRemoveNode', function (file) {
        if (!file.src.startsWith('blob:')) {
            let name = file.src.split('/').pop();
            $.ajax({
                data: { file: name, _token: csrf_token },
                type: 'POST',
                url: domain_url + 'delete/jodit',
                success: function (res) {
                    if (local) {
                        console.log(res);
                    }
                    if (res === 'error') {
                        alert('Image not found, try refresh');
                    }
                }
            }).fail(function (xhr, status, error, req) {
                // just in case posting your form failed
                if (local) {
                    console.log(xhr.responseText);
                }
            });
        }
    });
    return editor;
}