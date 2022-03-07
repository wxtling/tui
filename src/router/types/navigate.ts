import type { PageKeys } from './pages';
import type { CropImg } from './nav';
/**
 * 定义
 * 保留当前页面，跳转到应用内的某个页面
 */
export interface NavigateTo {
  // 图片裁剪
  (name: PageKeys['cropImg'], options: CropImg, delivery?: 'implicit'): Promise<any>;
}

/**
 * 定义
 * 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
 */
export interface SwitchTab {
  //首页
  (name: PageKeys['home']): Promise<any>;

  // 我的
  (name: PageKeys['mine']): Promise<any>;
}

/**
 * 定义
 * 关闭当前页面，跳转到应用内的某个页面
 */
export interface RedirectTo {}

/**
 * 定义
 * 关闭所有页面，打开到应用内的某个页面。
 */
export interface ReLaunch {}
