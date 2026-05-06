export function scrollToHideShow(handleEvent?: () => void): void {
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleEvent?.();
                ticking = false;
            });
            ticking = true;
        }
    });
}
