// import $ from 'jquery';
// import $ from '@orians/core/jquery';
import { app_locale, csrf_token, domain_url, config, local } from '../config/config.js';
interface SummernoteOptions {
    element: string;
    height?: number;
    tabSize?: number;
    placeholder?: string;
}

export function summer_note(op: SummernoteOptions) {
    const { element, height = 200, tabSize = 4, placeholder = '' } = op;
    const $editor = $(`.${element}`);
    if (!$editor.length) return;
    // @ts-ignore
    $editor.summernote({
        placeholder,
        tabsize: tabSize,
        height,
        width: '100%',

        disableDragAndDrop: true,
        followingToolbar: false,

        callbacks: {
            onChange(contents: string) {
                if (contents === '<p><br></p>' || contents === '<br>') {
                    // @ts-ignore
                    $editor.summernote('code', '');
                }
            },

            onImageUpload(files: File[]) {
                if (!files?.length) return;

                uploadImage(files[0], element);
            },

            onMediaDelete($target: JQuery) {
                const src = $target[0]?.getAttribute('src');
                if (src) deleteMedia(src);
            },
        },
    });
}

function uploadImage(file: File, element: string) {
    if (local) console.log('Uploading', file);

    const formData = new FormData();
    if (csrf_token && app_locale) {
        formData.append('file', file);
        formData.append('_token', csrf_token);
        formData.append('lang', app_locale);
    }

    $.ajax({
        url: `${domain_url}upload/summernote`,
        method: 'POST',
        data: formData,
        cache: false,
        processData: false,
        contentType: false,
        headers: {
            Accept: 'multipart/form-data',
        },
        success(res: string) {
            if (local) console.log('summernote response', res);
            if (handleUploadError(res)) return;
            insertImage(res, element);
        },
        error(xhr: JQuery.jqXHR<any>) {
            if (local) console.error(xhr.responseText);
        },
    });
}
function insertImage(filename: string, element: string) {
    const img = document.createElement('img');

    img.src = `${domain_url}${config.paths.summernote}${filename}`;
    img.alt = filename;
    img.id = Date.now().toString();
    img.className = 'os-pdf-image';
    const style = {
        width: 150,
        height: 120,
        alignment: 'center',
    };
    img.setAttribute('data-style', JSON.stringify(style));
    img.style.cssText = 'width:150px;height:120px;display:block;margin:0 auto';
    const wrapper = document.createElement('p');
    wrapper.style.textAlign = 'center';
    wrapper.appendChild(img);
    // @ts-ignore
    $(`.${element}`).summernote('insertNode', wrapper);
}

function handleUploadError(res: string) {
    const errors: Record<string, string> = {
        size: 'Image size must be below 1MB',
        error: 'Image format not acceptable',
        type: 'jpg, png or gif accepted only',
    };
    if (errors[res]) {
        alert(errors[res]);
        return true;
    }
    return false;
}

function deleteMedia(imgUrl: string) {
    const file = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);
    $.ajax({
        url: `${domain_url}delete/summernote`,
        method: 'POST',
        data: {
            img: file,
            _token: csrf_token,
        },
        success(res: string) {
            if (res === 'error') {
                alert('Image not found, try refresh');
            }
        },
        error(xhr: JQuery.jqXHR<any>) {
            if (local) console.error(xhr.responseText);
        },
    });
}
