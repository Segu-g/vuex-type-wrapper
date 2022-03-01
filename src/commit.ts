import { Mutation, MutationTree, Commit } from "vuex";
import { ExtractNamespace, ExtractProperty, PickNamespace } from "./utils";

type PayloadFromMutation<M extends Mutation<never>> = Parameters<M>[1];

type CommitterNamespace<
  MT extends MutationTree<never>,
  N extends string
> = Committer<{
  [K in PickNamespace<Extract<keyof MT, string>, N>]: MT[`${N}/${K}`];
}>;

type CommitterProperty<M extends Mutation<never>> =
  (PayloadFromMutation<M> extends undefined
    ? { (Committ: Commit): void }
    : Record<never, never>) & {
    (Committ: Commit, payload: PayloadFromMutation<M>): void;
  };

export type Committer<MT extends MutationTree<never>> = {
  [N in ExtractNamespace<Extract<keyof MT, string>>]: CommitterNamespace<MT, N>;
} & {
  [P in ExtractProperty<Extract<keyof MT, string>>]: CommitterProperty<MT[P]>;
};

export const committer = <MT extends MutationTree<never>>(
  namespace?: string
): Committer<MT> =>
  new Proxy(
    { namespace },
    {
      get(target, property) {
        if (typeof property !== "string") return undefined;
        const nextNamespace = target.namespace
          ? `${target.namespace}/${property}`
          : property;
        return committer(nextNamespace);
      },
      apply(target, thisArg, argArray: [Commit, unknown]) {
        return argArray[0](target.namespace ?? "", argArray[1], { root: true });
      },
    }
  ) as unknown as Committer<MT>;
