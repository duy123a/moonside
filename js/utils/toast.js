import 'toastify-js/src/toastify.css';
import Toastify from 'toastify-js';

export const toast = {
  info(message) {
    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: 'top', // `top` or `bottom`
      position: 'right', // `left`, `center` or `right`
      style: {
        background: '#03a9f4',
      },
      onClick: function () {}, // Callback after click
    }).showToast();
  },
  success(message) {
    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: 'top', // `top` or `bottom`
      position: 'right', // `left`, `center` or `right`
      style: {
        background: '#4caf50',
      },
      onClick: function () {}, // Callback after click
    }).showToast();
  },
  error(message) {
    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: 'top', // `top` or `bottom`
      position: 'right', // `left`, `center` or `right`
      style: {
        background: '#ef5350',
      },
      onClick: function () {}, // Callback after click
    }).showToast();
  },
};
