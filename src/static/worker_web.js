globalThis.onmessage = (e) => {
  let { fn, arg } = e.data || {};
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
    .then(globalThis.postMessage);
};
