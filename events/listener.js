export function clickToHide(handleEvent = undefined) {
    document.addEventListener('click', (e) => handleEvent(e));
}
export function backToTop(el, handleEvent = undefined) {
    $('#' + el)[0].addEventListener('click', () => handleEvent());
}

export function changeColor(op = {}) {
    const { elements = [], targets = [] } = op;
    elements.forEach((element, i) => {
        $('#' + element).on('input change', function () {
            $('#' + targets[i]).val($(this).val());
        });
    });
}

export function initLazyImages(root = document) {
    const images = root.querySelectorAll('img.lazy-img[data-src]');

    // Fallback
    if (!('IntersectionObserver' in window)) {
        images.forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
        });
        return;
    }

    // Create namespace once
    if (!window.__lazyObserver) {
        window.__lazyObserver = null;
    }

    // Disconnect old observer
    if (window.__lazyObserver) {
        window.__lazyObserver.disconnect();
    }

    window.__lazyObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const img = entry.target;
            const src = img.dataset.src;

            if (!src || img.dataset.loaded) {
                observer.unobserve(img);
                return;
            }

            const temp = new Image();
            temp.src = src;

            temp.onload = () => {
                img.src = src;
                img.dataset.loaded = 'true';
                img.classList.add('loaded');
            };

            observer.unobserve(img);
        });
    }, {
        rootMargin: '150px',
        threshold: 0.01
    });

    images.forEach(img => window.__lazyObserver.observe(img));
}
