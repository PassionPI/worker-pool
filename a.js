const { worker_pool } = require("./dist/bundle.cjs");

const pool = worker_pool();

const doo = (x) => {
  const fib = (n) => (n <= 1 ? 1 : fib(n - 1) + fib(n - 2));
  const result = fib(x);
  console.log("result", result);
  return result;
};

(async () => {
  console.log(
    // pool.exec(doo, [45])
    await Promise.all(
      Array.from({ length: 60 }).map(() => pool.exec(doo, [45]))
    )
  );
  console.log("done");
  pool.terminate();
})();
