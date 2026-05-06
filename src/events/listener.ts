// import $ from 'jquery';
// import $ from '@orians/core/jquery';
/* -----------------------------
   Click to hide
----------------------------- */

export function clickToHide(handleEvent?: (e: MouseEvent) => void): void {
    document.addEventListener('click', (e: MouseEvent) => {
        handleEvent?.(e);
    });
}

/* -----------------------------
   Back to top
----------------------------- */

export function backToTop(el: string, handleEvent?: () => void): void {
    const element = document.getElementById(el);

    if (!element) return;

    element.addEventListener('click', () => {
        handleEvent?.();
    });
}

/* -----------------------------
   Change color / value sync
----------------------------- */

interface ChangeColorOptions {
    elements?: string[];
    targets?: string[];
}
export function changeColor(op: ChangeColorOptions = {}): void {
    const { elements = [], targets = [] } = op;
    elements.forEach((element, i) => {
        $(`#${element}`).on('input change', function (this: HTMLElement) {
            const value = $(this).val();
            if (typeof value === 'string') {
                $(`#${targets[i]}`).val(value);
            }
        });
    });
}
/* -----------------------------
   Lazy Images
----------------------------- */
declare global {
    interface Window {
        __lazyObserver?: IntersectionObserver | null;
    }
}
export function initLazyImages(root: Document | HTMLElement = document): void {
    const images = root.querySelectorAll<HTMLImageElement>('img.lazy-img[data-src]');

    /* ---------- Fallback ---------- */
    if (!('IntersectionObserver' in window)) {
        images.forEach((img) => {
            const src = img.dataset.src;

            if (src) {
                img.src = src;
                img.classList.add('loaded');
            }
        });

        return;
    }
    /* ---------- Observer ---------- */
    if (!window.__lazyObserver) {
        window.__lazyObserver = null;
    }
    if (window.__lazyObserver) {
        window.__lazyObserver.disconnect();
    }
    window.__lazyObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const img = entry.target as HTMLImageElement;
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
        },
        {
            rootMargin: '150px',
            threshold: 0.01,
        },
    );
    images.forEach((img) => window.__lazyObserver!.observe(img));
}
