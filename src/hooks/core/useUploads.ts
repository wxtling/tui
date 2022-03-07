import { ref } from 'vue';

interface ChooseImageOptions {
  /**
   * 最多可以选择的图片张数，默认9
   */
  count?: number;
  /**
   * original 原图，compressed 压缩图，默认二者都有
   */
  sizeType?: string | string[];
  /**
   * album 从相册选图，camera 使用相机，默认二者都有
   */
  sourceType?: string[];
  /**
   * 根据文件拓展名过滤，每一项都不能是空字符串。默认不过滤。
   */
  extension?: string[];
}

interface Item {
  src?: string;
  tempFile?: TempFile;
  upload?: boolean;
}

export function useUpload() {
  const item = ref<Item>({});

  function chooseImage(options: ChooseImageOptions) {
    uni.chooseImage({
      ...options,
      success: (res: any) => {
        const tempFile = res.tempFiles[0] as TempFile;
        item.value = {
          src: tempFile.path,
          tempFile,
          upload: false,
        };
      },
    });
  }

  function upload() {}

  return { item, chooseImage, upload };
}

export function useUploads() {
  const list = ref<Item[]>([]);

  function chooseImage(options: ChooseImageOptions) {
    uni.chooseImage({
      ...options,
      success: (res: any) => {
        res.tempFiles.forEach((tempFile: TempFile) => {
          list.value.push({
            src: tempFile.path,
            tempFile,
            upload: false,
          });
        });
      },
    });
  }

  function upload() {}

  return { list, chooseImage, upload };
}
