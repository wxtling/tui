/** 
 * 页面定义 
 * 请不要修改此文件 
 * @param home 首页
 * @param mine 我的
 * @param cropImg 图片裁剪
 */
type PageKeys = {  
  home: 'home',
  mine: 'mine',
  cropImg: 'cropImg',
};

enum Pages { 
  home = 'pages/base/home/main',
  mine = 'pages/base/mine/main',
  cropImg = 'pages/public/crop/main',
};
type PagesType = keyof typeof Pages; 
export { Pages, PageKeys, PagesType }; 
