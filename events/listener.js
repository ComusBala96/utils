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

export function initLazyImages() {
    const images = document.querySelectorAll('img.lazy-img');
    if (!('IntersectionObserver' in window)) {
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
        return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const img = entry.target;
            const realSrc = img.dataset.src;
            if (!realSrc) return;
            const tempImg = new Image();
            tempImg.src = realSrc;
            tempImg.onload = () => {
                img.src = realSrc;
                img.classList.add('loaded');
            };
            obs.unobserve(img);
        });
    }, {
        rootMargin: '100px',
        threshold: 0.1,
    });
    images.forEach(img => observer.observe(img));
}
