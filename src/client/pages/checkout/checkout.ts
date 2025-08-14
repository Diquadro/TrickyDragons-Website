import './checkout.scss'
import { API, CLIENT, ENV, STRIPE } from '@shared/constants/app.constants'
import { show_spinner } from '@client/components/spinner/spinner'
import { Base64_Url } from '@shared/utils/base64_url'

// Declare global Stripe from script tag
declare const Stripe: any

// This is your test publishable API key.
const stripe = Stripe(
    'pk_test_51RqfdZA5ocAGWp3UhiwfQM4od6zdj88T6Yr5jOiCgVHN9UzzGoMdaw5RhglAKmVUjGmFkNKeRFkGRBYeu13W8CVi00RlOFRF0a',
)

let checkout: any
initialize()

document.querySelector('#payment-form')!.addEventListener('submit', handleSubmit)

// Fetches a Checkout Session and captures the client secret
async function initialize() {
    show_spinner(true)
    const emailFromUrl = getEmailFromUrl()
    if (!emailFromUrl) {
        window.location.href = `\\`
    }

    // Preserve existing query params in return URL (backend will add session_id)
    const currentParams = new URLSearchParams(window.location.search)
    const returnParams = new URLSearchParams()

    // Add all current params except session_id (backend will add it)
    currentParams.forEach((value, key) => {
        if (key !== 'session_id') {
            returnParams.set(key, value)
        }
    })

    const return_url = `${CLIENT.URL}/thank-you-1-dollar?${returnParams.toString()}`

    const endpoint = ENV.LOCAL
        ? `${API.ENDPOINTS.STRIPE.CREATE_CHECKOUT_SESSION}`
        : `${API.URL}${API.ENDPOINTS.STRIPE.CREATE_CHECKOUT_SESSION}`

    const promise = fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            product_id: STRIPE.PRODUCT_MAP.TD_RESERVATION,
            email: emailFromUrl,
            return_url: return_url,
        }),
    })
        .then((r) => r.json())
        .then((r) => r.clientSecret)

    const appearance = {
        theme: 'flat',
    }

    checkout = await stripe.initCheckout({
        fetchClientSecret: () => promise,
        elementsOptions: { appearance, loader: 'always' },
    })

    create_items(checkout.session())

    const emailInput = document.querySelector('#email_address_input') as HTMLInputElement
    if (emailInput?.value !== undefined) {
        emailInput.value = checkout.session().email
    }

    const billingElement = checkout.createBillingAddressElement({
        display: {
            name: 'split',
        },
    })
    billingElement.mount('#billing-address-element')

    const paymentElement = checkout.createPaymentElement()
    paymentElement.mount('#payment-element')

    document.querySelector('#button-text')!.textContent = `Pay ${checkout.session().total.total.amount} now`
    show_spinner(false)
}

function create_items(session: any) {
    const items = document.querySelector('#items') as HTMLElement
    items.innerHTML = ''

    session.lineItems.forEach((item: any) => {
        const itemElement = document.createElement('div')
        itemElement.classList.add('item')
        itemElement.innerHTML = `
            <div class="item_name">${item.name}</div>
            <div class="item_description">${item.description}</div>
            <div class="item_price">${item.total.amount}</div>
        `
        items.appendChild(itemElement)
    })
}

async function handleSubmit(e: Event) {
    e.preventDefault()
    setLoading(true)

    const { error } = await checkout.confirm()
    console.log('error', error)

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    showMessage(error.message)

    setLoading(false)
}

// ------- UI helpers -------

function showMessage(messageText: string) {
    const messageContainer = document.querySelector('#payment-message')!

    messageContainer.classList.remove('hidden')
    ;(messageContainer as HTMLElement).style.color = 'rgb(223, 27, 65)'
    ;(messageContainer as HTMLElement).style.textAlign = 'center'
    ;(messageContainer as HTMLElement).style.fontSize = '15px'
    ;(messageContainer as HTMLElement).style.fontWeight = '400'
    messageContainer.textContent = messageText

    setTimeout(function () {
        messageContainer.classList.add('hidden')
        messageContainer.textContent = ''
    }, 4000)
}

// Show a spinner on payment submission
function setLoading(isLoading: boolean) {
    if (isLoading) {
        // Disable the button and show a spinner
        ;(document.querySelector('#submit')! as HTMLButtonElement).disabled = true
        show_spinner(true)
        document.querySelector('#button-text')!.classList.add('hidden')
    } else {
        ;(document.querySelector('#submit')! as HTMLButtonElement).disabled = false
        show_spinner(false)
        document.querySelector('#button-text')!.classList.remove('hidden')
    }
}

// Email management - URL params only
function getEmailFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search)
    const emailFromUrl = urlParams.get('email')
    if (emailFromUrl) {
        try {
            // Decode base64 URL-safe email from URL
            return Base64_Url.decode(emailFromUrl)
        } catch (e) {
            console.warn('Invalid email parameter in URL')
            return null
        }
    }
    return null
}
