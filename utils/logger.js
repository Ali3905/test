const winston = require('winston');
const LokiTransport = require('winston-loki');
require('dotenv').config();

const logger = winston.createLogger({
  level: 'http',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [],
});

// Console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} ${level}: ${message}`;
        })
      ),
    })
  );
}

// Loki transport for production environment
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new LokiTransport({
      host: process.env.GRAFANA_LOKI_URL,
      basicAuth: `${process.env.GRAFANA_USER}:${process.env.GRAFANA_API_KEY}`,
      labels: {
        app: process.env.APP_NAME || 'aass-server',
      },
      json: true,
      format: winston.format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error('Loki connection error:', err),
    })
  );
}

module.exports = logger;
