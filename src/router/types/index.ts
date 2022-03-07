export interface TabBarListItemTypes {
  /** 页面路径 */
  pagePath: string;

  /** tab 上按钮文字 */
  text: string;

  /** 图片路径，icon 大小限制为40kb，建议尺寸为 81px * 81px 不是自定义的情况下，不支持网络图片 */
  iconPath?: string;

  /** 选中时的图片路径 */
  selectedIconPath?: string;
}

/**
 * tabBar 配置项指定一级导航栏 以及 tab 切换时显示的对应页
 */
export interface TabBarTypes {
  /**  tab 上的文字默认颜色 */
  color: string;

  /**  tab 上的文字选中时的颜色 */
  selectedColor: string;

  /**  tab 的背景色 */
  backgroundColor: string;

  /** tabbar 上边框的颜色，可选值 black/white */
  borderStyle?: 'black' | 'white';

  /** tab 的列表，最少2个、最多5个 tab */
  list: TabBarListItemTypes[];

  /** 自定义 tabBar  默认值 false */
  custom?: boolean;
}

/**
 * 用于设置应用的状态栏、导航条、标题、窗口背景色等。
 */
export interface GlobalStyle {
  /**
   * 导航栏背景颜色（同状态栏背景色）
   */
  navigationBarBackgroundColor?: string;

  /**
   * 导航栏标题颜色及状态栏前景颜色，仅支持 black/white
   */
  navigationBarTextStyle?: 'black' | 'white';

  /**
   * 导航栏标题文字内容
   */
  navigationBarTitleText?: string;

  /**
   * 导航栏样式
   */
  navigationStyle?: 'default' | 'custom';

  /**
   * 窗口的背景色
   * 微信小程序
   */
  backgroundColor?: string;

  /**
   * 下拉 loading 的样式
   * 微信小程序
   */
  backgroundTextStyle?: 'dark' | 'light';

  /**
   * 是否开启下拉刷新
   */
  enablePullDownRefresh?: boolean;

  /**
   * 页面上拉触底事件触发时距页面底部距离，单位只支持px
   */
  onReachBottomDistance?: number;

  /**
   * 顶部窗口的背景色（bounce回弹区域）
   * 仅 iOS 平台
   */
  backgroundColorTop?: string;

  /**
   * 顶部窗口的背景色（bounce回弹区域）
   * 仅 iOS 平台
   */
  backgroundColorBottom?: string;
}

/**
 * 配置项列表
 * 其他请参考 ，自行添加
 * https://uniapp.dcloud.io/collocation/pages?id=%e9%85%8d%e7%bd%ae%e9%a1%b9%e5%88%97%e8%a1%a8
 */
export interface ConfigTypes {
  /** 设置默认页面的窗口表现 */
  globalStyle?: GlobalStyle;

  /** 底部 tab 栏的表现 */
  tabBar?: TabBarTypes;

  /** 启动模式配置，仅开发期间生效，用于模拟直达页面的场景 */
  condition?: {
    /**
     * 当前激活的模式，list节点的索引值
     */
    current: number;

    list: {
      /**
       * 启动模式名称
       */
      name: string;

      /**
       * 启动页面路径
       */
      path: string;

      /**
       * 启动参数，可在页面的 onLoad 函数里获得
       */
      query: string;
    }[];
  };

  easycom?: {
    autoscan: boolean;
    custom: {
      [x: string]: string;
    };
  };
}

/**
 * 配置页面窗口表现
 * 其他请参考，自行添加
 * https://uniapp.dcloud.io/collocation/pages?id=style
 */
export interface PageModuleTypes {
  /** 配置页面路径 */
  path: string;

  /** 路由别名 请保持唯一性 用于跳转页面 */
  name: string;

  /**
   * 导航栏背景颜色（同状态栏背景色），如"#000000"
   */
  navigationBarBackgroundColor?: string;

  /**
   * 导航栏标题颜色及状态栏前景颜色，仅支持 black/white
   */
  navigationBarTextStyle?: 'black' | 'white';

  /**
   * 导航栏标题文字内容
   */
  navigationBarTitleText: string;

  /**
   * 导航栏阴影，配置参考下方
   */
  navigationBarShadow?: {
    colorType: 'grey' | 'blue' | 'green' | 'orange' | 'red' | 'yellow';
  };

  /**
   * 导航栏样式
   */
  navigationStyle?: 'default' | 'custom';

  /**
   * 设置为 true 则页面整体不能上下滚动（bounce效果）
   */
  disableScroll?: boolean;

  /**
   * 窗口的背景色
   */
  backgroundColor?: string;

  /**
   * 下拉 loading 的样式
   */
  backgroundTextStyle?: 'dark' | 'light';

  /**
   * 是否开启下拉刷新
   */
  enablePullDownRefresh?: boolean;

  /**
   * 页面上拉触底事件触发时距页面底部距离，单位只支持px
   */
  onReachBottomDistance?: number;

  /**
   * 顶部窗口的背景色（bounce回弹区域）
   * 仅 iOS 平台
   */
  backgroundColorTop?: string;

  /**
   * 顶部窗口的背景色（bounce回弹区域）
   * 仅 iOS 平台
   */
  backgroundColorBottom?: string;

  /**
   * 子页面
   */
  children?: PageModuleTypes[];
}

/**
 * 页面参数
 */
export interface QueryType {
  [x: string]: object | string | number | boolean;
}

/**
 * navigateTo
 * 其他参数
 */
export interface Options {
  /**
   * 页面间通信接口，用于监听被打开页面发送到当前页面的数据
   */
  [x: string]: object | undefined | boolean | number | string | ((...abc: any) => void);

  /**
   * App
   * 窗口显示的动画类型
   * - auto: 自动选择动画效果
   * - none: 无动画效果
   * - slide-in-right: 从右侧横向滑动效果
   * - slide-in-left: 左侧横向滑动效果
   * - slide-in-top: 从上侧竖向滑动效果
   * - slide-in-bottom: 从下侧竖向滑动效果
   * - fade-in: 从透明到不透明逐渐显示效果
   * - zoom-out: 从小到大逐渐放大显示效果
   * - zoom-fade-out: 从小到大逐渐放大并且从透明到不透明逐渐显示效果
   * - pop-in: 从右侧平移入栈动画效果
   */
  animationType?: 'auto' | 'none' | 'slide-in-right' | 'slide-in-left' | 'slide-in-top' | 'slide-in-bottom' | 'fade-in' | 'zoom-out' | 'zoom-fade-out' | 'pop-in';

  /**
   * App
   * 窗口动画持续时间，单位为 ms
   */
  animationDuration?: number;
}
