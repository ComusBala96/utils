export const loadLocalStorage = () => {
    const colorTheme = localStorage.getItem('color-theme');
    if (colorTheme == null) {
        loadStorage('color-theme', 'light');
    }
    if (colorTheme == 'light') {
        loadStorage('color-theme', 'light');
    }
    if (colorTheme == 'dark') {
        loadStorage('color-theme', 'dark');
    }
};
function loadStorage(title, value) {
    $(window).on('load', function () {
        localStorage.setItem(title, value);
    });
}
