# Work Pool

## See [The Latest Document Here](https://github.com/PassionPI/worker-pool).

## Introduction

This is a simple worker pool implementation in browser. It is a simple and easy-to-use tool for parallel processing. It is designed to be simple and easy to use, and it is suitable for small-scale parallel processing tasks.

## Usage

1.  Demo

```typescript
import { workerPool } from "worker-pool";

const worker_task = (n: number): number => {
  const fib = (n: number): number => {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
  };
  return fib(n);
};

const pool = workerPool({ max: 2 });

const fib40 = pool.exec(worker_task, [40]);
const fib42 = pool.exec(worker_task, [42]);
const fib43 = pool.exec(worker_task, [43]);

// Max worker is set 2, It will first run fib40 and fib42, and then run fib43
Promise.all([fib40.pending, fib42.pending, fib43.pending]).then((results) => {
  console.log(results);
});
```

2. Initialize

```typescript
import { workerPool } from "worker-pool";

const pool = workerPool({
  // The maximum number of workers that can be created
  // Optional, default is cpu count
  max: 2,
  // The option of worker, same as the option of `new Worker(url, workerOption)`
  // Optional, default is `{ type: "classic" }`
  // You can use `type: "module"` to use ES module in worker, or in `Deno` environment
  workerOption: {
    type: "module",
  },
});
```

3. Exec

```typescript
const task = (n: number): number => {
  return n + 1;
};

const inc = pool.exec(
  // The task to be executed by the worker
  task,
  // The `arguments` of the task, it should be an array & can be `JSON.stringify`
  [1],
  // The config of the task
  // Optional, default is `{ priority: 10 }`
  {
    // The tag of the task, it is used to identify the task
    // Optional, default is ""
    tag: "Plus 1",
    // The priority of the task, the higher the priority, will be executed first
    // Optional, default is 10
    priority: 15,
  }
);

inc.pending.then((result) => {
  console.log(result);
});
```

4. Terminate

One task can be terminated by calling `reject` method.

```typescript
inc.reject("Terminated because of some reason");
// The result of the `inc.pending` will be `reject` with the reason.
// When the task is not running, the task will only remove in the scheduler.
// When the task is running, the worker will be terminated.
```

All tasks can be terminated by calling `terminate` method.

```typescript
pool.terminate();
// This will terminate all workers and remove all tasks in the scheduler.
```

5. Status

You can use `pool.idle()` to see if some worker is idle.

```typescript
const isIdle = pool.idle();
// If there is at least one worker is idle, it will return `true`, otherwise `false`.
```

You can use `pool.tasks()` to see the status of the worker pool.

```typescript
const tasks = pool.tasks();
// It will return an array of tasks in the scheduler.
// The task is an object with the following properties:
type Task = {
  // The tag of the task
  tag?: string;
  // The priority of the task
  priority?: number;
  // The task function
  task: Function;
};
type Tasks = {
  // The tasks that are running
  running: Task[];
  // The tasks that are pending
  pending: Task[];
};
```
