import cluster         from 'cluster';
import { Worker }      from 'cluster';
import logger          from '../logging/WinstonLogger';
import WorkerRole      from './WorkerRole';
import os              from 'os';
import ClusterStrategy from './ClusterStrategy';
import WorkerPool      from './WorkerPool';

 
class ClusterManager {
    public static readonly CORES = os.cpus().length;

    private workers: { [pid: number]: WorkerRole; } = [];

    constructor(private strategy: ClusterStrategy) {}

    private getWorkerPool(role: WorkerRole): WorkerPool | undefined {
        return this.strategy.find(elem => elem.role === role);
    }

    private runPrimary() {
        logger.info(`Number of cores: ${ ClusterManager.CORES }`);
        logger.info(`Primary process is running`);

        this.strategy.forEach(workerPool => {
            for (let i = 0 ; i < workerPool.quantity ; i += 1) {
                const worker = cluster.fork({ role: workerPool.role });
                this.workers[worker.process.pid] = workerPool.role;
            }
        });

        // Listen for dying workers and restart them
        cluster.on('exit', (worker: Worker, code: number) => {
            logger.info(`Worker ${ worker.process.pid } exited with code ${ code }`);

            const workerRole = this.workers[worker.process.pid];

            const workerPool = this.getWorkerPool(workerRole);
            if (workerPool && workerPool.restartOnFail) {
                const newWorker = cluster.fork({ role: workerRole });
                this.workers[newWorker.process.pid] = workerPool.role;
            }

            delete this.workers[worker.process.pid];
        });
    }

    private runWorker() {
        const worker = cluster.worker;
        const workerRole = Number(process.env['role']);

        const workerPool = this.getWorkerPool(workerRole);
        if (workerPool) {
            workerPool.loadTask().run();
        } else {
            logger.warn(`Process task not found for role ${ workerRole }`);
        }
    }

    run() {
        if (cluster.isPrimary) {
            this.runPrimary();
        } else {
            this.runWorker();
        }
    }
}


export default ClusterManager;
