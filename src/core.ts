import { concurrent, defer } from "@passion_pi/fp";
import { create_worker, get_cpu_count } from "./effect";

/**
 *
 * @description 封装 worker
 * 封装:  封装成单个Promise函数
 *  1、 错误处理
 *  2、 terminal
 *  3、 currency
 */
const worker_handler = () => {
  const worker = create_worker();

  const ref = { defer: defer<any>() };
  let x = Promise.withResolvers();
  worker.addEventListener("message", (e) => {
    const [err, result] = e.data || [];
    if (err != null) {
      ref.defer.reject(err.msg);
    } else {
      ref.defer.resolve(result);
    }
    ref.defer = defer();
  });

  worker.addEventListener("error", (e) => {
    ref.defer.reject(e.error);
    ref.defer = defer();
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
    return ref.defer.pending.unwrap();
  };

  return { worker, run };
};

export function worker_pool({ max = get_cpu_count() }: { max?: number } = {}) {
  const control = concurrent({ max_concurrency: max });
  //* 当前闲置可用的worker的key
  const rest: Array<number> = [];
  const pool = new Map<number, ReturnType<typeof worker_handler>>();
  //* worker的id
  let inc = 0;

  const exec = <P extends unknown[], R extends unknown>(
    fn: (...arg: P) => R,
    arg: P,
    config?: Parameters<typeof control.add<any, number>>[1]
  ) => {
    let id: undefined | number;

    const task = control.add(async () => {
      //* worker数量未达上限
      if (pool.size < max) {
        inc++;
        rest.push(inc);
        pool.set(inc, worker_handler());
      }
      id = rest.pop();
      if (id != null) {
        const { run } = pool.get(id) || {};
        if (run) {
          const x = await run(fn, arg);
          rest.push(id);
          return x;
        } else {
          throw Error("Worker Not Found!");
        }
      } else {
        throw Error("Worker ID Not Found!");
      }
    }, config);
    return {
      ...task,
      reject(msg: string) {
        task.reject(Error("Task handle Rejected!"));
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
    for (const { worker } of pool.values()) {
      worker.terminate();
    }
    pool.clear();
    rest.length = 0;
    control.clear();
  };

  return {
    exec,
    terminate,
  };
}
