// import worker_url_node from "@/static/worker_node.js?raw";
import worker_url_web from "@/static/worker_web.js?url";
import { WorkerOption } from "./types";

const UNSUPPORTED_ENV = "Un Support Environment";

//* 判断不同环境的函数
export const is_deno = () => {
  //@ts-ignore
  return typeof Deno != "undefined" && Deno.version;
};
export const is_node = () => {
  //@ts-ignore 环境判断函数
  return typeof process != "undefined" && process.versions;
};
export const is_browser = () => {
  //@ts-ignore 环境判断函数
  return typeof window != "undefined" && window.document;
};
export const get_cpu_count = () => {
  if (is_deno() || is_browser()) {
    return globalThis?.navigator?.hardwareConcurrency || 1;
  }
  // if (is_node()) {
  //   return require("os").cpus().length;
  // }
  throw Error(UNSUPPORTED_ENV);
};
/**
 *
 * @description 创建 worker
 * 创建:  根据环境创建对应实例
 *    browser - worker -> module
 *    deno    - worker -> module
 *    node    - worker_thread
 */
export const create_worker = (config?: WorkerOption): Worker => {
  if (is_deno() || is_browser()) {
    return new Worker(new URL(worker_url_web), config);
  }
  // if (is_node()) {
  //   const worker = new (require("worker_threads").Worker)(worker_url_node, {
  //     eval: true,
  //   });

  //   return {
  //     postMessage: worker.postMessage.bind(worker),
  //     addEventListener(e: string, fn: (...args: unknown[]) => void) {
  //       worker.on(e, fn);
  //     },
  //     terminate() {
  //       worker.terminate();
  //     },
  //   } as Worker;
  // }
  throw Error(UNSUPPORTED_ENV);
};
