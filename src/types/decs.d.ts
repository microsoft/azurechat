import "valtio"
import { INTERNAL_Snapshot } from "valtio"

type AnyFunction = (...args: unknown[]) => unknown
type AnyArray = readonly unknown[]
type MutableArrays<T> = T extends AnyFunction
  ? T
  : T extends AnyArray
    ? { -readonly [K in keyof T]: MutableArrays<T[K]> }
    : { [K in keyof T]: MutableArrays<T[K]> }

declare module "valtio" {
  function useSnapshot<T extends object>(p: T): MutableArrays<INTERNAL_Snapshot<T>>
}
