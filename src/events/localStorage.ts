// import $ from 'jquery';
// import $ from '@orians/core/jquery';
type Theme = 'light' | 'dark';

export const loadLocalStorage = (): void => {
    const colorTheme = localStorage.getItem('color-theme') as Theme | null;
    const theme: Theme = colorTheme === 'dark' ? 'dark' : 'light';
    setStorage('color-theme', theme);
};

function setStorage(key: string, value: string): void {
    $(window).on('load', () => {
        localStorage.setItem(key, value);
    });
}
