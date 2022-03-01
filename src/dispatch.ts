import {
  ActionHandler,
  ActionObject,
  Action,
  ActionTree,
  Dispatch,
} from "vuex";
import { ExtractNamespace, ExtractProperty, PickNamespace } from "./utils";

type PayloadFromActionHandler<AH extends ActionHandler<never, never>> =
  Parameters<AH>[1];
type PayloadFromActionObject<AO extends ActionObject<never, never>> =
  PayloadFromActionHandler<AO["handler"]>;
type PayloadFromAction<A extends Action<never, never>> =
  A extends ActionHandler<never, never>
    ? PayloadFromActionHandler<A>
    : A extends ActionObject<never, never>
    ? PayloadFromActionObject<A>
    : never;

type ReturnFromActionHandler<AH extends ActionHandler<never, never>> = Promise<
  Awaited<ReturnType<AH>>
>;
type ReturnFromActionObject<AO extends ActionObject<never, never>> =
  ReturnFromActionHandler<AO["handler"]>;
type ReturnFromAction<A extends Action<never, never>> = A extends ActionHandler<
  never,
  never
>
  ? ReturnFromActionHandler<A>
  : A extends ActionObject<never, never>
  ? ReturnFromActionObject<A>
  : never;

type DispatchNamespace<
  AT extends ActionTree<never, never>,
  N extends string
> = Dispatcher<{
  [K in PickNamespace<Extract<keyof AT, string>, N>]: AT[`${N}/${K}`];
}>;

type DispatchProperty<A extends Action<never, never>> =
  (PayloadFromAction<A> extends undefined
    ? { (dispatch: Dispatch): ReturnFromAction<A> }
    : Record<never, never>) & {
    (dispatch: Dispatch, payload: PayloadFromAction<A>): ReturnFromAction<A>;
  };

export type Dispatcher<AT extends ActionTree<never, never>> = {
  [N in ExtractNamespace<Extract<keyof AT, string>>]: DispatchNamespace<AT, N>;
} & {
  [P in ExtractProperty<Extract<keyof AT, string>>]: DispatchProperty<AT[P]>;
};

export const dispatcher = <AT extends ActionTree<never, never>>(
  namespace?: string
): Dispatcher<AT> =>
  new Proxy(
    { namespace },
    {
      get(target, property) {
        if (typeof property !== "string") return undefined;
        const nextNamespace = target.namespace
          ? `${target.namespace}/${property}`
          : property;
        return dispatcher(nextNamespace);
      },
      apply(target, thisArg, argArray: [Dispatch, unknown]) {
        return argArray[0](target.namespace ?? "", argArray[1], { root: true });
      },
    }
  ) as unknown as Dispatcher<AT>;
