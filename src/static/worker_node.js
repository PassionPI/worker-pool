let { parentPort } = require("node:worker_threads");
parentPort.on("message", (data) => {
  let { payload: p } = data || {};
  let { fn, arg } = p || {};
  let msg = (m) => m || "No Err Msg!";
  Promise.resolve(`return (${fn})(...arguments)`)
    .then(Function)
    .then((fn) => fn(...arg))
    .then(
      (r) => [null, r],
      (e) => [
        e instanceof Error ? msg(e.message) : JSON.stringify(msg(e)),
        null,
      ]
    )
    .then((data) => parentPort.postMessage({ data }));
});
