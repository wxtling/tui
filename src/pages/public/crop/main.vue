<template>
  <view class="body" disable-scroll>
    <view
      class="lime-clipper-mask"
      @touchstart.stop.prevent="clipTouchStart"
      @touchmove.stop.prevent="clipTouchMove"
      @touchend.stop.prevent="clipTouchEnd"
    >
      <view class="lime-clipper-content" :style="clipStyle">
        <view class="lime-clipper-edge" v-for="(item, index) in [0, 0, 0, 0]" :key="index" />
      </view>
    </view>

    <image
      class="lime-clipper-image"
      mode="scaleToFill"
      @error="imageLoad"
      @load="imageLoad"
      @touchstart="imageTouchStart"
      @touchmove="imageTouchMove"
      @touchend="imageTouchEnd"
      :style="imageStyle"
      :src="options.image"
      v-if="options.image"
    />

    <canvas
      :canvas-id="canvasId"
      :id="canvasId"
      disable-scroll
      :style="canvasStyle"
      class="lime-clipper-canvas"
    />

    <TFooter :isStation="false">
      <view class="footer">
        <view class="but-box">
          <TButtonIcon size="98rpx" icon="mdi:close" color="#fff" @click="cancel" />
        </view>
        <view class="but-box" v-if="options.isShowPhotoBtn">
          <TButtonIcon size="98rpx" icon="ph:image" color="#fff" @click="uploadImage" />
        </view>
        <view class="but-box" v-if="options.isShowRotateBtn">
          <TButtonIcon
            size="98rpx"
            icon="ant-design:rotate-left-outlined"
            color="#fff"
            @click="rotate"
          />
        </view>
        <view class="but-box">
          <TButtonIcon size="98rpx" icon="mdi:check" color="#fff" @click="confirm" />
        </view>
      </view>
    </TFooter>
  </view>
</template>

<script lang="ts" setup>
  /**
   * CropImg  图片裁剪
   * 参考
   * https://limeui.qcoon.cn/#/clipper
   */

  import {
    nextTick,
    isRef,
    watch,
    toRefs,
    reactive,
    computed,
    getCurrentInstance,
    toRaw,
  } from 'vue';
  import { onLoad, navigateBack } from '@/router';
  import { useI18n } from '@/locales';
  import TFooter from '@/components/TFooter/index.vue';
  import TButtonIcon from '@/components/TButton/Icon.vue';

  const { t } = useI18n();
  const cache: any = {};
  const canvasId = 'tui-clipper';
  const proxy = getCurrentInstance()?.proxy;
  const sysinfo = uni.getSystemInfoSync();

  let options = reactive({
    imageUrl: '',
    quality: 1,
    width: 600,
    height: 600,
    minWidth: 200,
    minHeight: 200,
    maxWidth: 600,
    maxHeight: 600,
    minRatio: 0.5,
    maxRatio: 2,
    rotateAngle: 90,
    scaleRatio: 1,
    isLockWidth: false,
    isLockHeight: false,
    isLockRatio: true,
    isDisableScale: false,
    isDisableRotate: false,
    isLimitMove: true,
    isShowPhotoBtn: true,
    isShowRotateBtn: true,
    source_album: true,
    source_camera: true,
    onSuccess: (() => {}) as (res: { width: number; height: number; url: string }) => void,
    onFail: (() => {}) as (error: string) => void,
    onReady: (() => {}) as (res: any) => void,
    onCancel: () => {},

    clipX: 0,
    clipY: 0,
    image: '',
    clipWidth: 0,
    clipHeight: 0,
    animation: false,
    imageWidth: 0,
    imageHeight: 0,
    imageTop: 0,
    imageLeft: 0,
    scale: 1,
    angle: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    timeClipCenter: null as unknown as NodeJS.Timeout,
    animationTimer: null as unknown as NodeJS.Timeout,
    throttleFlag: true,
    flagClipTouch: false,
    flagEndTouch: false,
    touchRelative: [{ x: 0, y: 0 }],
    hypotenuseLength: 0,

    ctx: null as any,

    clipStart: {} as {
      width: number;
      height: number;
      x: number;
      y: number;
      clipY: number;
      clipX: number;
      corner: number;
    },
  });

  const optionsRefs = toRefs(options);

  /**
   * 设置数据
   * @param data
   */
  function setDiffData(data: Partial<typeof options>) {
    Object.keys(data).forEach((keys) => {
      let key: keyof typeof options = keys as any;
      let val = isRef(data[key]) ? toRaw(data[key].value) : data[key];
      if (optionsRefs[key].value !== val) {
        optionsRefs[key].value = val;
      }
    });
  }

  /**
   * 查询数据
   */
  function getOptions() {
    let obj: any = {};
    Object.keys(optionsRefs).forEach((keys) => {
      let key: keyof typeof options = keys as any;
      obj[key] = toRaw(optionsRefs[key].value);
    });
    return obj as typeof options;
  }
  function getOption<T = number>(key: keyof typeof options) {
    return toRaw<T>(optionsRefs[key].value);
  }

  /**
   * 计算图片尺寸
   */
  function calcImageSize(width: number, height: number, data: typeof options) {
    let imageWidth = width,
      imageHeight = height;
    let { clipWidth, clipHeight, width: originWidth, height: originHeight } = data;
    if (imageWidth && imageHeight) {
      if (imageWidth / imageHeight > (clipWidth || originWidth) / (clipWidth || originHeight)) {
        imageHeight = clipHeight || originHeight;
        imageWidth = (width / height) * imageHeight;
      } else {
        imageWidth = clipWidth || originWidth;
        imageHeight = (height / width) * imageWidth;
      }
    } else {
      imageWidth = sysinfo.windowWidth;
      imageHeight = 0;
    }
    return {
      imageWidth,
      imageHeight,
    };
  }

  /**
   * 图片边缘检测时，计算图片缩放比例
   */
  function calcImageScale(data: typeof options, scale?: number) {
    scale = scale || data.scale;
    let { imageWidth, imageHeight, clipWidth, clipHeight, angle } = data;
    if ((angle / 90) % 2) {
      imageWidth = imageHeight;
      imageHeight = imageWidth;
    }
    if (imageWidth * scale < clipWidth) {
      scale = clipWidth / imageWidth;
    }
    if (imageHeight * scale < clipHeight) {
      scale = Math.max(scale, clipHeight / imageHeight);
    }
    return scale;
  }

  /**
   * 图片边缘检测检测时，计算图片偏移量
   */
  function calcImageOffset(data: typeof options, scale?: number) {
    let left = data.imageLeft;
    let top = data.imageTop;
    scale = scale || data.scale;

    let imageWidth = data.imageWidth;
    let imageHeight = data.imageHeight;
    if ((data.angle / 90) % 2) {
      imageWidth = data.imageHeight;
      imageHeight = data.imageWidth;
    }
    const { clipX, clipWidth, clipY, clipHeight } = data;

    // 当前图片宽度/高度
    const currentImageSize = (size: number) => (size * (scale as number)) / 2;
    const currentImageWidth = currentImageSize(imageWidth);
    const currentImageHeight = currentImageSize(imageHeight);

    left = clipX + currentImageWidth >= left ? left : clipX + currentImageWidth;
    left =
      clipX + clipWidth - currentImageWidth <= left ? left : clipX + clipWidth - currentImageWidth;
    top = clipY + currentImageHeight >= top ? top : clipY + currentImageHeight;
    top =
      clipY + clipHeight - currentImageHeight <= top
        ? top
        : clipY + clipHeight - currentImageHeight;
    return {
      left,
      top,
      scale,
    };
  }

  /**
   * 判断手指触摸位置
   */
  function determineDirection(
    clipX: number,
    clipY: number,
    clipWidth: number,
    clipHeight: number,
    currentX: number,
    currentY: number,
  ) {
    /*
     * (右下>>1 右上>>2 左上>>3 左下>>4)
     */
    let corner;
    /**
     * 思路：（利用直角坐标系）
     *  1.找出裁剪框中心点
     *  2.如点击坐标在上方点与左方点区域内，则点击为左上角
     *  3.如点击坐标在下方点与右方点区域内，则点击为右下角
     *  4.其他角同理
     */
    const mainPoint = [clipX + clipWidth / 2, clipY + clipHeight / 2]; // 中心点
    const currentPoint = [currentX, currentY]; // 触摸点

    if (currentPoint[0] <= mainPoint[0] && currentPoint[1] <= mainPoint[1]) {
      corner = 3; // 左上
    } else if (currentPoint[0] >= mainPoint[0] && currentPoint[1] <= mainPoint[1]) {
      corner = 2; // 右上
    } else if (currentPoint[0] <= mainPoint[0] && currentPoint[1] >= mainPoint[1]) {
      corner = 4; // 左下
    } else if (currentPoint[0] >= mainPoint[0] && currentPoint[1] >= mainPoint[1]) {
      corner = 1; // 右下
    }

    return corner;
  }

  /**
   * 拖动裁剪框时计算
   */
  function clipTouchMoveOfCalculate(data: typeof options, event: any) {
    const clientX = event.touches[0].clientX;
    const clientY = event.touches[0].clientY;

    let {
      clipWidth,
      clipHeight,
      clipY: oldClipY,
      clipX: oldClipX,
      clipStart,
      isLockRatio,
      maxWidth,
      minWidth,
      maxHeight,
      minHeight,
    } = data;
    maxWidth = maxWidth / 2;
    minWidth = minWidth / 2;
    minHeight = minHeight / 2;
    maxHeight = maxHeight / 2;

    let width = clipWidth,
      height = clipHeight,
      clipY = oldClipY,
      clipX = oldClipX,
      // 获取裁剪框实际宽度/高度
      // 如果大于最大值则使用最大值
      // 如果小于最小值则使用最小值
      sizecorrect = () => {
        width = width <= maxWidth ? (width >= minWidth ? width : minWidth) : maxWidth;
        height = height <= maxHeight ? (height >= minHeight ? height : minHeight) : maxHeight;
      },
      sizeinspect = () => {
        if (
          (width > maxWidth || width < minWidth || height > maxHeight || height < minHeight) &&
          isLockRatio
        ) {
          sizecorrect();
          return false;
        } else {
          sizecorrect();
          return true;
        }
      };
    height =
      clipStart.height +
      (clipStart.corner > 1 && clipStart.corner < 4 ? 1 : -1) * (clipStart.y - clientY);
    switch (clipStart.corner) {
      case 1:
        width = clipStart.width - clipStart.x + clientX;
        if (isLockRatio) {
          height = width / (clipWidth / clipHeight);
        }
        if (!sizeinspect()) return;
        break;
      case 2:
        width = clipStart.width - clipStart.x + clientX;
        if (isLockRatio) {
          height = width / (clipWidth / clipHeight);
        }
        if (!sizeinspect()) {
          return;
        } else {
          clipY = clipStart.clipY - (height - clipStart.height);
        }

        break;
      case 3:
        width = clipStart.width + clipStart.x - clientX;
        if (isLockRatio) {
          height = width / (clipWidth / clipHeight);
        }
        if (!sizeinspect()) {
          return;
        } else {
          clipY = clipStart.clipY - (height - clipStart.height);
          clipX = clipStart.clipX - (width - clipStart.width);
        }

        break;
      case 4:
        width = clipStart.width + clipStart.x - clientX;
        if (isLockRatio) {
          height = width / (clipWidth / clipHeight);
        }
        if (!sizeinspect()) {
          return;
        } else {
          clipX = clipStart.clipX - (width - clipStart.width);
        }
        break;
      default:
        break;
    }
    return {
      width,
      height,
      clipX,
      clipY,
    };
  }

  /**
   * 勾股定理求斜边
   */
  function calcPythagoreanTheorem(width: number, height: number) {
    return Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
  }

  /**
   * 单指拖动图片计算偏移
   */
  function imageTouchMoveOfCalcOffset(
    touchRelative: any,
    clientXForLeft: number,
    clientYForLeft: number,
  ) {
    let left = clientXForLeft - touchRelative[0].x,
      top = clientYForLeft - touchRelative[0].y;
    return {
      left,
      top,
    };
  }

  const clipStyle = computed(() => {
    const { clipWidth, clipHeight, clipY, clipX, animation } = getOptions();
    return {
      top: clipY + 'px',
      left: clipX + 'px',
      width: clipWidth + 'px',
      height: clipHeight + 'px',
      transitionProperty: animation ? '' : 'background',
    };
  });
  const imageStyle = computed(() => {
    const { imageWidth, imageHeight, imageLeft, imageTop, animation, scale, angle } = getOptions();
    return {
      width: imageWidth ? imageWidth + 'px' : 'auto',
      height: imageHeight ? imageHeight + 'px' : 'auto',
      transform: `translate3d(${imageLeft - imageWidth / 2}px, ${
        imageTop - imageHeight / 2
      }px, 0) scale(${scale}) rotate(${angle}deg)`,
      transitionDuration: (animation ? 0.35 : 0) + 's',
    };
  });
  const canvasStyle = computed(() => {
    const { canvasWidth, canvasHeight, scaleRatio } = getOptions();
    return {
      width: canvasWidth * scaleRatio + 'px',
      height: canvasHeight * scaleRatio + 'px',
    };
  });

  function setClipInfo() {
    const { width, height } = getOptions();
    const clipWidth = width / 2;
    const clipHeight = height / 2;
    setDiffData({
      clipWidth,
      clipHeight,
      clipY: (sysinfo.windowHeight - clipHeight) / 2,
      clipX: (sysinfo.windowWidth - clipWidth) / 2,
      imageTop: sysinfo.windowHeight / 2,
      imageLeft: sysinfo.windowWidth / 2,
      canvasHeight: clipHeight,
      canvasWidth: clipWidth,
      ctx: uni.createCanvasContext(canvasId, proxy),
    });
  }
  function setClipCenter() {
    const { clipX, clipY, clipHeight, clipWidth, imageTop, imageLeft } = getOptions();
    const y = (sysinfo.windowHeight - clipHeight) * 0.5;
    const x = (sysinfo.windowWidth - clipWidth) * 0.5;
    setDiffData({
      clipY: y,
      clipX: x,
      imageTop: imageTop - clipY + y,
      imageLeft: imageLeft - clipX + x,
    });
  }
  function calcClipSize() {
    const { clipHeight, clipWidth, clipX, clipY } = getOptions();
    if (clipWidth > sysinfo.windowWidth) {
      setDiffData({
        clipWidth: sysinfo.windowWidth,
      });
    } else if (clipWidth + clipX > sysinfo.windowWidth) {
      setDiffData({
        clipX: sysinfo.windowWidth - clipX,
      });
    }
    if (clipHeight > sysinfo.windowHeight) {
      setDiffData({
        clipHeight: sysinfo.windowHeight,
      });
    } else if (clipHeight + clipY > sysinfo.windowHeight) {
      setDiffData({
        clipY: sysinfo.windowHeight - clipY,
      });
    }
  }
  function cutDetectionPosition() {
    const { clipX, clipY, clipHeight, clipWidth } = getOptions();
    let cutDetectionPositionTop = () => {
        if (clipY < 0) {
          setDiffData({ clipY: 0 });
        }
        if (clipY > sysinfo.windowHeight - clipHeight) {
          setDiffData({ clipY: sysinfo.windowHeight - clipHeight });
        }
      },
      cutDetectionPositionLeft = () => {
        if (clipX < 0) {
          setDiffData({ clipX: 0 });
        }
        if (clipX > sysinfo.windowWidth - clipWidth) {
          setDiffData({ clipX: sysinfo.windowWidth - clipWidth });
        }
      };
    if (clipY === null && clipX === null) {
      let newClipY = (sysinfo.windowHeight - clipHeight) * 0.5;
      let newClipX = (sysinfo.windowWidth - clipWidth) * 0.5;
      setDiffData({
        clipX: newClipX,
        clipY: newClipY,
      });
    } else if (clipY !== null && clipX !== null) {
      cutDetectionPositionTop();
      cutDetectionPositionLeft();
    } else if (clipY !== null && clipX === null) {
      cutDetectionPositionTop();
      setDiffData({
        clipX: (sysinfo.windowWidth - clipWidth) / 2,
      });
    } else if (clipY === null && clipX !== null) {
      cutDetectionPositionLeft();
      setDiffData({
        clipY: (sysinfo.windowHeight - clipHeight) / 2,
      });
    }
  }

  function imgMarginDetectionPosition(scale?: number) {
    if (!getOption<boolean>('isLimitMove')) return;
    const { scale: currentScale, left, top } = calcImageOffset(getOptions(), scale);
    setDiffData({
      imageLeft: left,
      imageTop: top,
      scale: currentScale,
    });
  }

  function imgMarginDetectionScale(scale?: number) {
    if (!getOption<boolean>('isLimitMove')) return;
    imgMarginDetectionPosition(calcImageScale(getOptions(), scale));
  }

  function imgComputeSize(width: number, height: number) {
    const { imageWidth, imageHeight } = calcImageSize(width, height, getOptions());
    setDiffData({
      imageWidth,
      imageHeight,
    });
  }

  function getImageInfo(url: string) {
    if (!url) return;
    uni.showLoading({
      title: t('public.crop.loading'),
      mask: true,
    });
    uni.getImageInfo({
      src: url,
      success: (res) => {
        imgComputeSize(res.width, res.height);
        if (getOption<boolean>('isLimitMove')) {
          imgMarginDetectionScale();
          optionsRefs.onReady.value(res);
        }
        const {
          imageWidth,
          imageHeight,
          imageLeft,
          imageTop,
          scale,
          clipX,
          clipY,
          clipWidth,
          clipHeight,
        } = getOptions();
        cache[url] = Object.assign(res, {
          imageWidth,
          imageHeight,
          imageLeft,
          imageTop,
          scale,
          clipX,
          clipY,
          clipWidth,
          clipHeight,
        });
      },
      fail: (err) => {
        imgComputeSize(0, 0);
        if (getOption<boolean>('isLimitMove')) {
          imgMarginDetectionScale();
        }
        optionsRefs.onFail.value(err);
      },
    });
  }

  function throttle() {
    setDiffData({
      throttleFlag: true,
    });
  }

  function moveDuring() {
    clearTimeout(getOption('timeClipCenter'));
  }

  function moveStop() {
    clearTimeout(getOption('timeClipCenter'));
    const timeClipCenter = setTimeout(() => {
      if (!getOption<boolean>('animation')) {
        setDiffData({ animation: true });
      }
      setClipCenter();
    }, 800);
    setDiffData({ timeClipCenter });
  }

  function InImage() {
    if (!getOption('image')) {
      uni.showToast({
        title: t('public.crop.selectImage'),
        icon: 'none',
      });
      return true;
    }
  }

  function clipTouchStart(event: any) {
    // #ifdef H5
    event.preventDefault();
    // #endif
    if (InImage()) return;
    const currentX = event.touches[0].clientX;
    const currentY = event.touches[0].clientY;
    const { clipX, clipY, clipWidth, clipHeight } = getOptions();
    const corner = determineDirection(clipX, clipY, clipWidth, clipHeight, currentX, currentY);
    moveDuring();
    if (!corner) {
      return;
    }
    setDiffData({
      clipStart: {
        width: clipWidth,
        height: clipHeight,
        x: currentX,
        y: currentY,
        clipY,
        clipX,
        corner,
      },
      flagClipTouch: true,
      flagEndTouch: true,
    });
  }

  function clipTouchMove(event: any) {
    // #ifdef H5
    event.stopPropagation();
    event.preventDefault();
    // #endif
    if (InImage()) return;
    // 只针对单指点击做处理
    if (event.touches.length !== 1) {
      return;
    }
    const { flagClipTouch, throttleFlag, isLockRatio, isLockHeight, isLockWidth } = getOptions();
    if (flagClipTouch && throttleFlag) {
      if (isLockRatio && (isLockWidth || isLockHeight)) return;
      setDiffData({
        throttleFlag: false,
      });
      throttle();
      const clipData = clipTouchMoveOfCalculate(getOptions(), event);
      if (clipData) {
        const { width, height, clipX, clipY } = clipData;
        if (!isLockWidth && !isLockHeight) {
          setDiffData({
            clipWidth: width,
            clipHeight: height,
            clipX,
            clipY,
          });
        } else if (!isLockWidth) {
          setDiffData({
            clipWidth: width,
            clipX,
          });
        } else if (!isLockHeight) {
          setDiffData({
            clipHeight: height,
            clipY,
          });
        }
        imgMarginDetectionScale();
      }
    }
  }

  function clipTouchEnd() {
    moveStop();
    setDiffData({
      flagClipTouch: false,
    });
  }

  function imageLoad({ detail }: any) {
    setDiffData({
      scale: 1,
      angle: 0,
      imageTop: sysinfo.windowHeight / 2,
      imageLeft: sysinfo.windowWidth / 2,
    });
    uni.hideLoading();
    optionsRefs.onReady.value(detail);
  }

  function imageTouchStart(event: any) {
    // #ifdef H5
    event.preventDefault();
    // #endif
    setDiffData({
      flagEndTouch: false,
    });
    const { imageLeft, imageTop } = getOptions();
    const clientXForLeft = event.touches[0].clientX;
    const clientYForLeft = event.touches[0].clientY;

    let touchRelative = [];
    if (event.touches.length === 1) {
      touchRelative[0] = {
        x: clientXForLeft - imageLeft,
        y: clientYForLeft - imageTop,
      };
      setDiffData({
        touchRelative,
      });
    } else {
      const clientXForRight = event.touches[1].clientX;
      const clientYForRight = event.touches[1].clientY;
      let width = Math.abs(clientXForLeft - clientXForRight);
      let height = Math.abs(clientYForLeft - clientYForRight);
      const hypotenuseLength = calcPythagoreanTheorem(width, height);

      touchRelative = [
        {
          x: clientXForLeft - imageLeft,
          y: clientYForLeft - imageTop,
        },
        {
          x: clientXForRight - imageLeft,
          y: clientYForRight - imageTop,
        },
      ];
      setDiffData({
        touchRelative,
        hypotenuseLength,
      });
    }
  }

  function imageTouchMove(event: any) {
    // #ifdef H5
    event.preventDefault();
    event.stopPropagation();
    // #endif
    const {
      flagEndTouch,
      throttleFlag,
      hypotenuseLength,
      scale,
      isDisableScale,
      minRatio,
      maxRatio,
      touchRelative,
    } = getOptions();

    if (flagEndTouch || !throttleFlag) return;
    const clientXForLeft = event.touches[0].clientX;
    const clientYForLeft = event.touches[0].clientY;
    setDiffData({ throttleFlag: false });
    throttle();
    moveDuring();
    if (event.touches.length === 1) {
      const { left: imageLeft, top: imageTop } = imageTouchMoveOfCalcOffset(
        touchRelative,
        clientXForLeft,
        clientYForLeft,
      );
      setDiffData({
        imageLeft,
        imageTop,
      });
      imgMarginDetectionPosition();
    } else {
      const clientXForRight = event.touches[1].clientX;
      const clientYForRight = event.touches[1].clientY;
      let width = Math.abs(clientXForLeft - clientXForRight),
        height = Math.abs(clientYForLeft - clientYForRight),
        hypotenuse = calcPythagoreanTheorem(width, height),
        sca = scale * (hypotenuse / hypotenuseLength);
      if (isDisableScale) {
        sca = 1;
      } else {
        sca = sca <= minRatio ? minRatio : sca;
        sca = sca >= maxRatio ? maxRatio : sca;
      }
      imgMarginDetectionScale(sca);
      setDiffData({
        scale: sca,
        hypotenuseLength: Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)),
      });
    }
  }

  function imageTouchEnd() {
    setDiffData({
      flagEndTouch: true,
    });
    moveStop();
  }

  function uploadImage() {
    const { source_album, source_camera } = getOptions();
    const sourceType = [];
    const sizeType = ['original', 'compressed'];
    if (source_album) {
      sourceType.push('album');
    }
    if (source_camera) {
      sourceType.push('camera');
    }
    uni.chooseImage({
      count: 1,
      sizeType,
      sourceType: sourceType,
      success(res) {
        setDiffData({
          image: res.tempFilePaths[0],
        });
      },
    });
  }

  function rotate() {
    if (getOption<boolean>('isDisableRotate')) return;
    if (InImage()) return;
    setDiffData({
      angle: getOption('angle') - getOption('rotateAngle'),
    });
  }

  function confirm() {
    if (InImage()) return;
    uni.showLoading({
      title: t('public.crop.loading'),
    });
    const {
      canvasHeight,
      canvasWidth,
      clipHeight,
      clipWidth,
      ctx,
      scale,
      imageLeft,
      imageTop,
      clipX,
      clipY,
      angle,
      scaleRatio: dpr,
      image,
      quality,
      imageWidth,
      imageHeight,
    } = getOptions();

    const draw = () => {
      const imageW = imageWidth * scale * dpr;
      const imageH = imageHeight * scale * dpr;
      const xpos = imageLeft - clipX;
      const ypos = imageTop - clipY;
      ctx.fillStyle = 'rgba(255, 255, 255, 0)';
      ctx.translate(xpos * dpr, ypos * dpr);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.drawImage(image, -imageW / 2, -imageH / 2, imageW, imageH);
      ctx.draw(false, () => {
        const width = clipWidth * dpr;
        const height = clipHeight * dpr;
        let data = {
          url: '',
          width,
          height,
        };
        uni.canvasToTempFilePath(
          {
            x: 0,
            y: 0,
            width,
            height,
            destWidth: width,
            destHeight: height,
            canvasId,
            fileType: 'png',
            quality,
            success: (res: any) => {
              data.url = res.tempFilePath || res.filePath;
              optionsRefs.onSuccess.value(data);
              navigateBack();
            },
            fail: (error) => {
              optionsRefs.onFail.value(error);
            },
            complete: () => uni.hideLoading(),
          },
          proxy,
        );
      });
    };

    if (canvasWidth !== clipWidth || canvasHeight !== clipHeight) {
      setDiffData({
        canvasWidth: clipWidth,
        canvasHeight: clipHeight,
      });
      ctx.draw();
      nextTick(() => {
        setTimeout(() => {
          draw();
        }, 100);
      });
    } else {
      draw();
    }
  }

  function cancel() {
    optionsRefs.onCancel.value();
    navigateBack();
  }

  watch(optionsRefs.imageUrl, (image) =>
    setDiffData({
      image,
    }),
  );

  watch(optionsRefs.image, getImageInfo);

  watch([optionsRefs.clipWidth, optionsRefs.clipHeight], ([widthVal, heightVal]) => {
    let { minWidth, minHeight } = getOptions();
    minWidth = minWidth / 2;
    minHeight = minHeight / 2;
    if (widthVal < minWidth) {
      setDiffData({ clipWidth: minWidth });
    }
    if (heightVal < minHeight) {
      setDiffData({ clipHeight: minHeight });
    }
    calcClipSize();
  });

  watch(optionsRefs.angle, (val) => {
    setDiffData({
      animation: true,
    });
    moveStop();
    if (getOption<boolean>('isLimitMove') && val % 90) {
      setDiffData({
        angle: Math.round(val / 90) * 90,
      });
    }
    imgMarginDetectionScale();
  });

  watch(optionsRefs.animation, (val) => {
    clearTimeout(getOption('animationTimer'));
    if (val) {
      let animationTimer = setTimeout(() => {
        setDiffData({
          animation: false,
        });
      }, 260);
      setDiffData({ animationTimer });
    }
  });

  watch(optionsRefs.isLimitMove, (val) => {
    if (val) {
      const angle = getOption<number>('angle');
      if (angle % 90) {
        setDiffData({
          angle: Math.round(angle / 90) * 90,
        });
      }
      imgMarginDetectionScale();
    }
  });

  watch([optionsRefs.clipY, optionsRefs.clipX], cutDetectionPosition);

  watch(optionsRefs.width, (width, oWidth) => {
    if (width !== oWidth) {
      setDiffData({
        clipWidth: width / 2,
      });
    }
  });

  watch(optionsRefs.height, (height, oHeight) => {
    if (height !== oHeight) {
      setDiffData({
        clipHeight: height / 2,
      });
    }
  });

  onLoad<'CropImg'>((op) => {
    setDiffData({
      ...op,
      image: op.imageUrl || getOption<string>('image'),
    });

    setClipInfo();
    setClipCenter();
    calcClipSize();
    cutDetectionPosition();
  });
</script>
<style lang="scss" scoped>
  .body {
    width: 100%;
    height: 100%;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.9);
    touch-action: none;

    .lime-clipper-mask {
      position: relative;
      z-index: 2;
      pointer-events: none;
      .lime-clipper-content {
        pointer-events: none;
        position: absolute;
        border: 1rpx solid rgba(255, 255, 255, 0.3);
        box-sizing: border-box;
        box-shadow: rgba(0, 0, 0, 0.5) 0 0 0 80vh;
        background: transparent;

        &::before {
          width: 200%;
          top: 33.33%;
          height: 66.66%;
          border-left: none !important;
          border-right: none !important;
        }
        &::after {
          width: 66.66%;
          left: 33.33%;
          height: 200%;
          border-top: none !important;
          border-bottom: none !important;
        }
        .lime-clipper-edge {
          position: absolute;
          width: 34rpx;
          height: 34rpx;
          border: 6rpx solid #fff;
          pointer-events: auto;
          &::before {
            content: '';
            position: absolute;
            width: 40rpx;
            height: 40rpx;
            background-color: transparent;
          }
          &:nth-child(1) {
            left: -6rpx;
            top: -6rpx;
            border-bottom-width: 0 !important;
            border-right-width: 0 !important;
          }
          &:nth-child(1):before {
            top: -50%;
            left: -50%;
          }
          &:nth-child(2) {
            right: -6rpx;
            top: -6rpx;
            border-bottom-width: 0 !important;
            border-left-width: 0 !important;
          }
          &:nth-child(2):before {
            top: -50%;
            left: 50%;
          }
          &:nth-child(3) {
            left: -6rpx;
            bottom: -6rpx;
            border-top-width: 0 !important;
            border-right-width: 0 !important;
          }
          &:nth-child(3):before {
            bottom: -50%;
            left: -50%;
          }
          &:nth-child(4) {
            right: -6rpx;
            bottom: -6rpx;
            border-top-width: 0 !important;
            border-left-width: 0 !important;
          }
          &:nth-child(4):before {
            bottom: -50%;
            left: 50%;
          }
        }
      }
      .lime-clipper-content::before,
      .lime-clipper-content::after {
        content: '';
        position: absolute;
        border: 1px dashed rgba(255, 255, 255, 0.3);
        transform: scale(0.5);
        transform-origin: left top;
      }
    }

    .lime-clipper-image {
      width: 100%;
      max-width: inherit;
      border-style: none;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      transform-origin: center;
    }

    .lime-clipper-canvas {
      position: fixed;
      z-index: 10;
      left: -200vw;
      top: -200vw;
      pointer-events: none;
      background: rgba(255, 255, 255, 0);
    }
    .footer {
      padding: 0 40rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      &::after {
        position: absolute;
        content: '';
        width: 200%;
        height: 200%;
        left: 0;
        top: 0;
        border-top: 1px solid rgba(255, 255, 255, 0.3);
        transform: scale(0.5);
        transform-origin: left top;
        pointer-events: none;
      }
      .but-box {
        flex-shrink: 0;
      }
    }
  }
</style>
