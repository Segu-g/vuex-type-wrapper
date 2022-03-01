export type AddNamespace<T extends Record<string, never>, N extends string> = {
  [K in keyof T as `${N}/${K & string}`]: T[K];
};

export type ExtractNamespace<K extends string> =
  K extends `${infer N}/${string}` ? N : never;
export type ExtractProperty<K extends string> = K extends `${string}/${string}`
  ? never
  : K;
export type PickNamespace<
  K extends string,
  N extends string
> = K extends `${N}/${infer P}` ? P : never;
