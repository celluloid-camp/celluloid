import pino from 'pino';

export const Logger = pino({
    level: process.env.CELLULOID_LOG_LEVEL || 'info'
});

export const logger = (module: string) => Logger.child({ module });