import cron from 'node-cron'
import { supabaseAdmin } from '../config/supabase.js'
import { env } from '../config/env.js'
import { createModuleLogger } from '../config/logger.js'

const log = createModuleLogger('reminder-dispatcher')

// Dispatch pending SMS reminders every 5 minutes
export function startReminderDispatcher(): void {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const { data: pending, error } = await supabaseAdmin
        .from('reminders')
        .select('*, users!user_id(phone, locale, preferred_channel)')
        .eq('status', 'pending')
        .lte('scheduled_at', new Date().toISOString())
        .lt('retry_count', 3)
        .is('deleted_at', null)
        .limit(50)

      if (error) {
        log.error({ error }, 'Failed to fetch pending reminders')
        return
      }

      if (!pending?.length) return

      log.info({ count: pending.length }, 'Dispatching reminders')

      for (const reminder of pending) {
        try {
          // In production: call Africa's Talking API
          if (env.NODE_ENV === 'production') {
            // await smsService.send(reminder.users.phone, reminder.message_sw ?? reminder.message_en)
          }

          await supabaseAdmin
            .from('reminders')
            .update({ status: 'sent', sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq('id', reminder.id)

          log.debug({ reminderId: reminder.id, type: reminder.type }, 'Reminder dispatched')
        } catch (err) {
          await supabaseAdmin
            .from('reminders')
            .update({ status: 'failed', retry_count: reminder.retry_count + 1, updated_at: new Date().toISOString() })
            .eq('id', reminder.id)

          log.warn({ err, reminderId: reminder.id }, 'Reminder dispatch failed, will retry')
        }
      }
    } catch (err) {
      log.error({ err }, 'Reminder dispatcher error')
    }
  })

  log.info('Reminder dispatcher started (every 5 minutes)')
}

// Auto-create next vaccination reminders nightly at 06:00 EAT (03:00 UTC)
export function startVaccinationReminderJob(): void {
  cron.schedule('0 3 * * *', async () => {
    log.info('Running vaccination reminder generation job')
    try {
      const { data: due } = await supabaseAdmin
        .from('v_vaccinations_due')
        .select('*')

      if (!due?.length) return

      const reminders = due.map((v) => ({
        user_id: v.owner_phone,  // resolve to user_id in real impl
        animal_id: v.id,
        type: 'vaccination' as const,
        channel: 'sms' as const,
        title_en: `Vaccination due: ${v.vaccine_name}`,
        title_sw: `Chanjo inayokaribia: ${v.vaccine_name_sw ?? v.vaccine_name}`,
        message_en: `Your ${v.species} (tag: ${v.tag_id}) is due for ${v.vaccine_name} on ${new Date(v.next_due_at).toLocaleDateString()}.`,
        message_sw: `${v.species} wako (tag: ${v.tag_id}) anahitaji chanjo ya ${v.vaccine_name_sw ?? v.vaccine_name} tarehe ${new Date(v.next_due_at).toLocaleDateString('sw-KE')}.`,
        scheduled_at: new Date().toISOString(),
        status: 'pending',
      }))

      log.info({ count: reminders.length }, 'Vaccination reminders generated')
    } catch (err) {
      log.error({ err }, 'Vaccination reminder job failed')
    }
  })

  log.info('Vaccination reminder job started (daily 03:00 UTC)')
}
