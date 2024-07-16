import { worker_pool } from "@/index";
import { expect, test } from "vitest";

const promise_cost = async (tag: string, promise: Promise<unknown>) => {
  const start = Date.now();
  await promise;
  const end = Date.now();
  const cost = end - start;
  console.log(tag, "promise cost", cost);
};
const wait_time = 100;
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
test("wait time cost", async () => {
  const seq: number[] = [];
  const p = worker_pool({ max: 2 });
  const x1 = p
    .exec(worker_fib, [fib_num])
    .pending.unwrap()
    .then((v) => {
      seq.push(1);
      return v;
    });
  const x2Start = Date.now();
  const x2 = p.exec(worker_fib, [fib_num]);
  x2.pending
    .unwrap()
    .then((v) => {
      seq.push(2);
      return v;
    })
    .catch(() => {
      console.log("test x2 catch", Date.now() - x2Start);
    });
  setTimeout(() => {
    x2.reject();
  }, wait_time);
  const x3Start = Date.now();
  const x3 = p.exec(worker_fib, [fib_num]);
  x3.pending
    .unwrap()
    .then((v) => {
      seq.push(3);
      return v;
    })
    .catch(() => {
      console.log("test x3 catch", Date.now() - x3Start);
    });
  x3.reject();
  const x4 = p
    .exec(worker_fib, [fib_num], { priority: 15 })
    .pending.unwrap()
    .then((v) => {
      seq.push(4);
      return v;
    });
  const x5 = p
    .exec(worker_fib, [fib_num], { priority: 5 })
    .pending.unwrap()
    .then((v) => {
      seq.push(5);
      return v;
    });
  const x6 = p
    .exec(worker_fib, [fib_num], { priority: 20 })
    .pending.unwrap()
    .then((v) => {
      seq.push(6);
      return v;
    });
  const start = Date.now();
  promise_cost("x1", x1);
  promise_cost(
    "x2",
    x2.pending.unwrap().catch(() => {})
  );
  promise_cost(
    "x3",
    x3.pending.unwrap().catch(() => {})
  );
  promise_cost("x4", x4);
  promise_cost("x5", x5);
  promise_cost("x6", x6);
  await Promise.allSettled([
    x1,
    x2.pending.unwrap(),
    x3.pending.unwrap(),
    x4,
    x5,
    x6,
  ]);
  const end = Date.now();
  expect(cost * 5).lte(end - start);
  expect(cost * 5.5 + wait_time).gte(end - start);
  expect(await x1).eq(x);
  expect(await x4).eq(x);
  expect(await x5).eq(x);
  expect(await x6).eq(x);
  expect(seq).toEqual([1, 6, 4, 5]);
});
