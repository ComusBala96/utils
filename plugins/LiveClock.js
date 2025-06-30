import moment from 'moment';
export function Clock() {
    setInterval(() => {
        $('.clock').text(moment().format('MMMM Do, YYYY, h:mm:ss A'));
    }, 1000);
}
