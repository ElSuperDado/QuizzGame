import { Express }      from 'express-serve-static-core';
import cors             from 'cors';
import morganMiddleware from '../logging/MorganMiddleware';
import logger           from '../logging/WinstonLogger';
import { AddressInfo }  from 'net';
import http             from 'http';
import helmet           from 'helmet';
import express          from 'express';
import WorkerTask       from '../process/WorkerTask';
import multer           from 'multer';
import Config           from '../config/Config';
import BaseRoutes       from '../routes/BaseRoutes';
import ServerIO         from '../socket.io/ServerIO';


class Server implements WorkerTask {
    private readonly backend: Express;
    private readonly server: http.Server;
    private readonly io: ServerIO;

    constructor() {
        this.backend = express();

        this.backend.use(multer().none()); //Used for extract params from body with format "form-data", The none is for say that we do not wait a file in params
        this.backend.use(morganMiddleware); //Log API accesses
        this.backend.use(helmet()); //Help to secure express, https://helmetjs.github.io/
        this.backend.use(cors()); //Allow CORS requests

        //TODO: Add routes and middlewares
        this.backend.use('/', BaseRoutes);

        this.server = http.createServer(this.backend);

        this.io = new ServerIO(this.server);
    }

    run() {
        this.server.listen(Config.api.port, '0.0.0.0', () => {
            const {
                      port,
                      address
                  } = this.server.address() as AddressInfo;
            logger.info(`Server started on http://${ address }:${ port }`);
        });
    }
}


export default Server;
