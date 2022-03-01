import { Getter, GetterTree } from "vuex";
import { ExtractNamespace, ExtractProperty, PickNamespace } from "./utils";

type ReturnFromGetter<G extends Getter<never, never>> = Parameters<G>[1];

type GetterHelperNamespace<
  GT extends GetterTree<never, never>,
  N extends string
> = GetterHelper<{
  [K in PickNamespace<Extract<keyof GT, string>, N>]: GT[`${N}/${K}`];
}>;

type GetterHelperProperty<G extends Getter<never, never>> = {
  (rootGetters: unknown): ReturnFromGetter<G>;
};

export type GetterHelper<GT extends GetterTree<never, never>> = {
  [N in ExtractNamespace<Extract<keyof GT, string>>]: GetterHelperNamespace<
    GT,
    N
  >;
} & {
  [P in ExtractProperty<Extract<keyof GT, string>>]: GetterHelperProperty<
    GT[P]
  >;
};

export const getterHelper = <GT extends GetterTree<never, never>>(
  namespace?: string
): GetterHelper<GT> =>
  new Proxy(
    { namespace },
    {
      get(target, property) {
        if (typeof property !== "string") return undefined;
        const nextNamespace = target.namespace
          ? `${target.namespace}/${property}`
          : property;
        return getterHelper(nextNamespace);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apply(target, thisArg, [rootGetters]: [any]) {
        return rootGetters[target.namespace];
      },
    }
  ) as unknown as GetterHelper<GT>;
