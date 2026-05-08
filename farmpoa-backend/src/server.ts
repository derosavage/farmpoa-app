import 'dotenv/config'
import { buildApp } from './app.js'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { startReminderDispatcher, startVaccinationReminderJob } from './jobs/reminderDispatcher.js'

async function start(): Promise<void> {
  const app = await buildApp()

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT']
  for (const signal of signals) {
    process.on(signal, async () => {
      logger.info({ signal }, 'Shutdown signal received')
      try {
        await app.close()
        logger.info('Server closed gracefully')
        process.exit(0)
      } catch (err) {
        logger.error({ err }, 'Error during shutdown')
        process.exit(1)
      }
    })
  }

  // ── Unhandled rejections ───────────────────────────────────────────────────
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection')
  })

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception — shutting down')
    process.exit(1)
  })

  // ── Start server ──────────────────────────────────────────────────────────
  try {
    await app.listen({ port: env.PORT, host: env.HOST })
    logger.info({ port: env.PORT, host: env.HOST, env: env.NODE_ENV }, '🐄 FarmPOA backend started')

    // Start background jobs
    startReminderDispatcher()
    startVaccinationReminderJob()
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server')
    process.exit(1)
  }
}

start()
