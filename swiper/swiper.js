import Swiper from 'swiper';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
export function swiper(op = {}) {
    const { elements = [], directions = [], slidesPerViews = [],
        spaceBetween = 10, breakpoints = [], loops = [], autoPlay = [],
        navigation = [], pagination = [], freeMode = false, grabCursor = false,
        mousewheel = { enabled: false, } } = op;
    elements.forEach((element, i) => {
        new Swiper('.' + element, {
            direction: directions[i],
            slidesPerView: slidesPerViews[i],
            spaceBetween: spaceBetween,
            loop: loops[i],
            autoplay: autoPlay[i],
            navigation: navigation[i],
            pagination: pagination[i],
            freeMode: freeMode,
            grabCursor: grabCursor,
            mousewheel: mousewheel,
            breakpoints: {
                496: {
                    slidesPerView: breakpoints[i].xs,
                    mousewheel: {
                        enabled: false,
                    },
                    grabCursor: false,
                },
                640: {
                    slidesPerView: breakpoints[i].sm,
                    mousewheel: {
                        enabled: false,
                    },
                    grabCursor: false,
                },
                768: {
                    slidesPerView: breakpoints[i].md,
                    mousewheel: {
                        enabled: false,
                    },
                    grabCursor: false,
                },
                1024: {
                    slidesPerView: breakpoints[i].lg,
                    mousewheel: {
                        enabled: false,
                    },
                    grabCursor: false,
                },
            },
            modules: [Navigation, Autoplay, Pagination],
        });
    });

}