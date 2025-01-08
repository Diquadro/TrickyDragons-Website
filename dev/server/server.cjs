/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "dotenv/config":
/*!********************************!*\
  !*** external "dotenv/config" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("dotenv/config");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "express-promise-router":
/*!*****************************************!*\
  !*** external "express-promise-router" ***!
  \*****************************************/
/***/ ((module) => {

module.exports = require("express-promise-router");

/***/ }),

/***/ "geoip-lite":
/*!*****************************!*\
  !*** external "geoip-lite" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("geoip-lite");

/***/ }),

/***/ "isbot":
/*!************************!*\
  !*** external "isbot" ***!
  \************************/
/***/ ((module) => {

module.exports = require("isbot");

/***/ }),

/***/ "nodemailer":
/*!*****************************!*\
  !*** external "nodemailer" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("nodemailer");

/***/ }),

/***/ "pg":
/*!*********************!*\
  !*** external "pg" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("pg");

/***/ }),

/***/ "./src/server/routes/email_subscription.js":
/*!*************************************************!*\
  !*** ./src/server/routes/email_subscription.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ email_subscription)
/* harmony export */ });
/* harmony import */ var express_promise_router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express-promise-router */ "express-promise-router");
/* harmony import */ var geoip_lite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! geoip-lite */ "geoip-lite");
/* harmony import */ var nodemailer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! nodemailer */ "nodemailer");
/* harmony import */ var dotenv_config__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! dotenv/config */ "dotenv/config");





const router = new express_promise_router__WEBPACK_IMPORTED_MODULE_0__()

// Importa regex per validare le email - https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
const EMAIL_REGEX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

function email_subscription(pool) {
    router.post('/', async (req, res) => {
        console.log('REQUEST - email_subscription')

        let { email } = req.body

        if (!email) {
            return res.status(400).json({ error: 'Email is required' })
        }

        email = email?.toLowerCase()

        // Validate email format
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' })
        }

        // Retrieve IP & Geo Infos
        const ip_address = req.ip ?? req.headers['x-forwarded-for'] ?? req.connection.remoteAddress
        const geo = geoip_lite__WEBPACK_IMPORTED_MODULE_1__.lookup(ip_address) ?? {}

        // Check if email is already in database
        if (!(await is_email_valid(pool, email))) {
            return res.status(409).json({ error: 'Email already exists' })
        }

        // Sends email to user
        const notified = await send_email(email)

        // Save email to database
        if (!(await save_email(pool, email, ip_address, geo, notified))) {
            res.status(500).json({ error: 'Failed to save on database' })
        }

        res.status(201).json({ message: 'Email subscribed successfully' })
    })

    return router
}

async function send_email(recipient) {
    try {
        // email transporter configuration
        let transporter = nodemailer__WEBPACK_IMPORTED_MODULE_2__.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.G_API_CLIENTE_ID,
                clientSecret: process.env.G_API_CLIENT_SECRET,
                refreshToken: process.env.G_API_REFRESH_TOKEN,
            },
        })

        // email options
        let mailOptions = {
            from: 'no-reply@trickydragons.com',
            to: recipient,
            subject: 'Mail Subscription Confirmation - [NO REPLY]',
            text: 'Thank you for subscribing!',
        }

        // send email
        await transporter.sendMail(mailOptions)

        return true
    } catch (err) {
        console.error('send_email - error message\n', err.message)

        return false
    }
}

async function is_email_valid(pool, email) {
    try {
        const existing = await pool.query(
            'SELECT * FROM email_subscriptions WHERE LOWER(email) = LOWER($1)',
            [email],
        )

        return existing.rows.length === 0
    } catch (error) {
        console.error('is_email_valid - error message\n', err.message)

        return false
    }
}

async function save_email(pool, email, ip_address, geo, notified) {
    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        // Insert new email  into the database
        await client.query(
            `INSERT INTO email_subscriptions (email, ip_address, country, region, city, postal_code, notified) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [email, ip_address, geo.country, geo.region, geo.city, geo.postal, notified],
        )

        await client.query('COMMIT')

        return true
    } catch (err) {
        await client.query('ROLLBACK')

        console.error('save_email - error message\n', err.message)
        return false
    } finally {
        client.release()
    }
}


/***/ }),

/***/ "./src/server/routes/site_accesses.js":
/*!********************************************!*\
  !*** ./src/server/routes/site_accesses.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ site_accesses)
/* harmony export */ });
/* harmony import */ var express_promise_router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express-promise-router */ "express-promise-router");
/* harmony import */ var geoip_lite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! geoip-lite */ "geoip-lite");
/* harmony import */ var isbot__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! isbot */ "isbot");




const router = new express_promise_router__WEBPACK_IMPORTED_MODULE_0__()

function site_accesses(pool) {
    router.post('/', async (req, res) => {
        console.log('REQUEST - site_accesses')

        if ((0,isbot__WEBPACK_IMPORTED_MODULE_2__.isbot)(req.get('user-agent'))) {
            return res.status(403).json({ error: 'Bot detected. Access skipped.' })
        }

        // Retrieve IP Address & Geo Infos
        const ip_address = req.ip ?? req.headers['x-forwarded-for'] ?? req.connection.remoteAddress
        const geo = geoip_lite__WEBPACK_IMPORTED_MODULE_1__.lookup(ip_address) ?? {}
        const today = new Date().toISOString().split('T')[0]

        const client = await pool.connect()

        try {
            await client.query('BEGIN')

            // Check if the IP has accessed the site today
            const existing = await client.query(
                'SELECT * FROM site_accesses WHERE ip_address = $1 AND last_accessed = $2',
                [ip_address, today],
            )

            if (existing.rows.length > 0) {
                // Increment visit count if access exists for today
                await client.query('UPDATE site_accesses SET visit_count = visit_count + 1 WHERE id = $1', [
                    existing.rows[0].id,
                ])
            } else {
                // Insert a new entry for today's access
                await client.query(
                    `INSERT INTO site_accesses (ip_address, country, region, city, postal_code, last_accessed) 
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    [ip_address, geo.country, geo.region, geo.city, geo.postal, today],
                )
            }

            await client.query('COMMIT')
            res.status(200).json({ message: 'Access logged successfully' })
        } catch (err) {
            await client.query('ROLLBACK')
            res.status(500).json({ error: err.message })
        } finally {
            client.release()
        }
    })

    return router
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!****************************!*\
  !*** ./src/server/main.js ***!
  \****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var dotenv_config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! dotenv/config */ "dotenv/config");
/* harmony import */ var pg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! pg */ "pg");
/* harmony import */ var _routes_site_accesses_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./routes/site_accesses.js */ "./src/server/routes/site_accesses.js");
/* harmony import */ var _routes_email_subscription_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./routes/email_subscription.js */ "./src/server/routes/email_subscription.js");






const { Pool } = pg__WEBPACK_IMPORTED_MODULE_2__
const app = express__WEBPACK_IMPORTED_MODULE_0__()
const port = process.env.SERVER_PORT ?? 5000

// PostgreSQL Connection Pool
const pool = new Pool({
    connectionString: process.env.PGURI,
    ssl: { rejectUnauthorized: false },
})

// Middleware for parsing JSON requests
app.use(express__WEBPACK_IMPORTED_MODULE_0__.json())

// Routes
app.use('/email-subscription', (0,_routes_email_subscription_js__WEBPACK_IMPORTED_MODULE_4__["default"])(pool))
app.use('/site-accesses', (0,_routes_site_accesses_js__WEBPACK_IMPORTED_MODULE_3__["default"])(pool))

// Graceful Shutdown to close database connections
process.on('SIGINT', async () => {
    await pool.end()
    console.log('Database pool closed.')

    process.exit()
})

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`))

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmNqcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0EyQztBQUNiO0FBQ0s7QUFDYjs7QUFFdEIsbUJBQW1CLG1EQUFNOztBQUV6QjtBQUNBO0FBQ0EsdUJBQXVCLHlCQUF5Qiw2QkFBNkIsSUFBSSxRQUFRLElBQUksUUFBUSxJQUFJLFFBQVEsSUFBSSxnQ0FBZ0MsR0FBRzs7QUFFekk7QUFDZjtBQUNBOztBQUVBLGNBQWMsUUFBUTs7QUFFdEI7QUFDQSwwQ0FBMEMsNEJBQTRCO0FBQ3RFOztBQUVBOztBQUVBO0FBQ0E7QUFDQSwwQ0FBMEMsK0JBQStCO0FBQ3pFOztBQUVBO0FBQ0E7QUFDQSxvQkFBb0IsOENBQVk7O0FBRWhDO0FBQ0E7QUFDQSwwQ0FBMEMsK0JBQStCO0FBQ3pFOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG1DQUFtQyxxQ0FBcUM7QUFDeEU7O0FBRUEsK0JBQStCLDBDQUEwQztBQUN6RSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLHVEQUEwQjtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsTUFBTTtBQUNOOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxNQUFNO0FBQ047O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxNQUFNO0FBQ047O0FBRUE7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzdIMkM7QUFDYjtBQUNEOztBQUU3QixtQkFBbUIsbURBQU07O0FBRVY7QUFDZjtBQUNBOztBQUVBLFlBQVksNENBQUs7QUFDakIsMENBQTBDLHdDQUF3QztBQUNsRjs7QUFFQTtBQUNBO0FBQ0Esb0JBQW9CLDhDQUFZO0FBQ2hDOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsbUNBQW1DLHVDQUF1QztBQUMxRSxVQUFVO0FBQ1Y7QUFDQSxtQ0FBbUMsb0JBQW9CO0FBQ3ZELFVBQVU7QUFDVjtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBOzs7Ozs7O1VDdkRBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7O0FDTjZCO0FBQ1A7QUFDSDtBQUNrQztBQUNVOztBQUUvRCxRQUFRLE9BQU8sRUFBRSwrQkFBRTtBQUNuQixZQUFZLG9DQUFPO0FBQ25COztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsMkJBQTJCO0FBQ3RDLENBQUM7O0FBRUQ7QUFDQSxRQUFRLHlDQUFZOztBQUVwQjtBQUNBLCtCQUErQix5RUFBa0I7QUFDakQsMEJBQTBCLG9FQUFhOztBQUV2QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLENBQUM7O0FBRUQ7QUFDQSw2REFBNkQsS0FBSyIsInNvdXJjZXMiOlsid2VicGFjazovL3RyaWNreWRyYWdvbnMtd2Vic2VydmVyL2V4dGVybmFsIGNvbW1vbmpzIFwiZG90ZW52L2NvbmZpZ1wiIiwid2VicGFjazovL3RyaWNreWRyYWdvbnMtd2Vic2VydmVyL2V4dGVybmFsIGNvbW1vbmpzIFwiZXhwcmVzc1wiIiwid2VicGFjazovL3RyaWNreWRyYWdvbnMtd2Vic2VydmVyL2V4dGVybmFsIGNvbW1vbmpzIFwiZXhwcmVzcy1wcm9taXNlLXJvdXRlclwiIiwid2VicGFjazovL3RyaWNreWRyYWdvbnMtd2Vic2VydmVyL2V4dGVybmFsIGNvbW1vbmpzIFwiZ2VvaXAtbGl0ZVwiIiwid2VicGFjazovL3RyaWNreWRyYWdvbnMtd2Vic2VydmVyL2V4dGVybmFsIGNvbW1vbmpzIFwiaXNib3RcIiIsIndlYnBhY2s6Ly90cmlja3lkcmFnb25zLXdlYnNlcnZlci9leHRlcm5hbCBjb21tb25qcyBcIm5vZGVtYWlsZXJcIiIsIndlYnBhY2s6Ly90cmlja3lkcmFnb25zLXdlYnNlcnZlci9leHRlcm5hbCBjb21tb25qcyBcInBnXCIiLCJ3ZWJwYWNrOi8vdHJpY2t5ZHJhZ29ucy13ZWJzZXJ2ZXIvLi9zcmMvc2VydmVyL3JvdXRlcy9lbWFpbF9zdWJzY3JpcHRpb24uanMiLCJ3ZWJwYWNrOi8vdHJpY2t5ZHJhZ29ucy13ZWJzZXJ2ZXIvLi9zcmMvc2VydmVyL3JvdXRlcy9zaXRlX2FjY2Vzc2VzLmpzIiwid2VicGFjazovL3RyaWNreWRyYWdvbnMtd2Vic2VydmVyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3RyaWNreWRyYWdvbnMtd2Vic2VydmVyL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly90cmlja3lkcmFnb25zLXdlYnNlcnZlci93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3RyaWNreWRyYWdvbnMtd2Vic2VydmVyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vdHJpY2t5ZHJhZ29ucy13ZWJzZXJ2ZXIvLi9zcmMvc2VydmVyL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZG90ZW52L2NvbmZpZ1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJleHByZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV4cHJlc3MtcHJvbWlzZS1yb3V0ZXJcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZ2VvaXAtbGl0ZVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJpc2JvdFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJub2RlbWFpbGVyXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBnXCIpOyIsImltcG9ydCBSb3V0ZXIgZnJvbSAnZXhwcmVzcy1wcm9taXNlLXJvdXRlcidcbmltcG9ydCBnZW9pcCBmcm9tICdnZW9pcC1saXRlJ1xuaW1wb3J0IG5vZGVtYWlsZXIgZnJvbSAnbm9kZW1haWxlcidcbmltcG9ydCAnZG90ZW52L2NvbmZpZydcblxuY29uc3Qgcm91dGVyID0gbmV3IFJvdXRlcigpXG5cbi8vIEltcG9ydGEgcmVnZXggcGVyIHZhbGlkYXJlIGxlIGVtYWlsIC0gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNDYxNTUvaG93LWNhbi1pLXZhbGlkYXRlLWFuLWVtYWlsLWFkZHJlc3MtaW4tamF2YXNjcmlwdFxuY29uc3QgRU1BSUxfUkVHRVggPVxuICAgIC9eKChbXjw+KClcXFtcXF1cXFxcLiw7Olxcc0BcIl0rKFxcLltePD4oKVxcW1xcXVxcXFwuLDs6XFxzQFwiXSspKil8KFwiLitcIikpQCgoXFxbWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfV0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGVtYWlsX3N1YnNjcmlwdGlvbihwb29sKSB7XG4gICAgcm91dGVyLnBvc3QoJy8nLCBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1JFUVVFU1QgLSBlbWFpbF9zdWJzY3JpcHRpb24nKVxuXG4gICAgICAgIGxldCB7IGVtYWlsIH0gPSByZXEuYm9keVxuXG4gICAgICAgIGlmICghZW1haWwpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnRW1haWwgaXMgcmVxdWlyZWQnIH0pXG4gICAgICAgIH1cblxuICAgICAgICBlbWFpbCA9IGVtYWlsPy50b0xvd2VyQ2FzZSgpXG5cbiAgICAgICAgLy8gVmFsaWRhdGUgZW1haWwgZm9ybWF0XG4gICAgICAgIGlmICghRU1BSUxfUkVHRVgudGVzdChlbWFpbCkpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnSW52YWxpZCBlbWFpbCBmb3JtYXQnIH0pXG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXRyaWV2ZSBJUCAmIEdlbyBJbmZvc1xuICAgICAgICBjb25zdCBpcF9hZGRyZXNzID0gcmVxLmlwID8/IHJlcS5oZWFkZXJzWyd4LWZvcndhcmRlZC1mb3InXSA/PyByZXEuY29ubmVjdGlvbi5yZW1vdGVBZGRyZXNzXG4gICAgICAgIGNvbnN0IGdlbyA9IGdlb2lwLmxvb2t1cChpcF9hZGRyZXNzKSA/PyB7fVxuXG4gICAgICAgIC8vIENoZWNrIGlmIGVtYWlsIGlzIGFscmVhZHkgaW4gZGF0YWJhc2VcbiAgICAgICAgaWYgKCEoYXdhaXQgaXNfZW1haWxfdmFsaWQocG9vbCwgZW1haWwpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA5KS5qc29uKHsgZXJyb3I6ICdFbWFpbCBhbHJlYWR5IGV4aXN0cycgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNlbmRzIGVtYWlsIHRvIHVzZXJcbiAgICAgICAgY29uc3Qgbm90aWZpZWQgPSBhd2FpdCBzZW5kX2VtYWlsKGVtYWlsKVxuXG4gICAgICAgIC8vIFNhdmUgZW1haWwgdG8gZGF0YWJhc2VcbiAgICAgICAgaWYgKCEoYXdhaXQgc2F2ZV9lbWFpbChwb29sLCBlbWFpbCwgaXBfYWRkcmVzcywgZ2VvLCBub3RpZmllZCkpKSB7XG4gICAgICAgICAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiAnRmFpbGVkIHRvIHNhdmUgb24gZGF0YWJhc2UnIH0pXG4gICAgICAgIH1cblxuICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbih7IG1lc3NhZ2U6ICdFbWFpbCBzdWJzY3JpYmVkIHN1Y2Nlc3NmdWxseScgfSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIHJvdXRlclxufVxuXG5hc3luYyBmdW5jdGlvbiBzZW5kX2VtYWlsKHJlY2lwaWVudCkge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIGVtYWlsIHRyYW5zcG9ydGVyIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgbGV0IHRyYW5zcG9ydGVyID0gbm9kZW1haWxlci5jcmVhdGVUcmFuc3BvcnQoe1xuICAgICAgICAgICAgaG9zdDogJ3NtdHAuZ21haWwuY29tJyxcbiAgICAgICAgICAgIHBvcnQ6IDQ2NSxcbiAgICAgICAgICAgIHNlY3VyZTogdHJ1ZSxcbiAgICAgICAgICAgIGF1dGg6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnT0F1dGgyJyxcbiAgICAgICAgICAgICAgICB1c2VyOiBwcm9jZXNzLmVudi5FTUFJTF9VU0VSLFxuICAgICAgICAgICAgICAgIGNsaWVudElkOiBwcm9jZXNzLmVudi5HX0FQSV9DTElFTlRFX0lELFxuICAgICAgICAgICAgICAgIGNsaWVudFNlY3JldDogcHJvY2Vzcy5lbnYuR19BUElfQ0xJRU5UX1NFQ1JFVCxcbiAgICAgICAgICAgICAgICByZWZyZXNoVG9rZW46IHByb2Nlc3MuZW52LkdfQVBJX1JFRlJFU0hfVE9LRU4sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KVxuXG4gICAgICAgIC8vIGVtYWlsIG9wdGlvbnNcbiAgICAgICAgbGV0IG1haWxPcHRpb25zID0ge1xuICAgICAgICAgICAgZnJvbTogJ25vLXJlcGx5QHRyaWNreWRyYWdvbnMuY29tJyxcbiAgICAgICAgICAgIHRvOiByZWNpcGllbnQsXG4gICAgICAgICAgICBzdWJqZWN0OiAnTWFpbCBTdWJzY3JpcHRpb24gQ29uZmlybWF0aW9uIC0gW05PIFJFUExZXScsXG4gICAgICAgICAgICB0ZXh0OiAnVGhhbmsgeW91IGZvciBzdWJzY3JpYmluZyEnLFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2VuZCBlbWFpbFxuICAgICAgICBhd2FpdCB0cmFuc3BvcnRlci5zZW5kTWFpbChtYWlsT3B0aW9ucylcblxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdzZW5kX2VtYWlsIC0gZXJyb3IgbWVzc2FnZVxcbicsIGVyci5tZXNzYWdlKVxuXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaXNfZW1haWxfdmFsaWQocG9vbCwgZW1haWwpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IHBvb2wucXVlcnkoXG4gICAgICAgICAgICAnU0VMRUNUICogRlJPTSBlbWFpbF9zdWJzY3JpcHRpb25zIFdIRVJFIExPV0VSKGVtYWlsKSA9IExPV0VSKCQxKScsXG4gICAgICAgICAgICBbZW1haWxdLFxuICAgICAgICApXG5cbiAgICAgICAgcmV0dXJuIGV4aXN0aW5nLnJvd3MubGVuZ3RoID09PSAwXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignaXNfZW1haWxfdmFsaWQgLSBlcnJvciBtZXNzYWdlXFxuJywgZXJyLm1lc3NhZ2UpXG5cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlX2VtYWlsKHBvb2wsIGVtYWlsLCBpcF9hZGRyZXNzLCBnZW8sIG5vdGlmaWVkKSB7XG4gICAgY29uc3QgY2xpZW50ID0gYXdhaXQgcG9vbC5jb25uZWN0KClcblxuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeSgnQkVHSU4nKVxuXG4gICAgICAgIC8vIEluc2VydCBuZXcgZW1haWwgIGludG8gdGhlIGRhdGFiYXNlXG4gICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShcbiAgICAgICAgICAgIGBJTlNFUlQgSU5UTyBlbWFpbF9zdWJzY3JpcHRpb25zIChlbWFpbCwgaXBfYWRkcmVzcywgY291bnRyeSwgcmVnaW9uLCBjaXR5LCBwb3N0YWxfY29kZSwgbm90aWZpZWQpIFxuICAgICAgICAgICAgICAgIFZBTFVFUyAoJDEsICQyLCAkMywgJDQsICQ1LCAkNiwgJDcpYCxcbiAgICAgICAgICAgIFtlbWFpbCwgaXBfYWRkcmVzcywgZ2VvLmNvdW50cnksIGdlby5yZWdpb24sIGdlby5jaXR5LCBnZW8ucG9zdGFsLCBub3RpZmllZF0sXG4gICAgICAgIClcblxuICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoJ0NPTU1JVCcpXG5cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KCdST0xMQkFDSycpXG5cbiAgICAgICAgY29uc29sZS5lcnJvcignc2F2ZV9lbWFpbCAtIGVycm9yIG1lc3NhZ2VcXG4nLCBlcnIubWVzc2FnZSlcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgY2xpZW50LnJlbGVhc2UoKVxuICAgIH1cbn1cbiIsImltcG9ydCBSb3V0ZXIgZnJvbSAnZXhwcmVzcy1wcm9taXNlLXJvdXRlcidcbmltcG9ydCBnZW9pcCBmcm9tICdnZW9pcC1saXRlJ1xuaW1wb3J0IHsgaXNib3QgfSBmcm9tICdpc2JvdCdcblxuY29uc3Qgcm91dGVyID0gbmV3IFJvdXRlcigpXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNpdGVfYWNjZXNzZXMocG9vbCkge1xuICAgIHJvdXRlci5wb3N0KCcvJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdSRVFVRVNUIC0gc2l0ZV9hY2Nlc3NlcycpXG5cbiAgICAgICAgaWYgKGlzYm90KHJlcS5nZXQoJ3VzZXItYWdlbnQnKSkpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMykuanNvbih7IGVycm9yOiAnQm90IGRldGVjdGVkLiBBY2Nlc3Mgc2tpcHBlZC4nIH0pXG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXRyaWV2ZSBJUCBBZGRyZXNzICYgR2VvIEluZm9zXG4gICAgICAgIGNvbnN0IGlwX2FkZHJlc3MgPSByZXEuaXAgPz8gcmVxLmhlYWRlcnNbJ3gtZm9yd2FyZGVkLWZvciddID8/IHJlcS5jb25uZWN0aW9uLnJlbW90ZUFkZHJlc3NcbiAgICAgICAgY29uc3QgZ2VvID0gZ2VvaXAubG9va3VwKGlwX2FkZHJlc3MpID8/IHt9XG4gICAgICAgIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF1cblxuICAgICAgICBjb25zdCBjbGllbnQgPSBhd2FpdCBwb29sLmNvbm5lY3QoKVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBjbGllbnQucXVlcnkoJ0JFR0lOJylcblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIElQIGhhcyBhY2Nlc3NlZCB0aGUgc2l0ZSB0b2RheVxuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBjbGllbnQucXVlcnkoXG4gICAgICAgICAgICAgICAgJ1NFTEVDVCAqIEZST00gc2l0ZV9hY2Nlc3NlcyBXSEVSRSBpcF9hZGRyZXNzID0gJDEgQU5EIGxhc3RfYWNjZXNzZWQgPSAkMicsXG4gICAgICAgICAgICAgICAgW2lwX2FkZHJlc3MsIHRvZGF5XSxcbiAgICAgICAgICAgIClcblxuICAgICAgICAgICAgaWYgKGV4aXN0aW5nLnJvd3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIEluY3JlbWVudCB2aXNpdCBjb3VudCBpZiBhY2Nlc3MgZXhpc3RzIGZvciB0b2RheVxuICAgICAgICAgICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeSgnVVBEQVRFIHNpdGVfYWNjZXNzZXMgU0VUIHZpc2l0X2NvdW50ID0gdmlzaXRfY291bnQgKyAxIFdIRVJFIGlkID0gJDEnLCBbXG4gICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLnJvd3NbMF0uaWQsXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSW5zZXJ0IGEgbmV3IGVudHJ5IGZvciB0b2RheSdzIGFjY2Vzc1xuICAgICAgICAgICAgICAgIGF3YWl0IGNsaWVudC5xdWVyeShcbiAgICAgICAgICAgICAgICAgICAgYElOU0VSVCBJTlRPIHNpdGVfYWNjZXNzZXMgKGlwX2FkZHJlc3MsIGNvdW50cnksIHJlZ2lvbiwgY2l0eSwgcG9zdGFsX2NvZGUsIGxhc3RfYWNjZXNzZWQpIFxuICAgICAgICAgICAgICAgICAgICBWQUxVRVMgKCQxLCAkMiwgJDMsICQ0LCAkNSwgJDYpYCxcbiAgICAgICAgICAgICAgICAgICAgW2lwX2FkZHJlc3MsIGdlby5jb3VudHJ5LCBnZW8ucmVnaW9uLCBnZW8uY2l0eSwgZ2VvLnBvc3RhbCwgdG9kYXldLFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KCdDT01NSVQnKVxuICAgICAgICAgICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBtZXNzYWdlOiAnQWNjZXNzIGxvZ2dlZCBzdWNjZXNzZnVsbHknIH0pXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgYXdhaXQgY2xpZW50LnF1ZXJ5KCdST0xMQkFDSycpXG4gICAgICAgICAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBlcnIubWVzc2FnZSB9KVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgY2xpZW50LnJlbGVhc2UoKVxuICAgICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiByb3V0ZXJcbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcydcbmltcG9ydCAnZG90ZW52L2NvbmZpZydcbmltcG9ydCBwZyBmcm9tICdwZydcbmltcG9ydCBzaXRlX2FjY2Vzc2VzIGZyb20gJy4vcm91dGVzL3NpdGVfYWNjZXNzZXMuanMnXG5pbXBvcnQgZW1haWxfc3Vic2NyaXB0aW9uIGZyb20gJy4vcm91dGVzL2VtYWlsX3N1YnNjcmlwdGlvbi5qcydcblxuY29uc3QgeyBQb29sIH0gPSBwZ1xuY29uc3QgYXBwID0gZXhwcmVzcygpXG5jb25zdCBwb3J0ID0gcHJvY2Vzcy5lbnYuU0VSVkVSX1BPUlQgPz8gNTAwMFxuXG4vLyBQb3N0Z3JlU1FMIENvbm5lY3Rpb24gUG9vbFxuY29uc3QgcG9vbCA9IG5ldyBQb29sKHtcbiAgICBjb25uZWN0aW9uU3RyaW5nOiBwcm9jZXNzLmVudi5QR1VSSSxcbiAgICBzc2w6IHsgcmVqZWN0VW5hdXRob3JpemVkOiBmYWxzZSB9LFxufSlcblxuLy8gTWlkZGxld2FyZSBmb3IgcGFyc2luZyBKU09OIHJlcXVlc3RzXG5hcHAudXNlKGV4cHJlc3MuanNvbigpKVxuXG4vLyBSb3V0ZXNcbmFwcC51c2UoJy9lbWFpbC1zdWJzY3JpcHRpb24nLCBlbWFpbF9zdWJzY3JpcHRpb24ocG9vbCkpXG5hcHAudXNlKCcvc2l0ZS1hY2Nlc3NlcycsIHNpdGVfYWNjZXNzZXMocG9vbCkpXG5cbi8vIEdyYWNlZnVsIFNodXRkb3duIHRvIGNsb3NlIGRhdGFiYXNlIGNvbm5lY3Rpb25zXG5wcm9jZXNzLm9uKCdTSUdJTlQnLCBhc3luYyAoKSA9PiB7XG4gICAgYXdhaXQgcG9vbC5lbmQoKVxuICAgIGNvbnNvbGUubG9nKCdEYXRhYmFzZSBwb29sIGNsb3NlZC4nKVxuXG4gICAgcHJvY2Vzcy5leGl0KClcbn0pXG5cbi8vIFN0YXJ0IHRoZSBzZXJ2ZXJcbmFwcC5saXN0ZW4ocG9ydCwgKCkgPT4gY29uc29sZS5sb2coYFNlcnZlciBydW5uaW5nIG9uIHBvcnQgJHtwb3J0fWApKVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9