import winston        from 'winston';
import * as Transport from 'winston-transport';
import Config         from '../config/Config';


const levels = {
    error: 0,
    warn : 1,
    info : 2,
    http : 3,
    debug: 4
};

const level = () => {
    return Config.production ? 'warn' : 'debug';
};
 
const colors = {
    error: 'red',
    warn : 'yellow',
    info : 'green',
    http : 'magenta',
    debug: 'white'
};
winston.addColors(colors);

const format = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), Config.production ? winston.format.uncolorize() : winston.format.colorize({ all: true }), winston.format.printf((info) => `${ info.timestamp } [${ process.pid }] ${ info.level }: ${ info.message }`));

// Set type of logs (console, file, etc.)
let transports: Array<Transport> = [new winston.transports.Console()];

if (Config.production) {
    transports = transports.concat([new winston.transports.File({
                                                                    filename: 'logs/error.log',
                                                                    level   : 'error'
                                                                }), new winston.transports.File({ filename: 'logs/all.log' })]);
}

// Create logger instance
const logger = winston.createLogger({
                                        level: level(),
                                        levels,
                                        format,
                                        transports
                                    });

export default logger;
