export function scrollToHideShow(handleEvent = undefined) {
    window.addEventListener('scroll', () => handleEvent());
}
