import { createSchedular, defer, IsValidPriority } from "@passion_pi/fp";
import { create_worker, get_cpu_count } from "./effect";
import { WorkerOption } from "./types";

type ID = number;

const worker_handler = (config?: WorkerOption) => {
  let loader = defer<any>();

  const refresh = () => (loader = defer());
  const worker = create_worker(config);

  worker.addEventListener("message", (e) => {
    const [err, result] = e.data || [];
    if (err != null) {
      loader.reject(err);
    } else {
      loader.resolve(result);
    }
    refresh();
  });

  worker.addEventListener("error", (e) => {
    loader.reject(e.error);
    refresh();
  });

  const run = async <P extends unknown[], R extends unknown>(
    fn: (...arg: P) => R,
    arg: P
  ): Promise<R> => {
    worker.postMessage({
      x: {
        fn: fn.toString(),
        arg,
      },
    });
    return loader.pending;
  };

  return { worker, run };
};

export function workerPool({
  max = get_cpu_count(),
  workerOption,
}: { max?: number; workerOption?: WorkerOption } = {}) {
  const schedular = createSchedular({ concurrent: max });
  const pool = new Map<ID, ReturnType<typeof worker_handler>>();
  const idle = Array<ID>();

  let inc: ID = 0;

  const exec = <
    P extends unknown[],
    R extends unknown,
    N extends number = number
  >(
    fn: (...arg: P) => R,
    arg: P,
    config?: { priority?: IsValidPriority<N>; tag?: string }
  ): {
    pending: Promise<R>;
    reject: (msg?: string) => void;
  } => {
    let id: undefined | ID;

    const task = schedular.add(async () => {
      //* worker数量未达上限
      if (pool.size < max) {
        inc++;
        idle.push(inc);
        pool.set(inc, worker_handler(workerOption));
      }
      id = idle.pop();
      if (id != null) {
        const { run } = pool.get(id) || {};
        if (run) {
          try {
            return await run(fn, arg);
          } finally {
            id && idle.push(id);
          }
        } else {
          throw Error("Worker Not Found!");
        }
      } else {
        throw Error("Worker ID Not Found!");
      }
    }, config);

    return {
      ...task,
      reject(msg: string = "") {
        task.reject(Error("Task handle Rejected!" + msg));
        if (id != null) {
          const handler = pool.get(id);
          if (handler) {
            handler.worker.terminate();
            handler.worker.dispatchEvent(new Event("error"));
            pool.delete(id);
            id = undefined;
          }
        }
      },
    };
  };

  //* 关闭所有worker
  const terminate = () => {
    idle.length = 0;
    pool.forEach(({ worker }) => worker.terminate());
    pool.clear();
    schedular.clear();
  };

  return {
    exec,
    terminate,
    idle: schedular.idle,
    tasks: schedular.tasks,
  };
}
