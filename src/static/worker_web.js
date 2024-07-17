self.onmessage = (e) => {
  let { payload: p } = e.data || {};
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
    .then(self.postMessage);
};
