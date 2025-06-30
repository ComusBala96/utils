import { app_locale, csrf_token, domain_url, G, local } from '../utils';
export function summer_note(op) {
    const { element = '', height = '', tabSize = '', placeholder = '' } = op;
    $('.' + element).summernote({
        placeholder: placeholder,
        tabsize: tabSize,
        height: height,
        width: '100%',
        disableDragAndDrop: true,
        tabDisable: false,
        followingToolbar: false,
        callbacks: {
            onChange: function () {
                if ($('.' + element).summernote('code') == '<br>') {
                    $('.' + element).summernote('code', '');
                }
            },
            onImageUpload: function (files, editor, welEditable) {
                sendFile(files[0], editor, welEditable, 3, element);
            },
            onMediaDelete: function ($target, editor, $editable) {
                deleteMedia($target[0].src);
            }
        }
    });
}

function sendFile(file, editor, welEditable, ul = 3, element = '') {
    if (local) {
        console.log(file);
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('_token', csrf_token);
    formData.append('lang', app_locale);
    // formData.append("uploadUrl", domain_url + "uploads/summernote/");
    // formData.append("ul", ul)
    $.ajax({
        data: formData,
        type: 'POST',
        url: domain_url + 'upload/summernote',
        cache: false,
        contentType: false,
        processData: false,
        headers: {
            Accept: 'multipart/form-data',
        },
        success: function (res) {
            if (local) {
                console.log('summernote', res);
            }
            if (res === 'size') {
                alert('Image size must be below 1MB');
            } else if (res === 'error') {
                alert('Image format not acceptable');
            } else if (res === 'type') {
                alert('jpg, png or gif accepted only');
            } else {
                let img = document.createElement('img');
                img.src = domain_url + G.paths().summernote + res;
                img.alt = res;
                img.name = Date.now();
                img.className = 'os-pdf-image';
                img.setAttribute('data-style', JSON.stringify({ width: 150, height: 120, alignment: 'center' }));
                img.style.cssText = 'width:150px; height:120px; display:block; margin:0 auto;';
                let wrapper = document.createElement('p');
                wrapper.style.textAlign = 'center';
                wrapper.appendChild(img);
                $('.' + element).summernote('insertNode', wrapper);
            }
        }
    })
        .fail(function (xhr, status, error, req) {
            // just in case posting your form failed
            if (local) {
                console.log(xhr.responseText);
            } 
        });
}

function deleteMedia(img) {
    let file = img.substr(img.lastIndexOf('/') + 1);
    $.ajax({
        data: { img: file, _token: csrf_token },
        type: 'POST',
        url: domain_url + 'delete/summernote',
        success: function (res) {
            if (res === 'error') {
                alert('Img not found, try refresh');
            }
        }
    }).fail(function (xhr, status, error, req) {
        // just in case posting your form failed
        if (local) {
            console.log(xhr.responseText);
        }
    });
}