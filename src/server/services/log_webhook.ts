import { sql } from '@server/models/postgres_client'
import WebhookLogs, { WebhookLogsInitializer } from '@shared/schemas/database/public/WebhookLogs'
import { ContactsUuid } from '@shared/schemas/database/public/Contacts'

interface webhook_log_data {
	webhook_source: string
	request_method: string
	request_url: string
	request_headers?: Record<string, any>
	request_body?: Record<string, any>
	response_status?: number
	response_body?: Record<string, any>
	processing_outcome: 'success' | 'contact_not_found' | 'validation_error' | 'processing_error'
	processing_message: string
	error_details?: Record<string, any>
	contact_uuid?: ContactsUuid
	action_created?: boolean
	occurred_at?: Date
}

/**
 * Log webhook event in database
 * Simple function following create_analytics_event pattern
 */
export async function log_webhook_event(webhook_log_data: webhook_log_data): Promise<WebhookLogs> {
	const webhook_log: WebhookLogsInitializer = {
		webhook_source: webhook_log_data.webhook_source,
		request_method: webhook_log_data.request_method,
		request_url: webhook_log_data.request_url,
		request_headers: webhook_log_data.request_headers || null,
		request_body: webhook_log_data.request_body || null,
		response_status: webhook_log_data.response_status || null,
		response_body: webhook_log_data.response_body || null,
		processing_outcome: webhook_log_data.processing_outcome,
		processing_message: webhook_log_data.processing_message,
		error_details: webhook_log_data.error_details || null,
		contact_uuid: webhook_log_data.contact_uuid || null,
		action_created: webhook_log_data.action_created || false,
		occurred_at: webhook_log_data.occurred_at || new Date(),
	}

	const created_logs = await sql.insert<WebhookLogs[]>('webhook_logs', [webhook_log])

	if (created_logs.length === 0) {
		throw new Error('Failed to create webhook log')
	}

	return created_logs[0]
}