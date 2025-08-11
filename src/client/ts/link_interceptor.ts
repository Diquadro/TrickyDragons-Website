/**
 * Smart Link Interceptor
 *
 * Provides a reusable, extensible initializer to:
 * - Pre-merge current page query params into anchor href (for right-click/copy link)
 * - Intercept left-click navigation on same-origin links and apply merged params
 * - Handle Ctrl/Cmd-click, Shift-click, middle-click and target="_blank" consistently
 * - Respect native behavior for right-click, Alt-click, special protocols, hashes, downloads, cross-origin
 */

export type NavigationAction = 'same-tab' | 'new-tab' | 'new-window'

export interface SmartLinkOptions {
    root?: ParentNode
    selector?: string
    shouldPremergeHref?: boolean
    optOutDataAttr?: string
    resolveTargetUrl?: (anchor: HTMLAnchorElement) => string
    beforeNavigate?: (ctx: { anchor: HTMLAnchorElement; finalUrl: URL; action: NavigationAction }) => void
}

const DEFAULT_SELECTOR = 'a[href]'
const DEFAULT_OPTOUT_ATTR = 'noIntercept'

export function setupSmartLinkNavigation(options?: SmartLinkOptions): () => void {
    const {
        root = document,
        selector = DEFAULT_SELECTOR,
        shouldPremergeHref = true,
        optOutDataAttr = DEFAULT_OPTOUT_ATTR,
        resolveTargetUrl = resolveDefaultTargetUrl,
        beforeNavigate,
    } = options || {}

    const anchors = Array.from(root.querySelectorAll(selector)) as HTMLAnchorElement[]

    anchors.forEach((anchor) => {
        if (shouldSkip(anchor, optOutDataAttr)) return

        if (shouldPremergeHref) {
            tryPremergeAnchorHref(anchor, resolveTargetUrl)
        }

        const clickHandler = (event: Event) =>
            handleClick(event as MouseEvent, anchor, resolveTargetUrl, beforeNavigate)
        const auxHandler = (event: Event) =>
            handleAuxClick(event as MouseEvent, anchor, resolveTargetUrl, beforeNavigate)

        anchor.addEventListener('click', clickHandler)
        anchor.addEventListener('auxclick', auxHandler)

        listeners.push({ anchor, clickHandler, auxHandler })
    })

    // Return teardown function
    return function teardown() {
        listeners.forEach(({ anchor, clickHandler, auxHandler }) => {
            anchor.removeEventListener('click', clickHandler)
            anchor.removeEventListener('auxclick', auxHandler)
        })
        listeners.length = 0
    }
}

function shouldSkip(anchor: HTMLAnchorElement, optOutDataAttr: string): boolean {
    return anchor.dataset[optOutDataAttr as keyof DOMStringMap] === 'true'
}

function isSpecialProtocolOrHash(hrefAttr: string): boolean {
    const isExternalProtocol = /^(mailto:|tel:|sms:|javascript:)/i.test(hrefAttr)
    const isHashOnly = hrefAttr.startsWith('#')
    return isExternalProtocol || isHashOnly
}

export function resolveDefaultTargetUrl(anchor: HTMLAnchorElement): string {
    return anchor.getAttribute('href') || '/'
}

function buildTargetUrlWithParams(anchor: HTMLAnchorElement, resolvedTargetUrl: string): URL {
    const currentUrl = new URL(window.location.href)
    const targetUrl = new URL(resolvedTargetUrl, currentUrl.origin)

    currentUrl.searchParams.forEach((value, key) => {
        if (!targetUrl.searchParams.has(key)) {
            targetUrl.searchParams.set(key, value)
        }
    })

    if (anchor.hash) targetUrl.hash = anchor.hash
    return targetUrl
}

function tryPremergeAnchorHref(
    anchor: HTMLAnchorElement,
    resolveTargetUrl: (anchor: HTMLAnchorElement) => string,
): void {
    const currentHrefAttr = anchor.getAttribute('href') || ''
    if (anchor.dataset.hrefMerged === 'true') return
    if (anchor.hasAttribute('download') || isSpecialProtocolOrHash(currentHrefAttr)) return

    let targetUrl: URL
    try {
        targetUrl = new URL(currentHrefAttr, window.location.origin)
    } catch {
        return
    }
    if (targetUrl.origin !== window.location.origin) return

    const resolved = resolveTargetUrl(anchor)
    const built = buildTargetUrlWithParams(anchor, resolved)

    if (!anchor.dataset.originalHref) anchor.dataset.originalHref = currentHrefAttr
    anchor.setAttribute('href', built.toString())
    anchor.dataset.hrefMerged = 'true'
}

function handleClick(
    event: MouseEvent,
    anchor: HTMLAnchorElement,
    resolveTargetUrl: (anchor: HTMLAnchorElement) => string,
    beforeNavigate?: (ctx: { anchor: HTMLAnchorElement; finalUrl: URL; action: NavigationAction }) => void,
): void {
    if (event.defaultPrevented) return

    const hrefAttr = anchor.getAttribute('href') || ''
    if (anchor.hasAttribute('download') || isSpecialProtocolOrHash(hrefAttr)) return

    const isLeftClick = (event.button || 0) === 0
    const isCtrlOrMeta = event.ctrlKey || event.metaKey
    const isShift = event.shiftKey
    const isAlt = event.altKey

    if (!isLeftClick) return
    if (isAlt) return

    let url: URL
    try {
        url = new URL(hrefAttr, window.location.origin)
    } catch {
        return
    }
    if (url.origin !== window.location.origin) return

    const resolved = resolveTargetUrl(anchor)
    const finalUrl = buildTargetUrlWithParams(anchor, resolved)

    const action: NavigationAction = isShift
        ? 'new-window'
        : isCtrlOrMeta || anchor.target === '_blank'
          ? 'new-tab'
          : 'same-tab'

    if (isCtrlOrMeta || anchor.target === '_blank') {
        event.preventDefault()
        beforeNavigate?.({ anchor, finalUrl, action: 'new-tab' })
        window.open(finalUrl.toString(), '_blank', 'noopener')
        return
    }

    if (isShift) {
        event.preventDefault()
        beforeNavigate?.({ anchor, finalUrl, action: 'new-window' })
        window.open(finalUrl.toString(), anchor.target || '_blank', 'noopener')
        return
    }

    // Same tab navigation
    event.preventDefault()
    beforeNavigate?.({ anchor, finalUrl, action: 'same-tab' })
    window.location.assign(finalUrl.toString())
}

function handleAuxClick(
    event: MouseEvent,
    anchor: HTMLAnchorElement,
    resolveTargetUrl: (anchor: HTMLAnchorElement) => string,
    beforeNavigate?: (ctx: { anchor: HTMLAnchorElement; finalUrl: URL; action: NavigationAction }) => void,
): void {
    if (event.defaultPrevented) return
    if (event.button !== 1) return

    const hrefAttr = anchor.getAttribute('href') || ''
    if (anchor.hasAttribute('download') || isSpecialProtocolOrHash(hrefAttr)) return

    let url: URL
    try {
        url = new URL(hrefAttr, window.location.origin)
    } catch {
        return
    }
    if (url.origin !== window.location.origin) return

    const resolved = resolveTargetUrl(anchor)
    const finalUrl = buildTargetUrlWithParams(anchor, resolved)

    event.preventDefault()
    beforeNavigate?.({ anchor, finalUrl, action: 'new-tab' })
    window.open(finalUrl.toString(), '_blank', 'noopener')
}

interface RegisteredListenerRow {
    anchor: HTMLAnchorElement
    clickHandler: (e: Event) => void
    auxHandler: (e: Event) => void
}

const listeners: RegisteredListenerRow[] = []
