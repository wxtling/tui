/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.wxs' {
  const component: any;
  export default component;
}

declare module '*.json' {
  const json: any;
  export default json;
}


declare module '*.js' {
  const js: any;
  export default js;
}
