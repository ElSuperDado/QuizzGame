// Read from the .env file
// ATTENTION : This line MUST be the first of this file
require('dotenv').config();

import ClusterManager from './process/ClusterManager';
import Server         from './express/Server';
import WorkerRole     from './process/WorkerRole';

new Server().run();


// (new ClusterManager([{
//     role         : WorkerRole.API,
//     quantity     : ClusterManager.CORES,
//     restartOnFail: true,
//     loadTask     : () => { return new Server(); }
// }])).run();

