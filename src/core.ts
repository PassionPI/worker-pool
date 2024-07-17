import { concurrent, defer } from "@passion_pi/fp";
import { create_worker, get_cpu_count } from "./effect";
import { WorkerOption } from "./types";

type ID = number;

const worker_handler = (config?: WorkerOption) => {
  let x = defer<any>();

  const refresh = () => (x = defer());
  const worker = create_worker(config);

  worker.addEventListener("message", (e) => {
    const [err, result] = e.data || [];
    if (err != null) {
      x.reject(err);
    } else {
      x.resolve(result);
    }
    refresh();
  });

  worker.addEventListener("error", (e) => {
    x.reject(e.error);
    refresh();
  });

  const run = async <P extends unknown[], R extends unknown>(
    fn: (...arg: P) => R,
    arg: P
  ): Promise<R> => {
    worker.postMessage({
      payload: {
        fn: fn.toString(),
        arg,
      },
    });
    return x.pending;
  };

  return { worker, run };
};

export function worker_pool({
  max = get_cpu_count(),
  workerOption,
}: { max?: number; workerOption?: WorkerOption } = {}) {
  const control = concurrent({ max_concurrency: max });
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
    config?: Parameters<typeof control.add<R, N>>[1]
  ) => {
    let id: undefined | ID;

    const task = control.add(async () => {
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
            idle.push(id);
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
    control.clear();
  };

  return {
    exec,
    terminate,
  };
}
