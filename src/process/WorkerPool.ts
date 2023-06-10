import WorkerRole from './WorkerRole';
import WorkerTask from './WorkerTask';


interface WorkerPool {
    role: WorkerRole,
    quantity: number,
    restartOnFail: boolean,
    loadTask: () => WorkerTask, //This is a function for lazy load the task (only loaded on function call)
}
 

export default WorkerPool;
