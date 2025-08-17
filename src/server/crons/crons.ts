import { welcome_email_non_vip_1_cron } from './welcome_email_non_vip_1_cron'
import { welcome_email_non_vip_2_cron } from './welcome_email_non_vip_2_cron'
import { welcome_email_vip_1_cron } from './welcome_email_vip_1_cron'
import { welcome_email_vip_2_cron } from './welcome_email_vip_2_cron'

/**
 * Cron Jobs Manager
 * Centralizes all scheduled jobs for the application
 */

export function start_all_cron_jobs() {
    console.log('🕒 Starting all cron jobs...')

    // Start welcome email cron jobs
    welcome_email_non_vip_1_cron.start()
    console.log('✅ Welcome email non-VIP #1 cron job started - runs every 2/10 minutes')

    welcome_email_non_vip_2_cron.start()
    console.log('✅ Welcome email non-VIP #2 cron job started - runs every 2/10 minutes')

    welcome_email_vip_1_cron.start()
    console.log('✅ Welcome email VIP #1 cron job started - runs every 2/10 minutes')

    welcome_email_vip_2_cron.start()
    console.log('✅ Welcome email VIP #2 cron job started - runs every 2/10 minutes')

    // Future cron jobs can be added here
    // example_cron.start()
}

export function stop_all_cron_jobs() {
    console.log('🛑 Stopping all cron jobs...')

    // Stop welcome email cron jobs
    welcome_email_non_vip_1_cron.stop()
    console.log('✅ Welcome email non-VIP #1 cron job stopped')

    welcome_email_non_vip_2_cron.stop()
    console.log('✅ Welcome email non-VIP #2 cron job stopped')

    welcome_email_vip_1_cron.stop()
    console.log('✅ Welcome email VIP #1 cron job stopped')

    welcome_email_vip_2_cron.stop()
    console.log('✅ Welcome email VIP #2 cron job stopped')

    // Future cron jobs can be stopped here
    // example_cron.stop()
}

// Export individual cron jobs for direct access if needed
export {
    welcome_email_non_vip_1_cron,
    welcome_email_non_vip_2_cron,
    welcome_email_vip_1_cron,
    welcome_email_vip_2_cron,
}
