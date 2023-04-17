var Z = (t, e, n) => {
  if (!e.has(t))
    throw TypeError("Cannot " + n);
};
var o = (t, e, n) => (Z(t, e, "read from private field"), n ? n.call(t) : e.get(t)), a = (t, e, n) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, n);
}, i = (t, e, n, r) => (Z(t, e, "write to private field"), r ? r.call(t, n) : e.set(t, n), n), w = (t, e, n, r) => ({
  set _(s) {
    i(t, e, s, n);
  },
  get _() {
    return o(t, e, r);
  }
});
const E = "data:application/javascript;base64,c2VsZi5vbm1lc3NhZ2UgPSAoZSkgPT4gewogIGNvbnN0IHsgcGF5bG9hZCB9ID0gZS5kYXRhIHx8IHt9OwogIGNvbnN0IHsgZm4sIGFyZyB9ID0gcGF5bG9hZCB8fCB7fTsKCiAgY29uc3QgbXNnID0gKG0pID0+IG0gfHwgIk5vIEVyciBNc2chIjsKICBjb25zdCBlcnIgPSAoZSkgPT4gKHsKICAgIG1zZzogZSBpbnN0YW5jZW9mIEVycm9yID8gbXNnKGUubWVzc2FnZSkgOiBKU09OLnN0cmluZ2lmeShtc2coZSkpLAogIH0pOwoKICBQcm9taXNlLnJlc29sdmUoYHJldHVybiAoJHtmbn0pKC4uLmFyZ3VtZW50cylgKQogICAgLnRoZW4oRnVuY3Rpb24pCiAgICAudGhlbigoZm4pID0+IGZuKC4uLmFyZykpCiAgICAudGhlbigKICAgICAgKHIpID0+IFtudWxsLCByXSwKICAgICAgKGUpID0+IFtlcnIoZSksIG51bGxdCiAgICApCiAgICAudGhlbihzZWxmLnBvc3RNZXNzYWdlKTsKfTsK", { freeze: _, create: Q } = Object;
class C extends Array {
}
const G = (t) => t instanceof C, K = (t) => G(t) ? t[0] ? t : K() : _(
  C.of(
    t instanceof Error ? t : Error(typeof t == "object" ? JSON.stringify(t) : String(t)),
    null
  )
), H = (t) => G(t) ? t : _(C.of(null, t)), S = (t) => new Proxy(t, {
  async apply(...e) {
    try {
      return H(await Reflect.apply(...e));
    } catch (n) {
      return K(n);
    }
  }
}), N = Symbol(), D = (t, e) => {
  const n = [];
  let r = -1, s = -1;
  for (; ++r < t.length; )
    n.push(t[r] === N ? e[++s] : t[r]);
  for (; ++s < e.length; )
    n.push(e[s]);
  return n;
}, R = (t) => (e) => {
  const n = (r) => new Proxy(e, {
    apply(s, u, b) {
      const y = D(r, b).slice(0, t);
      return y.length === t && !y.includes(N) ? Reflect.apply(s, u, y) : n(y);
    }
  });
  return n([]);
}, W = R(2), v = (t) => new Promise((e) => setTimeout(e, t));
W((t, e) => {
  let n = !0;
  const r = () => {
    n = !1;
  };
  return {
    loop: S(async () => {
      for (n = !0, await v(t); n; )
        await e(), await v(t);
    }),
    stop: r
  };
});
const F = (...t) => (e) => {
  for (const n of t)
    e = n(e);
  return e;
}, U = (t) => {
  let e = null;
  return new Proxy(t, {
    async apply(...n) {
      e == null && (e = Promise.resolve(Reflect.apply(...n)));
      const r = await e;
      return e = null, r;
    }
  });
}, T = F(U, S), x = () => {
  let t, e;
  const n = new Promise((r, s) => {
    [t, e] = [r, s];
  });
  return { resolve: t, reject: e, pending: n };
};
class A {
  constructor(e) {
    this.next = null, this.value = e;
  }
}
var l, h, c;
class V {
  constructor() {
    a(this, l, null);
    a(this, h, null);
    a(this, c, 0);
  }
  size() {
    return o(this, c);
  }
  clear() {
    i(this, l, null), i(this, h, null), i(this, c, 0);
  }
  shift() {
    const e = o(this, l);
    return o(this, c) && (i(this, l, e.next), w(this, c)._--), o(this, c) || (i(this, l, null), i(this, h, null)), e == null ? void 0 : e.value;
  }
  unshift(e) {
    const n = new A(e);
    o(this, c) ? (n.next = o(this, l), i(this, l, n)) : (i(this, l, n), i(this, h, n)), w(this, c)._++;
  }
  push(e) {
    const n = new A(e);
    o(this, c) ? (o(this, h).next = n, i(this, h, n)) : (i(this, l, n), i(this, h, n)), w(this, c)._++;
  }
}
l = new WeakMap(), h = new WeakMap(), c = new WeakMap();
var I, g, p, m, d;
class O {
  constructor(e) {
    a(this, I, void 0);
    a(this, g, void 0);
    a(this, p, void 0);
    a(this, m, void 0);
    a(this, d, void 0);
    i(this, g, 0), i(this, p, new V()), this.add_task = (r) => new Promise((s, u) => {
      o(this, p).push({
        task: r,
        resolve: s,
        reject: u
      }), o(this, d).call(this);
    }), this.busy = () => o(this, g) === o(this, I), this.clear = () => {
      o(this, p).clear();
    }, i(this, m, () => !this.busy() && o(this, p).size() > 0), i(this, d, () => {
      for (; o(this, m).call(this); ) {
        const { task: r, reject: s, resolve: u } = o(this, p).shift();
        w(this, g)._++, Promise.resolve().then(r).then(u).catch(s).finally(() => {
          w(this, g)._--, o(this, d).call(this);
        });
      }
    });
    const { max_concurrency: n } = e || {};
    i(this, I, n);
  }
}
I = new WeakMap(), g = new WeakMap(), p = new WeakMap(), m = new WeakMap(), d = new WeakMap();
const L = () => typeof Deno < "u" && Deno.version != null, P = () => typeof process < "u" && process.versions != null, z = () => typeof window < "u" && window.document != null, X = () => {
  if (L() || z())
    return navigator.hardwareConcurrency;
  if (P())
    return require("os").cpus().length;
  throw new Error("Un Support Environment");
}, Y = () => {
  if (L() || z()) {
    const t = new URL(E, import.meta.url);
    return new Worker(t, { type: "module" });
  }
  if (P()) {
    const t = new (require("worker_threads")).Worker(
      //@ts-ignore 环境判断函数
      require("path").resolve(__dirname, "./_worker_node.js")
    );
    return t.addEventListener = (e, n) => {
      t.on(e, n);
    }, t;
  }
  throw new Error("Un Support Environment");
}, q = () => {
  const t = Y(), e = { defer: x() };
  return t.addEventListener("message", (r) => {
    const [s, u] = r.data || [];
    s != null ? e.defer.reject(s.msg) : e.defer.resolve(u), e.defer = x();
  }), { worker: t, run: T(async (r, s) => (t.postMessage({
    payload: {
      fn: r.toString(),
      arg: s
    }
  }), await e.defer.pending)) };
};
function M(t) {
  const { max: e = X() - 1 } = t || {}, n = new O({ max_concurrency: e }), r = /* @__PURE__ */ new Map(), s = [], u = () => {
    for (; r.size < e; ) {
      const { size: f } = r;
      r.set(f, q()), s.push(f);
    }
  };
  return {
    exec: (f, B) => (u(), n.add_task(async () => {
      const k = s.pop(), j = await r.get(k).run(f, B);
      return s.push(k), j;
    })),
    terminate: () => {
      for (const { worker: f } of r.values())
        f.terminate();
      r.clear(), s.length = 0, n.clear();
    }
  };
}
export {
  M as worker_pool
};
