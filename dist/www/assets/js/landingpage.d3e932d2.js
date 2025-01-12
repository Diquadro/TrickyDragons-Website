"use strict";
(self["webpackChunktrickydragons_webserver"] = self["webpackChunktrickydragons_webserver"] || []).push([[237],{

/***/ 781:
/***/ (() => {


;// ./src/www/scripts/api/site_access.ts
function site_accesses(API_URL) {
    return fetch("".concat(API_URL, "/site_access"), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });
}

;// ./src/www/scripts/api/send_email.ts
function send_email(API_URL, email) {
    return fetch("".concat(API_URL, "/email_subscription"), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
    });
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
function show_modal(id) {
    var modal = document.getElementById(id);
    if (modal)
        modal.classList.add('show');
}
function cta_modal() {
    // Seleziona tutti i bottoni con la classe `modal-action`
    var modal_buttons = document.querySelectorAll('.modal-content > .action-button');
    modal_buttons.forEach(function (button) {
        button.addEventListener('click', function (event) { return close_modal(event); });
    });
}
function close_modal(event) {
    // Trova il modale più vicino al bottone cliccato
    console.log('HELLO');
    var target = event.target;
    var modal = target.closest('.modal-overlay');
    if (modal)
        modal.classList.remove('show');
}

;// ./src/www/views/landingpage/scripts/cta.ts
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};



var EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
/* harmony default export */ function cta(API_URL) {
    var _this = this;
    var buttons = document.querySelectorAll('.cta > .button');
    buttons.forEach(function (button) {
        button.addEventListener('click', function (event) { return __awaiter(_this, void 0, void 0, function () {
            var target, _cta, _input, email, response, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event.preventDefault();
                        target = event.target;
                        _cta = target.closest('.cta');
                        if (!_cta) {
                            return [2 /*return*/];
                        }
                        _input = _cta.querySelector('input[type="email"]');
                        // Validate email format
                        if (!_input || !EMAIL_REGEX.test(_input.value)) {
                            // _input.classList.add('error')
                            // setTimeout(() => _input.classList.remove('error'), 500)
                            error_toast('Invalid email!');
                            return [2 /*return*/];
                        }
                        email = _input.value;
                        toggle_controls(_input, button);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, send_email(API_URL, email)
                            // Handle response based on server status
                        ];
                    case 2:
                        response = _a.sent();
                        // Handle response based on server status
                        switch (response.status) {
                            case 409: // Email already exists
                                show_modal('modal_email_duplicate');
                                break;
                            case 200: // Subscription reactivated
                                show_modal('modal_email_reactivated');
                                break;
                            case 201: // New subscription
                                show_modal('modal_email_sent');
                                break;
                            default: // Unknown error
                                error_toast('Something went wrong. Please try again later.');
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _a.sent();
                        error_toast('Unable to reach the server. Please try again later.');
                        return [3 /*break*/, 5];
                    case 4:
                        _input.value = '';
                        toggle_controls(_input, button);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
    });
}
// Utility function to disable/enable input and button
function toggle_controls(input, button) {
    input.disabled = !input.disabled;
    button.disabled = !button.disabled;
}

;// ./src/www/views/landingpage/landingpage.ts



console.log('Welcome to the Tricky Dragons™ World');
var API_URL =  true ? 'https://api.trickydragons.com' : 0;
site_accesses(API_URL);
cta(API_URL);
cta_modal();


/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__(781));
/******/ }
]);
//# sourceMappingURL=landingpage.d3e932d2.js.map