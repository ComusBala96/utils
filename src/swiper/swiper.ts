import Swiper from 'swiper';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';

interface BreakpointConfig {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
}

interface SwiperConfig {
    element: string;
    direction?: 'horizontal' | 'vertical';
    slidesPerView?: number;
    spaceBetween?: number;
    loop?: boolean;
    autoplay?: any;
    navigation?: any;
    pagination?: any;
    breakpoints?: BreakpointConfig;
    freeMode?: boolean;
    grabCursor?: boolean;
    mousewheel?: any;
}

export function swiper(configs: SwiperConfig[] = []) {
    configs.forEach((cfg) => {
        const { element, direction = 'horizontal', slidesPerView = 1, spaceBetween = 10, loop = false, autoplay = false, navigation = false, pagination = false, breakpoints = {}, freeMode = false, grabCursor = false, mousewheel = { enabled: false } } = cfg;
        const selector = `.${element}`;
        if (!document.querySelector(selector)) return;
        new Swiper(selector, {
            direction,
            slidesPerView,
            spaceBetween,
            loop,
            autoplay,
            navigation,
            pagination,
            freeMode,
            grabCursor,
            mousewheel,
            breakpoints: {
                496: {
                    slidesPerView: breakpoints.xs ?? slidesPerView,
                    mousewheel: { enabled: false },
                    grabCursor: false,
                },

                640: {
                    slidesPerView: breakpoints.sm ?? slidesPerView,
                    mousewheel: { enabled: false },
                    grabCursor: false,
                },

                768: {
                    slidesPerView: breakpoints.md ?? slidesPerView,
                    mousewheel: { enabled: false },
                    grabCursor: false,
                },

                1024: {
                    slidesPerView: breakpoints.lg ?? slidesPerView,
                    mousewheel: { enabled: false },
                    grabCursor: false,
                },
            },

            modules: [Navigation, Autoplay, Pagination],
        });
    });
}
