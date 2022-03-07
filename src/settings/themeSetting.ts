export type ThemeType = 'light' | 'dark';

export interface Theme {
  [x: string]: string;
}

export const config: { [x in ThemeType]: Theme } = {
  light: {
    'xt-color-primary': '#1677ff',
    'xt-color-success': '#00b578',
    'xt-color-warning': '#ff8f1f',
    'xt-color-danger': '#ff3141',
    'xt-color-white': '#ffffff',
    'xt-color-weak': '#999999',
    'xt-color-light': '#cccccc',
    'xt-border-color': '#eeeeee',
    'xt-color-text': '#333333',
  },
  dark: {},
};

export const defaultTheme: ThemeType = 'light';
