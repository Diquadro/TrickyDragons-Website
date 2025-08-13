import { welcome_email_cron } from './welcome_email_cron'

/**
 * Cron Jobs Manager
 * Centralizes all scheduled jobs for the application
 */

export function start_all_cron_jobs() {
	console.log('🕒 Starting all cron jobs...')

	// Start welcome email cron job
	welcome_email_cron.start()
	console.log('✅ Welcome email cron job started - runs every 10 minutes')

	// Future cron jobs can be added here
	// example_cron.start()
}

export function stop_all_cron_jobs() {
	console.log('🛑 Stopping all cron jobs...')

	// Stop welcome email cron job
	welcome_email_cron.stop()
	console.log('✅ Welcome email cron job stopped')

	// Future cron jobs can be stopped here
	// example_cron.stop()
}

// Export individual cron jobs for direct access if needed
export { welcome_email_cron }
