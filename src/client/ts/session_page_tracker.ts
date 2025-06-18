/**
 * Session Page Tracker - Prevents duplicate analytics events on page refresh
 *
 * LIMITAZIONI CONSAPEVOLI:
 * - Non gestisce tab multipli (ogni tab = sessione separata)
 * - Non gestisce cross-device tracking (privacy-first)
 * - Non gestisce micro-interazioni (solo eventi principali)
 * - Non gestisce real-time sync tra finestre
 * - Non gestisce eventi offline con queue
 * - Non gestisce attribution cross-session avanzata
 *
 * Queste limitazioni sono intenzionali per mantenere semplicità e performance.
 */

import { get_session_id, is_current_session_expired } from './session_manager'

interface PageTrackingData {
    page_view_id: string | null
    page_leave_id: string | null
    last_activity_at: number
}

interface SessionPageTracker {
    session_id: string
    current_active_page: string | null
    pages: { [page_url: string]: PageTrackingData }
}

// Configuration
const TRACKER_CONFIG = {
    STORAGE_KEY: 'session_page_tracker',
}

let current_tracker: SessionPageTracker | null = null

/**
 * Normalizza URL per il tracking (rimuove query params e hash)
 */
function normalize_page_url(url: string): string {
    try {
        const parsed = new URL(url)
        return `${parsed.origin}${parsed.pathname}`
    } catch {
        // Fallback se URL non valido
        return url.split('?')[0].split('#')[0]
    }
}

/**
 * Carica tracker dal storage
 */
function load_tracker_from_storage(): SessionPageTracker | null {
    try {
        const stored = localStorage.getItem(TRACKER_CONFIG.STORAGE_KEY)

        if (!stored) {
            return null
        }

        const tracker = JSON.parse(stored) as SessionPageTracker

        // Valida struttura base
        if (!tracker.session_id || !tracker.pages) {
            return null
        }

        return tracker
    } catch (error) {
        console.warn('Failed to load session page tracker:', error)
        return null
    }
}

/**
 * Salva tracker nel storage
 */
function save_tracker_to_storage(tracker: SessionPageTracker): void {
    try {
        localStorage.setItem(TRACKER_CONFIG.STORAGE_KEY, JSON.stringify(tracker))
    } catch (error) {
        console.warn('Failed to save session page tracker:', error)
    }
}

/**
 * Crea nuovo tracker per la sessione corrente
 */
function create_new_tracker(): SessionPageTracker {
    return {
        session_id: get_session_id(),
        current_active_page: null,
        pages: {},
    }
}

/**
 * Ottiene o crea il tracker per la sessione corrente
 */
function get_current_tracker(): SessionPageTracker {
    const current_session_id = get_session_id()

    // Se tracker già in memoria e sessione valida, ritorna quello
    if (
        current_tracker &&
        current_tracker.session_id === current_session_id &&
        !is_current_session_expired()
    ) {
        return current_tracker
    }

    // Prova a caricare dal storage
    const stored_tracker = load_tracker_from_storage()

    // Se tracker esistente ha sessione valida, usalo
    if (stored_tracker && stored_tracker.session_id === current_session_id && !is_current_session_expired()) {
        current_tracker = stored_tracker
        return current_tracker
    }

    // Crea nuovo tracker
    current_tracker = create_new_tracker()
    save_tracker_to_storage(current_tracker)
    return current_tracker
}

/**
 * Determina se creare nuovi eventi per la pagina corrente
 */
export function should_create_new_events(): boolean {
    const tracker = get_current_tracker()
    const page_url = normalize_page_url(window.location.href)
    const page_data = tracker.pages[page_url]

    // Se pagina mai vista prima = nuovi eventi
    if (!page_data) {
        return true
    }

    // Se questa pagina non è quella attiva = nuova visita
    if (tracker.current_active_page !== page_url) {
        return true
    }

    // Se è la pagina attiva e la sessione è ancora valida = refresh
    // Usiamo la stessa logica di sessione per determinare se è un refresh
    if (!is_current_session_expired()) {
        return false // È un refresh, non creare nuovi eventi
    }

    // Altrimenti = nuova visita (sessione scaduta)
    return true
}

/**
 * Ottiene gli ID degli eventi esistenti per la pagina corrente (se presenti)
 */
export function get_existing_page_events(): { page_view_id: string | null; page_leave_id: string | null } {
    const tracker = get_current_tracker()
    const page_url = normalize_page_url(window.location.href)
    const page_data = tracker.pages[page_url]

    return {
        page_view_id: page_data?.page_view_id || null,
        page_leave_id: page_data?.page_leave_id || null,
    }
}

/**
 * Registra nuovi eventi per la pagina corrente
 */
export function register_page_events(page_view_id: string, page_leave_id: string): void {
    const tracker = get_current_tracker()
    const page_url = normalize_page_url(window.location.href)

    // Registra nuovi eventi per pagina corrente
    tracker.pages[page_url] = {
        page_view_id,
        page_leave_id,
        last_activity_at: Date.now(),
    }

    // Segna questa pagina come attiva
    tracker.current_active_page = page_url

    // Salva
    save_tracker_to_storage(tracker)
}

/**
 * Aggiorna l'attività per la pagina corrente (usato per refresh)
 */
export function update_page_activity(): void {
    const tracker = get_current_tracker()
    const page_url = normalize_page_url(window.location.href)
    const page_data = tracker.pages[page_url]

    if (page_data) {
        page_data.last_activity_at = Date.now()
        save_tracker_to_storage(tracker)
    }
}

/**
 * Pulisce tracker per sessioni scadute (chiamata durante inizializzazione)
 */
export function cleanup_expired_sessions(): void {
    if (is_current_session_expired()) {
        current_tracker = null
        try {
            localStorage.removeItem(TRACKER_CONFIG.STORAGE_KEY)
        } catch (error) {
            console.warn('Failed to cleanup expired session tracker:', error)
        }
    }
}
