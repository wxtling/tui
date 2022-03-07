interface UniDom {
  /**
   * 组件的唯一标示
   */
  id?: string;

  /**
   * vue中组件的唯一标示
   */
  ref?: string;

  /**
   * 组件的样式类
   */
  class?: string | { [x: string]: string };

  /**
   * 组件的内联样式
   */
  style?: string | { [x: string]: string };

  /**
   * 组件是否隐藏
   */
  hidden?: boolean;
}

/**
 * uni-app 按钮
 * @deprecated https://uniapp.dcloud.io/component/button.html
 */
interface UniButton extends UniDom {
  /**
   * 按钮的大小
   * @type {default}  默认大小
   * @type {mini}  小尺寸
   */
  size: 'default' | 'mini';

  /**
   * 按钮的样式类型
   * @type {none}  无样式
   */
  type: 'primary' | 'default' | 'warn' | 'none';

  /**
   * 按钮是否镂空，背景色透明
   */
  plain: boolean;

  /**
   * 	是否禁用
   */
  disabled: boolean;

  /**
   * H5、App(App-nvue 平台，在 ios 上为雪花，Android上为圆圈)
   */
  loading: boolean;

  /**
   * 	用于 <form> 组件，点击分别会触发 <form> 组件的 submit/reset 事件
   * @type {submit} 提交表单
   * @type {reset} 重置表单
   */
  formType: 'submit' | 'reset';

  /**
   * 	开放能力
   * @type {feedback} 	      打开“意见反馈”页面，用户可提交反馈内容并上传日志
   * @type {share} 		        触发用户转发
   * @type {getUserInfo} 		  获取用户信息，可以从@getuserinfo回调中获取到用户信息
   * @type {contact} 		      打开客服会话，如果用户在会话中点击消息卡片后返回应用，可以从 @contact 回调中获得具体信息
   * @type {getPhoneNumber} 	获取用户手机号，可以从@getphonenumber回调中获取到用户信息
   * @type {launchApp} 		    小程序中打开APP，可以通过app-parameter属性设定向APP传的参数 微信小程序、QQ小程序
   * @type {openSetting} 		  打开授权设置页
   * @type {getAuthorize} 	  支持小程序授权
   * @type {contactShare} 	  分享到通讯录好友
   * @type {lifestyle} 		    关注生活号
   * @type {openGroupProfile} 呼起QQ群资料卡页面，可以通过group-id属性设定需要打开的群资料卡的群号，同时manifest中必须配置groupIdList
   */
  openType: 'feedback' | 'share' | 'getUserInfo' | 'contact' | 'getPhoneNumber' | 'launchApp' | 'openSetting' | 'getAuthorize' | 'contactShare' | 'lifestyle' | 'openGroupProfile';

  /**
   * 指定按钮按下去的样式类。当 hover-class="none" 时，没有点击态效果
   */
  hoverClass: string;

  /**
   * 按住后多久出现点击态，单位毫秒
   * 默认：20
   */
  hoverStartTime: number;

  /**
   * 手指松开后点击态保留时间，单位毫秒
   * 默认：70
   */
  hoverStayTime: number;

  /**
   * 	打开 APP 时，向 APP 传递的参数，open-type=launchApp 时有效
   */
  appParameter: string;

  /**
   * 	指定是否阻止本节点的祖先节点出现点击态
   */
  hoverStopPropagation: boolean;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      button: Partial<UniButton>;
    }
  }
}

export {};
