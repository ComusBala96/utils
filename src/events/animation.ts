// import $ from 'jquery';
// import $ from '@orians/core/jquery';
export function loadBounceOnceAnimation(): void {
    const $window = $(window);
    $window.on('load scroll', () => {
        const windowBottom = $window.scrollTop()! + $window.height()!;
        $('.bounce-once').each(function (this: HTMLElement) {
            const $el = $(this);
            const elementTop = $el.offset()?.top ?? 0;
            if (elementTop < windowBottom - 150) {
                $el.addClass('animate-bounce-once');
            } else {
                $el.removeClass('animate-bounce-once');
            }
        });
    });
}
