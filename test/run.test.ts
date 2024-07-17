import { worker_pool } from "@/index";
import { expect, test } from "vitest";

const promise_cost = async (tag: string, promise: Promise<unknown>) => {
  const start = Date.now();
  await promise;
  const end = Date.now();
  const cost = end - start;
  console.log(tag, "run promise cost", cost);
};
const fib_num = 37;
const worker_fib = (n: number): number => {
  const fib = (n: number): number => {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
  };
  return fib(n);
};
const start = Date.now();
const x = worker_fib(fib_num);
const end = Date.now();
const cost = end - start;
console.log("One worker cost", cost);
test("run time cost", async () => {
  const p = worker_pool({ max: 2 });

  const x1 = p.exec(worker_fib, [fib_num]).pending;

  const x2 = p.exec(worker_fib, [fib_num]).pending;

  const x3 = p.exec(worker_fib, [fib_num]).pending;

  const x4 = p.exec(worker_fib, [fib_num], { priority: 15 }).pending;

  const x5 = p.exec(worker_fib, [fib_num], { priority: 5 }).pending;

  const x6 = p.exec(worker_fib, [fib_num], { priority: 20 }).pending;

  promise_cost("x1", x1);
  promise_cost("x2", x2);
  promise_cost("x3", x3);
  promise_cost("x4", x4);
  promise_cost("x5", x5);
  promise_cost("x6", x6);

  const start = Date.now();
  await Promise.allSettled([x1, x2, x3, x4, x5, x6]);
  const end = Date.now();
  expect(cost * 3).lte(end - start);
  expect(cost * 3.5).gte(end - start);
  expect(await x1).eq(x);
  expect(await x2).eq(x);
  expect(await x3).eq(x);
  expect(await x4).eq(x);
  expect(await x5).eq(x);
  expect(await x6).eq(x);
  console.log(cost * 3 < end - start);
  console.log(cost * 3.5 > end - start);
  console.log((await x6) === x);
});
