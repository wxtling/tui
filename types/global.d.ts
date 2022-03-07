import type { ComputedRef, Ref } from 'vue';

declare global {
  declare type Nullable<T> = T | null;

  declare type Recordable<T = any> = Record<string, T>;

  declare type DynamicProps<T> = {
    [P in keyof T]: Ref<T[P]> | T[P] | ComputedRef<T[P]>;
  };

  declare interface Fn<T = any, R = T> {
    (...arg: T[]): R;
  }

  declare interface TempFile {
    path: string;
    size: number;
    name?: string;
  }
}

export {};
