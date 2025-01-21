"use strict";
(self["webpackChunktrickydragons_webserver"] = self["webpackChunktrickydragons_webserver"] || []).push([[585],{

/***/ 456:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   H: () => (/* binding */ API_URL)
/* harmony export */ });
var API_URL =  true ? 'https://api.trickydragons.com' : 0;


/***/ }),

/***/ 976:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _scripts_costants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(456);
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

// Extract the email from the URL's query parameters
function getEmailFromQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('email') || null;
}
// Send the unsubscribe request to the backend
function unsubscribe(email) {
    return __awaiter(this, void 0, void 0, function () {
        var response, _a, _b, _c, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, fetch("".concat(_scripts_costants__WEBPACK_IMPORTED_MODULE_0__/* .API_URL */ .H, "/email_deactivation/").concat(email))];
                case 1:
                    response = _d.sent();
                    if (!response.ok) return [3 /*break*/, 2];
                    console.log('Unsubscribe request sent successfully.');
                    return [3 /*break*/, 4];
                case 2:
                    _b = (_a = console).error;
                    _c = ['Failed to unsubscribe:'];
                    return [4 /*yield*/, response.text()];
                case 3:
                    _b.apply(_a, _c.concat([_d.sent()]));
                    _d.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_1 = _d.sent();
                    console.error('An error occurred while unsubscribing:', error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Main function to handle the unsubscribe process
;
(function main() {
    return __awaiter(this, void 0, void 0, function () {
        var email;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    email = getEmailFromQuery();
                    if (!email) return [3 /*break*/, 2];
                    return [4 /*yield*/, unsubscribe(email)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    console.error('No email found in query parameters.');
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
})();


/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__(976));
/******/ }
]);
//# sourceMappingURL=email_deactivation.69da69fb.js.map