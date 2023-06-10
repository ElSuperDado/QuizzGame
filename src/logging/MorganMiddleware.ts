import morgan, { StreamOptions } from 'morgan';

import logger from './WinstonLogger';

 
const stream: StreamOptions = {
    write: (message) => logger.http(message)
};

const skip = () => {
    return false; //SharedConfig.production;
};

const morganMiddleware = morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream,
    skip
});

export default morganMiddleware;
