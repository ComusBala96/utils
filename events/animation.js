export function loadBounceOnceAnimation() {
    $(window).on('load scroll', function () {
        $('.bounce-once').each(function () {
            let elementTop = $(this).offset().top;
            let windowBottom = $(window).scrollTop() + $(window).height();
            if (elementTop < windowBottom - 150) {
                $(this).addClass('animate-bounce-once');
            } else {
                $(this).removeClass('animate-bounce-once');
            }
        });
    });
}
