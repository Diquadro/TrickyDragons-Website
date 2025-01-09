"use strict";
(self["webpackChunktrickydragons_webserver"] = self["webpackChunktrickydragons_webserver"] || []).push([["landingpage"],{

/***/ "./src/www/scripts/api/send_email.ts":
/*!*******************************************!*\
  !*** ./src/www/scripts/api/send_email.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ send_email)
/* harmony export */ });
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


/***/ }),

/***/ "./src/www/scripts/api/site_accesses.ts":
/*!**********************************************!*\
  !*** ./src/www/scripts/api/site_accesses.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ site_accesses)
/* harmony export */ });
function site_accesses(API_URL) {
    fetch("".concat(API_URL, "/site-accesses"), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    })
        .then(function () { return console.log('Site access logged'); })
        .catch(function (err) { return console.error('Error logging site access: ', err); });
}


/***/ }),

/***/ "./src/www/scripts/error_toast.ts":
/*!****************************************!*\
  !*** ./src/www/scripts/error_toast.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ error_toast)
/* harmony export */ });
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


/***/ }),

/***/ "./src/www/views/landingpage/landingpage.ts":
/*!**************************************************!*\
  !*** ./src/www/views/landingpage/landingpage.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _scripts_api_site_accesses__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../scripts/api/site_accesses */ "./src/www/scripts/api/site_accesses.ts");
/* harmony import */ var _scripts_cta__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scripts/cta */ "./src/www/views/landingpage/scripts/cta.ts");
/* harmony import */ var _scripts_cta_modal__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./scripts/cta_modal */ "./src/www/views/landingpage/scripts/cta_modal.ts");



console.log('TEST');
var API_URL =  false ? 0 : 'http://localhost:5000';
(0,_scripts_api_site_accesses__WEBPACK_IMPORTED_MODULE_0__["default"])(API_URL);
(0,_scripts_cta__WEBPACK_IMPORTED_MODULE_1__["default"])(API_URL);
(0,_scripts_cta_modal__WEBPACK_IMPORTED_MODULE_2__["default"])();


/***/ }),

/***/ "./src/www/views/landingpage/scripts/cta.ts":
/*!**************************************************!*\
  !*** ./src/www/views/landingpage/scripts/cta.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _scripts_api_send_email__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../scripts/api/send_email */ "./src/www/scripts/api/send_email.ts");
/* harmony import */ var _scripts_error_toast__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../scripts/error_toast */ "./src/www/scripts/error_toast.ts");
/* harmony import */ var _cta_modal__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./cta_modal */ "./src/www/views/landingpage/scripts/cta_modal.ts");



/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(API_URL) {
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
                (0,_scripts_error_toast__WEBPACK_IMPORTED_MODULE_1__["default"])('Invalid email!');
                return;
            }
            var email = _input.value;
            _input.value = '';
            (0,_scripts_api_send_email__WEBPACK_IMPORTED_MODULE_0__["default"])(API_URL, email);
            (0,_cta_modal__WEBPACK_IMPORTED_MODULE_2__.show_modal)();
        });
    });
}


/***/ }),

/***/ "./src/www/views/landingpage/scripts/cta_modal.ts":
/*!********************************************************!*\
  !*** ./src/www/views/landingpage/scripts/cta_modal.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ cta_modal),
/* harmony export */   show_modal: () => (/* binding */ show_modal)
/* harmony export */ });
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


/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("./src/www/views/landingpage/landingpage.ts"));
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFTLFdBQVc7SUFDaEIsSUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQWdCO0lBQzdELElBQUksS0FBSztRQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUM3QyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHJpY2t5ZHJhZ29ucy13ZWJzZXJ2ZXIvLi9zcmMvd3d3L3NjcmlwdHMvYXBpL3NlbmRfZW1haWwudHMiLCJ3ZWJwYWNrOi8vdHJpY2t5ZHJhZ29ucy13ZWJzZXJ2ZXIvLi9zcmMvd3d3L3NjcmlwdHMvYXBpL3NpdGVfYWNjZXNzZXMudHMiLCJ3ZWJwYWNrOi8vdHJpY2t5ZHJhZ29ucy13ZWJzZXJ2ZXIvLi9zcmMvd3d3L3NjcmlwdHMvZXJyb3JfdG9hc3QudHMiLCJ3ZWJwYWNrOi8vdHJpY2t5ZHJhZ29ucy13ZWJzZXJ2ZXIvLi9zcmMvd3d3L3ZpZXdzL2xhbmRpbmdwYWdlL2xhbmRpbmdwYWdlLnRzIiwid2VicGFjazovL3RyaWNreWRyYWdvbnMtd2Vic2VydmVyLy4vc3JjL3d3dy92aWV3cy9sYW5kaW5ncGFnZS9zY3JpcHRzL2N0YS50cyIsIndlYnBhY2s6Ly90cmlja3lkcmFnb25zLXdlYnNlcnZlci8uL3NyYy93d3cvdmlld3MvbGFuZGluZ3BhZ2Uvc2NyaXB0cy9jdGFfbW9kYWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc2VuZF9lbWFpbChBUElfVVJMOiBzdHJpbmcsIGVtYWlsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBmZXRjaChgJHtBUElfVVJMfS9lbWFpbC1zdWJzY3JpcHRpb25gLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGVtYWlsIH0pLFxuICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IGNvbnNvbGUubG9nKCdFbWFpbCBzZW50JykpXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKCdFcnJvciBzZW5kaW5nIGVtYWlsOiAnLCBlcnIpKVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc2l0ZV9hY2Nlc3NlcyhBUElfVVJMOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBmZXRjaChgJHtBUElfVVJMfS9zaXRlLWFjY2Vzc2VzYCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHt9KSxcbiAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiBjb25zb2xlLmxvZygnU2l0ZSBhY2Nlc3MgbG9nZ2VkJykpXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKCdFcnJvciBsb2dnaW5nIHNpdGUgYWNjZXNzOiAnLCBlcnIpKVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZXJyb3JfdG9hc3QobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIHRvYXN0IGFscmVhZHkgZXhpc3RzXG4gICAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlcnJvcl90b2FzdCcpKSB7XG4gICAgICAgIHJldHVybiAvLyBTa2lwIGNyZWF0aW9uIGlmIHRoZSB0b2FzdCBhbHJlYWR5IGV4aXN0c1xuICAgIH1cblxuICAgIGNvbnN0IHRvYXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0b2FzdC5pZCA9ICdlcnJvcl90b2FzdCcgLy8gQXNzaWduIGEgdW5pcXVlIElEXG4gICAgdG9hc3QudGV4dENvbnRlbnQgPSBtZXNzYWdlXG5cbiAgICAvLyBTdHlsZSBmb3IgdGhlIHRvYXN0XG4gICAgdG9hc3Quc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnXG4gICAgdG9hc3Quc3R5bGUudG9wID0gJy01MHB4JyAvLyBTdGFydCBvdXRzaWRlIHRoZSB2aXNpYmxlIGFyZWFcbiAgICB0b2FzdC5zdHlsZS5sZWZ0ID0gJzUwJSdcbiAgICB0b2FzdC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgtNTAlKSdcbiAgICB0b2FzdC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2RhMmQyYScgLy8gWW91ciByZWQgY29sb3JcbiAgICB0b2FzdC5zdHlsZS5jb2xvciA9ICd3aGl0ZSdcbiAgICB0b2FzdC5zdHlsZS5wYWRkaW5nID0gJzEwcHggMjBweCdcbiAgICB0b2FzdC5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnNXB4J1xuICAgIHRvYXN0LnN0eWxlLmJveFNoYWRvdyA9ICcwcHggNHB4IDZweCByZ2JhKDAsIDAsIDAsIDAuMSknXG4gICAgdG9hc3Quc3R5bGUuZm9udFNpemUgPSAnMXJlbSdcbiAgICB0b2FzdC5zdHlsZS5mb250V2VpZ2h0ID0gJ2JvbGQnXG4gICAgdG9hc3Quc3R5bGUuekluZGV4ID0gJzk5OTknXG4gICAgdG9hc3Quc3R5bGUudHJhbnNpdGlvbiA9ICd0b3AgMC41cyBlYXNlJyAvLyBBbmltYXRpb24gZm9yIHNsaWRpbmcgZG93blxuICAgIHRvYXN0LnN0eWxlLmJveFNoYWRvdyA9ICcwcHggMHB4IDE1cHggcmdiYSgwLCAwLCAwLCAwLjUpJyAvLyBBZGQgc2xpZ2h0bHkgbGFyZ2VyIHNoYWRvd1xuICAgIHRvYXN0LnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInXG5cbiAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCAxNDAwKSB7XG4gICAgICAgIHRvYXN0LnN0eWxlLmZvbnRTaXplID0gJzEuNHJlbSdcbiAgICAgICAgdG9hc3Quc3R5bGUucGFkZGluZyA9ICcxNXB4IDI1cHgnXG4gICAgICAgIHRvYXN0LnN0eWxlLmJvcmRlclJhZGl1cyA9ICc4cHgnXG4gICAgfVxuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0b2FzdClcblxuICAgIC8vIFRyaWdnZXIgdGhlIHNsaWRlIGRvd24gYW5pbWF0aW9uXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgdG9hc3Quc3R5bGUudG9wID0gJzIwcHgnIC8vIFNsaWRlIGRvd24gaW50byB2aWV3XG4gICAgfSlcblxuICAgIC8vIFJlbW92ZSB0aGUgdG9hc3QgYWZ0ZXIgNSBzZWNvbmRzXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRvYXN0LnN0eWxlLnRyYW5zaXRpb24gPSAndG9wIDAuNXMgZWFzZSwgb3BhY2l0eSAwLjVzIGVhc2UnXG4gICAgICAgIHRvYXN0LnN0eWxlLnRvcCA9ICctNTBweCcgLy8gU2xpZGUgYmFjayB1cFxuICAgICAgICB0b2FzdC5zdHlsZS5vcGFjaXR5ID0gJzAnIC8vIEZhZGUgb3V0XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdG9hc3QucmVtb3ZlKCksIDUwMCkgLy8gUmVtb3ZlIGFmdGVyIGZhZGUtb3V0XG4gICAgfSwgMjUwMClcbn1cbiIsImltcG9ydCBzaXRlX2FjY2Vzc2VzIGZyb20gJy4uLy4uL3NjcmlwdHMvYXBpL3NpdGVfYWNjZXNzZXMnXG5pbXBvcnQgY3RhIGZyb20gJy4vc2NyaXB0cy9jdGEnXG5pbXBvcnQgY3RhX21vZGFsIGZyb20gJy4vc2NyaXB0cy9jdGFfbW9kYWwnXG5cbmNvbnNvbGUubG9nKCdURVNUJylcblxuY29uc3QgQVBJX1VSTCA9XG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyA/ICdodHRwczovL2FwaS50cmlja3lkcmFnb25zLmNvbScgOiAnaHR0cDovL2xvY2FsaG9zdDo1MDAwJ1xuXG5zaXRlX2FjY2Vzc2VzKEFQSV9VUkwpXG5jdGEoQVBJX1VSTClcbmN0YV9tb2RhbCgpXG4iLCJpbXBvcnQgc2VuZF9lbWFpbCBmcm9tICcuLi8uLi8uLi9zY3JpcHRzL2FwaS9zZW5kX2VtYWlsJ1xuaW1wb3J0IGVycm9yX3RvYXN0IGZyb20gJy4uLy4uLy4uL3NjcmlwdHMvZXJyb3JfdG9hc3QnXG5pbXBvcnQgeyBzaG93X21vZGFsIH0gZnJvbSAnLi9jdGFfbW9kYWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChBUElfVVJMOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBidXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmN0YSA+IC5idXR0b24nKVxuXG4gICAgYnV0dG9ucy5mb3JFYWNoKChidXR0b246IEhUTUxCdXR0b25FbGVtZW50KSA9PiB7XG4gICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnRcbiAgICAgICAgICAgIGNvbnN0IF9jdGEgPSB0YXJnZXQuY2xvc2VzdCgnLmN0YScpXG5cbiAgICAgICAgICAgIGlmICghX2N0YSkge1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBfaW5wdXQgPSBfY3RhLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9XCJlbWFpbFwiXScpIGFzIEhUTUxJbnB1dEVsZW1lbnRcblxuICAgICAgICAgICAgaWYgKCFfaW5wdXQgfHwgIV9pbnB1dC5jaGVja1ZhbGlkaXR5KCkpIHtcbiAgICAgICAgICAgICAgICAvLyBfaW5wdXQuY2xhc3NMaXN0LmFkZCgnZXJyb3InKVxuICAgICAgICAgICAgICAgIC8vIHNldFRpbWVvdXQoKCkgPT4gX2lucHV0LmNsYXNzTGlzdC5yZW1vdmUoJ2Vycm9yJyksIDUwMClcblxuICAgICAgICAgICAgICAgIGVycm9yX3RvYXN0KCdJbnZhbGlkIGVtYWlsIScpXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGVtYWlsID0gX2lucHV0LnZhbHVlXG4gICAgICAgICAgICBfaW5wdXQudmFsdWUgPSAnJ1xuXG4gICAgICAgICAgICBzZW5kX2VtYWlsKEFQSV9VUkwsIGVtYWlsKVxuXG4gICAgICAgICAgICBzaG93X21vZGFsKClcbiAgICAgICAgfSlcbiAgICB9KVxufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIHNob3dfbW9kYWwoKSB7XG4gICAgY29uc3QgbW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwnKSBhcyBIVE1MRWxlbWVudFxuICAgIGlmIChtb2RhbCkgbW9kYWwuY2xhc3NMaXN0LmFkZCgnc2hvdycpXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGN0YV9tb2RhbCgpIHtcbiAgICBjb25zdCBhY3Rpb25CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYWN0aW9uJykgYXMgSFRNTEVsZW1lbnRcblxuICAgIC8vIENsb3NlIG1vZGFsIG9uIGFjdGlvbiBidXR0b24gY2xpY2tcbiAgICBhY3Rpb25CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZV9tb2RhbClcbn1cblxuZnVuY3Rpb24gY2xvc2VfbW9kYWwoKSB7XG4gICAgY29uc3QgbW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwnKSBhcyBIVE1MRWxlbWVudFxuICAgIGlmIChtb2RhbCkgbW9kYWwuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpXG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=