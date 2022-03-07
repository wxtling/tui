import { ConfigTypes } from './types/index';

const config: ConfigTypes = {
  globalStyle: {
    navigationBarTextStyle: 'black',
    navigationBarBackgroundColor: '#fff',
    backgroundColor: '#fff',
  },
  tabBar: {
    color: '#999',
    selectedColor: '#000',
    backgroundColor: '#fff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/base/home/main',
        text: '首页',
      },
      {
        pagePath: 'pages/base/mine/main',
        text: '我的',
      },
    ],
  },
  easycom: {
    autoscan: true,
    custom: {
      '^BasicForm': '@/components/TForm/BasicForm.vue',
      '^Tui-(.*)': '@/components/$1/index.vue',
    },
  },
};

export default config;
