const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
    // return `${timestamp} [${level}] ${message}`;
    return `[${level}] ${message}`;
  });

const logger = createLogger({
  format: combine(
    // timestamp(),
    myFormat
    // format.simple()
    // format.json()
  ),
  transports: [
    new transports.File({ filename: 'cloud_webapp.log' })
  ],
})

module.exports = logger;

