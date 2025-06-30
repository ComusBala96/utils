import Swal from 'sweetalert2';
import { G, local } from '../variables/variables';

export function confirmAlert(op, callBack = undefined) {
    const { element = 'n/a', confirmTitle = G.mgs.confirm, confirmMessage = '', customConfirm = false } = op;
    if (customConfirm) {
        switch (element) {
        default:
            alert('Case not found in confirm for ' + element);
            break;
        }
    } else {
        Swal.fire({
            title: 'Are you sure?',
            text: confirmTitle,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.isConfirmed) {
                if (callBack) {
                    callBack(op);
                } else {
                    if (local) {
                        console.warn('No callback defined for confirm in ' + element);
                    }
                }
            }
        });
        // let buttons = {};
        // buttons[G.mgs.btns.confirm] = {
        //     btnClass: 'px-3 py-1 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800',
        //     action: function () {
        //         if (callBack) {
        //             callBack(op);
        //         } else {
        //             if (local) {
        //                 console.warn('No callback defined for confirm in ' + element);
        //             }
        //         }
        //     },
        // };
        // buttons[G.mgs.btns.cancel] = {
        //     btnClass: 'px-3 py-1 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-700',
        //     style: 'cancel',
        //     action: function () {},
        // };
        // $.confirm({
        //     title: '<span class="w-96" style="font-size: 14px; color: green;"> ' + confirmTitle + ' </span>',
        //     content: confirmMessage,
        //     animation: 'zoom',
        //     closeAnimation: 'scale',
        //     buttons: buttons,
        // });
    }
}
