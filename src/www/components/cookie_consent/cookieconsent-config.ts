import 'vanilla-cookieconsent/dist/cookieconsent.css'
import * as CookieConsent from 'vanilla-cookieconsent'
import cookie_meta_pixel from '@www_components/cookie_meta_pixel/cookie_meta_pixel'

document.addEventListener('DOMContentLoaded', () => {
    CookieConsent.run({
        onFirstConsent: () => {
            cookie_meta_pixel()
        },
        onConsent: () => {
            cookie_meta_pixel()
        },
        onChange: () => {
            cookie_meta_pixel()
        },

        guiOptions: {
            consentModal: {
                layout: 'box',
                position: 'bottom left',
                equalWeightButtons: false,
                flipButtons: false,
            },
            preferencesModal: {
                layout: 'box',
                position: 'right',
                equalWeightButtons: false,
                flipButtons: true,
            },
        },
        categories: {
            necessary: {
                readOnly: true,
            },
            functionality: {},
            analytics: {},
            marketing: {
                autoClear: {
                    cookies: [{ name: '_fbp' }, { name: '_fbc' }, { name: 'fr' }],
                },
            },
        },
        language: {
            default: 'en',
            autoDetect: 'browser',
            translations: {
                en: {
                    consentModal: {
                        title: "Hey traveler, it's cookie time!",
                        description:
                            "We use cookies to give you the best experience on our site. Some are essential, while others help us improve. It's up to you to decide!",
                        acceptAllBtn: 'Accept all',
                        acceptNecessaryBtn: 'Reject all',
                        showPreferencesBtn: 'Manage preferences',
                        footer: '<a href="/privacy_policy">Privacy Policy</a> <a href="/terms_and_conditions">Terms and Conditions</a>',
                    },
                    preferencesModal: {
                        title: 'Cookie Preferences Center',
                        acceptAllBtn: 'Accept all',
                        acceptNecessaryBtn: 'Only necessary',
                        savePreferencesBtn: 'Save preferences',
                        closeIconLabel: 'Close',
                        serviceCounterLabel: 'Service|Services',
                        sections: [
                            {
                                title: 'Why do we use cookies?',
                                description:
                                    'Cookies help us enhance your browsing experience, personalize content, and analyze traffic. You decide which ones to allow!',
                            },
                            {
                                title: 'Strictly Necessary Cookies <span class="pm__badge">Always Enabled</span>',
                                description:
                                    'These cookies are essential for the website to function properly and cannot be disabled.',
                                linkedCategory: 'necessary',
                                cookieTable: {
                                    caption: 'Cookies used on this site',
                                    headers: {
                                        name: 'Name',
                                        domain: 'Domain',
                                        description: 'Purpose',
                                        duration: 'Duration',
                                    },
                                    body: [
                                        {
                                            name: 'cookie_consent',
                                            domain: 'trickydragons.com',
                                            description: 'Stores user cookie consent preferences.',
                                            duration: '1 year',
                                        },
                                    ],
                                },
                            },
                            // {
                            //     title: 'Functionality Cookies',
                            //     description:
                            //         'These improve your browsing experience, like remembering your preferences or language settings.',
                            //     linkedCategory: 'functionality',
                            // },
                            // {
                            //     title: 'Analytics Cookies',
                            //     description:
                            //         'They help us understand how the site is used, allowing us to improve it continuously.',
                            //     linkedCategory: 'analytics',
                            // },
                            {
                                title: 'Marketing Cookies',
                                description:
                                    'These cookies are used to deliver personalized ads and track user interactions across websites. They help us optimize our advertising campaigns and measure their effectiveness. We use cookies from third-party providers like Facebook (Meta) for this purpose.',
                                linkedCategory: 'marketing',
                                cookieTable: {
                                    caption: 'Cookies used on this site',
                                    headers: {
                                        name: 'Name',
                                        domain: 'Domain',
                                        description: 'Purpose',
                                        duration: 'Duration',
                                    },
                                    body: [
                                        {
                                            name: '_fbp',
                                            domain: 'trickydragons.com',
                                            description: 'Used by Facebook to deliver personalized ads.',
                                            duration: '3 months',
                                        },
                                        {
                                            name: '_fbc',
                                            domain: 'trickydragons.com',
                                            description: 'Tracks Facebook ad interactions.',
                                            duration: '3 months',
                                        },
                                        {
                                            name: 'fr',
                                            domain: 'facebook.com',
                                            description: 'Facebook tracking cookie for ad targeting.',
                                            duration: '90 days',
                                        },
                                    ],
                                },
                            },
                            {
                                title: 'More information',
                                description:
                                    'For any questions about our cookie policy or your choices, contact us at: contact-us@trickydragons.com.',
                            },
                        ],
                    },
                },
            },
        },
    })
})
