/**
 * Simple Progressive Media Loader
 * Shows image first, then instantly switches to video when loaded
 */

function initCardsMediaLoader(): void {
    const container = document.querySelector('.cards-media-container') as HTMLElement
    const video = container?.querySelector('.cards-main-video') as HTMLVideoElement
    const image = container?.querySelector('.cards-placeholder-image') as HTMLImageElement

    if (!container || !video || !image) {
        return
    }

    // Rispetta la preferenza per animazioni ridotte
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return
    }

    // Inizia il caricamento quando l'elemento è visibile
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    startVideoLoad()
                    observer.unobserve(entry.target)
                }
            })
        },
        { threshold: 0.1 },
    )

    observer.observe(container)

    function startVideoLoad(): void {
        video.addEventListener('canplaythrough', onVideoReady, { once: true })
        video.addEventListener('error', onVideoError)

        video.preload = 'auto'
        video.load()
    }

    function onVideoReady(): void {
        video
            .play()
            .then(() => {
                container.classList.add('video-loaded')
            })
            .catch(() => {
                // Fallback silenzioso all'immagine
            })
    }

    function onVideoError(): void {
        // Mantieni l'immagine in caso di errore
    }
}

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCardsMediaLoader)
} else {
    initCardsMediaLoader()
}
