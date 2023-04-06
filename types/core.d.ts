export declare function worker_pool(config?: {
    max?: number;
}): {
    exec: <P extends unknown[], R extends unknown>(fn: (...arg: P) => R, arg: P) => Promise<[Error | null, Awaited<Awaited<R>>]>;
    terminate: () => void;
};
