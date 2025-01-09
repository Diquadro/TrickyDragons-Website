"use strict";
(self["webpackChunktrickydragons_webserver"] = self["webpackChunktrickydragons_webserver"] || []).push([[237],{

/***/ 491:
/***/ (() => {


;// ./src/www/scripts/api/site_accesses.ts
function site_accesses(API_URL) {
    fetch("".concat(API_URL, "/site-accesses"), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    })
        .then(function () { return console.log('Site access logged'); })
        .catch(function (err) { return console.error('Error logging site access: ', err); });
}

;// ./src/www/scripts/api/send_email.ts
function send_email(API_URL, email) {
    fetch("".concat(API_URL, "/email-subscription"), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
    })
        .then(function () { return console.log('Email sent'); })
        .catch(function (err) { return console.error('Error sending email: ', err); });
}

;// ./src/www/scripts/error_toast.ts
function error_toast(message) {
    // Check if the toast already exists
    if (document.getElementById('error_toast')) {
        return; // Skip creation if the toast already exists
    }
    var toast = document.createElement('div');
    toast.id = 'error_toast'; // Assign a unique ID
    toast.textContent = message;
    // Style for the toast
    toast.style.position = 'fixed';
    toast.style.top = '-50px'; // Start outside the visible area
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = '#da2d2a'; // Your red color
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
    toast.style.fontSize = '1rem';
    toast.style.fontWeight = 'bold';
    toast.style.zIndex = '9999';
    toast.style.transition = 'top 0.5s ease'; // Animation for sliding down
    toast.style.boxShadow = '0px 0px 15px rgba(0, 0, 0, 0.5)'; // Add slightly larger shadow
    toast.style.textAlign = 'center';
    if (window.innerWidth < 1400) {
        toast.style.fontSize = '1.4rem';
        toast.style.padding = '15px 25px';
        toast.style.borderRadius = '8px';
    }
    document.body.appendChild(toast);
    // Trigger the slide down animation
    requestAnimationFrame(function () {
        toast.style.top = '20px'; // Slide down into view
    });
    // Remove the toast after 5 seconds
    setTimeout(function () {
        toast.style.transition = 'top 0.5s ease, opacity 0.5s ease';
        toast.style.top = '-50px'; // Slide back up
        toast.style.opacity = '0'; // Fade out
        setTimeout(function () { return toast.remove(); }, 500); // Remove after fade-out
    }, 2500);
}

;// ./src/www/views/landingpage/scripts/cta_modal.ts
function show_modal() {
    var modal = document.getElementById('modal');
    if (modal)
        modal.classList.add('show');
}
function cta_modal() {
    var actionButton = document.getElementById('modal-action');
    // Close modal on action button click
    actionButton.addEventListener('click', close_modal);
}
function close_modal() {
    var modal = document.getElementById('modal');
    if (modal)
        modal.classList.remove('show');
}

;// ./src/www/views/landingpage/scripts/cta.ts



/* harmony default export */ function cta(API_URL) {
    var buttons = document.querySelectorAll('.cta > .button');
    buttons.forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            var target = event.target;
            var _cta = target.closest('.cta');
            if (!_cta) {
                return;
            }
            var _input = _cta.querySelector('input[type="email"]');
            if (!_input || !_input.checkValidity()) {
                // _input.classList.add('error')
                // setTimeout(() => _input.classList.remove('error'), 500)
                error_toast('Invalid email!');
                return;
            }
            var email = _input.value;
            _input.value = '';
            send_email(API_URL, email);
            show_modal();
        });
    });
}

;// ./src/www/views/landingpage/landingpage.ts



console.log('TEST');
var API_URL =  true ? 'https://api.trickydragons.com' : 0;
site_accesses(API_URL);
cta(API_URL);
cta_modal();


/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__(491));
/******/ }
]);
//# sourceMappingURL=landingpage.bb554bcd.js.map