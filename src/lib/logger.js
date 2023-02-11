import winston from 'winston'

// setup logger
export const logger = winston.createLogger({
  level: 'info',
  transports: [
      new winston.transports.Console({level: 'info'}),
      new winston.transports.File({filename: 'error.log', level: 'error'}),
  ]
})