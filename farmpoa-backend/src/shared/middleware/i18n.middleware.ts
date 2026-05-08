import type { FastifyRequest, FastifyReply } from 'fastify'
import type { LocaleCode } from '../types/common.js'

const SUPPORTED_LOCALES: LocaleCode[] = ['en', 'sw', 'am', 'rw', 'lg', 'om']

export function detectLocale(request: FastifyRequest, reply: FastifyReply, done: () => void): void {
  const headerLang = request.headers['accept-language']?.split(',')[0]?.split('-')[0] as LocaleCode
  const queryLang = (request.query as Record<string, string>)['lang'] as LocaleCode
  const userLang = (request.user as { locale?: LocaleCode } | undefined)?.locale

  const locale: LocaleCode =
    SUPPORTED_LOCALES.includes(queryLang) ? queryLang :
    SUPPORTED_LOCALES.includes(userLang ?? 'en') ? (userLang ?? 'sw') :
    SUPPORTED_LOCALES.includes(headerLang) ? headerLang :
    'sw' // East Africa default

  // @ts-ignore — augmenting request
  request.locale = locale
  reply.header('content-language', locale)
  done()
}
