/**
 * 图片裁剪
 */
export type CropImg = {
  /**
   * 图片路径
   */
  imageUrl: string;

  /**
   * 图片的质量，取值范围为 0 ~ 1，不在范围内时当作1处理
   * 默认值:1
   */
  quality?: number;

  /**
   * 裁剪框宽度，单位为 rpx
   * 默认值 400
   */
  width?: number;

  /**
   * 裁剪框高度
   * 默认值 400
   */
  height?: number;

  /**
   * 裁剪框最小宽度
   * 默认值 200
   */
  minWidth?: number;

  /**
   * 裁剪框最小高度
   * 默认值 200
   */
  minHeight?: number;

  /**
   * 裁剪框最大宽度
   * 默认值 600
   */
  maxWidth?: number;

  /**
   * 裁剪框最大宽度
   * 默认值 600
   */
  maxHeight?: number;

  /**
   * 图片最小缩放比
   * 默认值 0.5
   */
  minRatio?: number;

  /**
   * 图片最大缩放比
   * 默认值 2
   */
  maxRatio?: number;

  /**
   * 旋转按钮每次旋转的角度
   * 默认值 90
   */
  rotateAngle?: number;

  /**
   * 生成图片相对于裁剪框的比例， 比例越高生成图片越清晰
   * 默认值 1
   */
  scaleRatio?: number;

  /**
   * 是否锁定裁剪框宽度
   * 默认值 false
   */
  isLockWidth?: boolean;

  /**
   * 是否锁定裁剪框高度上
   * 默认值 false
   */
  isLockHeight?: boolean;

  /**
   * 是否锁定裁剪框比例
   * 默认值 true
   */
  isLockRatio?: boolean;

  /**
   * 是否禁止缩放
   * 默认值 false
   */
  isDisableScale?: boolean;

  /**
   * 是否禁止旋转
   * 默认值 false
   */
  isDisableRotate?: boolean;

  /**
   * 是否限制移动范围
   * 默认值 true
   */
  isLimitMove?: boolean;

  /**
   * 是否显示选择图片按钮
   * 默认值 true
   */
  isShowPhotoBtn?: boolean;

  /**
   * 是否显示转按钮
   * 默认值 true
   */
  isShowRotateBtn?: boolean;

  /**
   *  从相册选图
   */
  source_album?: boolean;

  /**
   * 使用相机
   */
  source_camera?: boolean;

  /**
   * 生成图片成功
   */
  onSuccess?: (res: { width: number; height: number; url: string }) => void;

  /**
   * 生成图片失败
   */
  onFail?: (error: string) => void;

  /**
   * 图片加载完成
   */
  onReady?: () => void;

  /**
   * cancel
   */
  onCancel?: () => void;
};

export type NavOptions = {
  CropImg: CropImg;
};

export type GetNavOptions<T extends keyof NavOptions> = NavOptions[T];

export type NavResOptionsGet<T extends keyof NavOptions> = {
  (key: keyof GetNavOptions<T>): undefined;
  (key: keyof GetNavOptions<T>, value: string): string;
  (key: keyof GetNavOptions<T>, value: number): number;
  (key: keyof GetNavOptions<T>, value: boolean): boolean;
  (key: keyof GetNavOptions<T>, value: object): object;
};

export type NavResOptions<T extends keyof NavOptions> = GetNavOptions<T> & {
  get: NavResOptionsGet<T>;
};
