// Import DataTables CSS e JS
import 'datatables.net-dt/css/dataTables.dataTables.min.css'
import DataTable, { type Api } from 'datatables.net-dt'
import { API } from '@shared/constants/app.constants'

// Interfacce per i dati
interface ContactData {
    auto_serial: number
    email: string
    first_name: string | null
    last_name: string | null
    status: string
    subscriptions: string[] | null
    created_date: string
    sent_emails: string[] | null
}

interface OrderData {
    auto_serial: number
    email: string
    amount_total: number
    currency: string
    status: string
    stripe_session_id: string | null
    occurred_at: string
    billing_name: string | null
    billing_country: string | null
}

interface AnalyticsData {
    uuid: string
    event_name: string
    page_url: string | null
    utm_source: string | null
    utm_campaign: string | null
    country: string | null
    occurred_at: string
    session_id: string
}

interface TableConfig {
    title: string
    endpoint: string
    columns: any[]
}

// Configurazioni delle tabelle
const tableConfigs: Record<string, TableConfig> = {
    contacts: {
        title: '👥 Contacts',
        endpoint: `${API.ENDPOINTS.ADMIN.TABLES}/contacts`,
        columns: [
            { title: 'ID', data: 'auto_serial', width: '60px' },
            { title: 'Email', data: 'email' },
            { title: 'Nome', data: 'first_name', render: (data: string | null) => data || '-' },
            { title: 'Cognome', data: 'last_name', render: (data: string | null) => data || '-' },
            {
                title: 'Status',
                data: 'status',
                render: (data: string) => `<span class="status-badge status-${data}">${data}</span>`,
            },
            {
                title: 'Subscriptions',
                data: 'subscriptions',
                render: (data: string[] | null) => (data ? data.join(', ') : '-'),
            },
            {
                title: 'Emails Sent',
                data: 'sent_emails',
                render: (data: string[] | null) => (data ? data.length.toString() : '0'),
            },
            {
                title: 'Data Creazione',
                data: 'created_date',
                render: (data: string) => new Date(data).toLocaleDateString('it-IT'),
            },
        ],
    },
    orders: {
        title: '💰 Orders',
        endpoint: `${API.ENDPOINTS.ADMIN.TABLES}/orders`,
        columns: [
            { title: 'ID', data: 'auto_serial', width: '60px' },
            { title: 'Email', data: 'email' },
            {
                title: 'Importo',
                data: 'amount_total',
                render: (data: string, type: string, row: OrderData) =>
                    `${parseFloat(data).toFixed(2)} ${row.currency}`,
            },
            {
                title: 'Status',
                data: 'status',
                render: (data: string) => `<span class="status-badge status-${data}">${data}</span>`,
            },
            { title: 'Cliente', data: 'billing_name', render: (data: string | null) => data || '-' },
            { title: 'Paese', data: 'billing_country', render: (data: string | null) => data || '-' },
            { title: 'Stripe ID', data: 'stripe_session_id', render: (data: string | null) => data || '-' },
            {
                title: 'Data',
                data: 'occurred_at',
                render: (data: string) =>
                    new Date(data).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
            },
        ],
    },
    analytics: {
        title: '📈 Analytics',
        endpoint: `${API.ENDPOINTS.ADMIN.TABLES}/analytics`,
        columns: [
            {
                title: 'UUID',
                data: 'uuid',
                width: '80px',
                render: (data: string) => data.slice(0, 8) + '...',
            },
            { title: 'Evento', data: 'event_name' },
            { title: 'Pagina', data: 'page_url', render: (data: string | null) => data || '-' },
            { title: 'UTM Source', data: 'utm_source', render: (data: string | null) => data || '-' },
            { title: 'UTM Campaign', data: 'utm_campaign', render: (data: string | null) => data || '-' },
            { title: 'Paese', data: 'country', render: (data: string | null) => data || '-' },
            { title: 'Session', data: 'session_id', render: (data: string) => data.slice(0, 8) + '...' },
            {
                title: 'Data',
                data: 'occurred_at',
                render: (data: string) =>
                    new Date(data).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
            },
        ],
    },
}

class AdminDashboard {
    private currentTable: Api<any> | null = null
    private currentTableName: string = 'contacts'

    constructor() {
        this.init()
    }

    private init(): void {
        // Inizializza con la prima tabella
        this.loadTable('contacts')

        // Gestisci i tab
        this.setupTabButtons()

        // Gestisci i controlli
        this.setupControls()

        // Carica i contatori iniziali
        this.loadTableCounts()
    }

    private setupTabButtons(): void {
        const tabButtons = document.querySelectorAll('.tab-btn')

        tabButtons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLButtonElement
                const tableName = target.dataset.table

                if (tableName) {
                    // Aggiorna UI tabs
                    tabButtons.forEach((b) => b.classList.remove('active'))
                    target.classList.add('active')

                    // Carica nuova tabella
                    this.loadTable(tableName)
                }
            })
        })
    }

    private setupControls(): void {
        const refreshBtn = document.getElementById('refresh-btn')
        const searchInput = document.getElementById('search-input') as HTMLInputElement
        const pageLengthSelect = document.getElementById('page-length') as HTMLSelectElement

        refreshBtn?.addEventListener('click', () => {
            this.loadTable(this.currentTableName)
        })

        searchInput?.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement
            if (this.currentTable) {
                this.currentTable.search(target.value).draw()
            }
        })

        pageLengthSelect?.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement
            if (this.currentTable) {
                this.currentTable.page.len(parseInt(target.value)).draw()
            }
        })
    }

    private async loadTableCounts(): Promise<void> {
        try {
            const response = await fetch(API.ENDPOINTS.ADMIN.COUNTS)
            const data = await response.json()

            if (data.success) {
                Object.entries(data.counts).forEach(([tableName, count]) => {
                    const countElement = document.getElementById(`${tableName}-count`)
                    if (countElement && typeof count === 'number') {
                        countElement.textContent = count.toString()
                    }
                })
            }
        } catch (error) {
            console.error('Errore nel caricamento dei contatori:', error)
        }
    }

    private showLoading(): void {
        const loadingOverlay = document.querySelector('.loading-overlay')
        loadingOverlay?.classList.add('active')
    }

    private hideLoading(): void {
        const loadingOverlay = document.querySelector('.loading-overlay')
        loadingOverlay?.classList.remove('active')
    }

    private updateTitle(title: string): void {
        const titleElement = document.getElementById('table-title')
        if (titleElement) {
            titleElement.textContent = title
        }
    }

    public async loadTable(tableName: string): Promise<void> {
        try {
            this.showLoading()
            this.currentTableName = tableName

            const config = tableConfigs[tableName]
            if (!config) {
                throw new Error(`Configurazione non trovata per la tabella: ${tableName}`)
            }

            // Aggiorna titolo
            this.updateTitle(config.title)

            // Distruggi tabella esistente
            if (this.currentTable) {
                this.currentTable.destroy()
                this.currentTable = null
            }

            // Fetch dati
            const response = await fetch(config.endpoint)
            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Errore sconosciuto')
            }

            // Crea nuova tabella
            const tableElement = document.getElementById('data-table') as HTMLTableElement

            this.currentTable = new DataTable(tableElement, {
                data: result.data,
                columns: config.columns,
                pageLength: 25,
                order: [[0, 'desc']], // Ordina per ID discendente
                language: {
                    lengthMenu: 'Mostra _MENU_ record per pagina',
                    zeroRecords: 'Nessun record trovato',
                    info: 'Pagina _PAGE_ di _PAGES_ (_TOTAL_ record totali)',
                    infoEmpty: 'Nessun record disponibile',
                    infoFiltered: '(filtrati da _MAX_ record totali)',
                    search: 'Cerca:',
                    paginate: {
                        first: 'Primo',
                        last: 'Ultimo',
                        next: 'Successivo',
                        previous: 'Precedente',
                    },
                },
                dom: 't<"bottom"ip>', // Rimuovi i controlli di default
                scrollX: true,
                autoWidth: false,
            })
        } catch (error) {
            console.error('Errore caricamento tabella:', error)
            alert(
                `Errore nel caricamento dei dati: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
            )
        } finally {
            this.hideLoading()
        }
    }
}

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard()
})
