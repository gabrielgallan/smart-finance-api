import winston from 'winston'
import env from '../env/config'

/**
 * Formato para leitura humana (dev)
 */
import util from 'util'

const { combine, timestamp, printf, errors, colorize } = winston.format

const isProduction = env.NODE_ENV === 'production'

const devFormat = printf((info) => {
  const { level, message, timestamp, stack } = info

  const splat: unknown[] = Array.isArray(info[Symbol.for('splat')])
    ? (info[Symbol.for('splat')] as unknown[])
    : []
  const meta =
    splat.length > 0 ? util.inspect(splat, { depth: null, colors: true }) : ''

  return `${timestamp} [${level}]: ${stack || message}${
    meta ? `\n${meta}` : ''
  }`
})

/**
 * Logger principal
 */
const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: combine(
    timestamp(),
    errors({ stack: true }), // captura stack trace
    isProduction ? devFormat : devFormat,
  ),
  transports: [
    new winston.transports.Console({
      format: isProduction
        ? combine(colorize(), devFormat)
        : combine(colorize(), devFormat),
    }),
  ],
})

export default logger
