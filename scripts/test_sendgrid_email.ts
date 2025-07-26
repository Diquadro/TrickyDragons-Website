// Usage: npx tsx --env-file=.env scripts/test_sendgrid_email.ts
import { send_welcome_email } from '../src/shared/templates/emails/welcome/welcome'

interface EmailResult {
    success: boolean
    recipient: string
    messageId?: string
    error?: string
}

// Per il tuo testing immediato
const getRotatedTestEmail = () => {
    const emails = ['daniele.dambrosio@trickydragons.com', 'louise.fedullo@trickydragons.com']

    // Semplice rotazione basata sul tempo
    const index = Math.floor(Date.now() / 60000) % emails.length
    return emails[index]
}

const recipients = [getRotatedTestEmail()]

async function test_sendgrid_email_sending(): Promise<void> {
    console.log('🚀 Starting SendGrid email test...')

    // Debug: Check environment variables
    console.log('🔍 Environment variables check:')
    console.log(
        '- SENDGRID_API_KEY:',
        process.env.SENDGRID_API_KEY ? `${process.env.SENDGRID_API_KEY.substring(0, 8)}...` : '❌ NOT SET',
    )
    console.log('- SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || '❌ NOT SET')
    console.log('- NODE_ENV:', process.env.NODE_ENV || 'undefined')

    process.env.SENDGRID_FORCE = 'true' // Force SendGrid for testing
    console.log('- SENDGRID_FORCE:', process.env.SENDGRID_FORCE)
    console.log('---')

    // Check if required variables are set
    if (!process.env.SENDGRID_API_KEY) {
        console.error('❌ SENDGRID_API_KEY is not set in environment variables!')
        console.log('💡 Add this to your .env file:')
        console.log('SENDGRID_API_KEY=your_sendgrid_api_key_here')
        return
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
        console.error('❌ SENDGRID_FROM_EMAIL is not set in environment variables!')
        console.log('💡 Add this to your .env file:')
        console.log('SENDGRID_FROM_EMAIL=your_verified_email@domain.com')
        return
    }

    console.log(`📧 Sending to ${recipients.length} recipients`)
    console.log('---')

    const results: EmailResult[] = []

    for (const recipient of recipients) {
        try {
            console.log(`📤 Sending welcome email to: ${recipient}`)

            const result = await send_welcome_email(recipient)

            console.log(`✅ Success for ${recipient}:`, {
                messageId: result.messageId,
                response: result.response,
            })

            results.push({
                success: true,
                recipient,
                messageId: result.messageId,
            })
        } catch (error) {
            console.log(`❌ Error for ${recipient}:`, error)
            results.push({
                success: false,
                recipient,
                error: error instanceof Error ? error.message : String(error),
            })
        }

        console.log('---')
    }

    // Summary
    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    console.log('📊 FINAL RESULTS:')
    console.log(`✅ Successful: ${successful}/${recipients.length}`)
    console.log(`❌ Failed: ${failed}/${recipients.length}`)

    if (failed > 0) {
        console.log('\n💥 Failed emails:')
        results.filter((r) => !r.success).forEach((r) => console.log(`  - ${r.recipient}: ${r.error}`))
    }

    console.log('\n🎯 Next steps:')
    console.log('1. Check your SendGrid dashboard for email activity')
    console.log('2. Check webhook events at your configured endpoint')
    console.log('3. Verify unique_args appear in webhook data')
    console.log('4. Confirm category and environment tracking work correctly')

    if (successful > 0) {
        console.log('\n📧 WHAT WE SENT (X-SMTPAPI Header):')
        console.log('- category: v1_welcome')
        console.log('- unique_args.environment: [NODE_ENV]')
        console.log('- unique_args.template: v1_welcome')
    }
}

// Run the test
test_sendgrid_email_sending().catch(console.error)
