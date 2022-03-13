/**
 * 非微信小程序只有 开发版 和 正式版
 * develop  开发版
 * trial	  体验版
 * release	正式版
 */
type EnvVersion = 'develop' | 'trial' | 'release';
type EnvTYLE =
  | 'ICON_URL'
  | 'BASE_URL'
  | 'REQUEST_FILE_SERVER'
  | 'TENCENT_SECRET_ID'
  | 'TENCENT_SECRET_KEY'
  | 'TENCENT_HOST'
  | 'TENCENT_PREFIX'
  | 'TENCENT_URL_PREFIX'
  | 'QINIU_AK'
  | 'QINIU_SK'
  | 'QINIU_HOST'
  | 'QINIU_SPACE'
  | 'QINIU_PREFIX'
  | 'QINIU_URL_PREFIX'
  | 'ALIYUN_ACCESS_ID'
  | 'ALIYUN_ACCESS_SECRET'
  | 'ALIYUN_HOST'
  | 'ALIYUN_PREFIX'
  | 'ALIYUN_URL_PREFIX'
  | 'AMAP_KEY'
  | 'AMAP_AREA';

export function useEnv() {
  const env = import.meta.env;

  const envObj: { [x: string]: string } = {};

  let envVersion: EnvVersion;
  // #ifdef MP-WEIXIN
  envVersion = uni.getAccountInfoSync().miniProgram?.envVersion;
  // #endif

  // #ifndef MP-WEIXIN
  envVersion = env.MODE === 'development' ? 'develop' : 'release';
  // #endif

  Object.keys(env).forEach((key) => {
    let item: any[] = key.split('_');
    if (item[0] === 'XT') {
      item.splice(0, 1);
      const envVer = item[0].toLocaleLowerCase();
      if (['develop', 'trial', 'release'].includes(envVer)) {
        if (envVer === envVersion) {
          item.splice(0, 1);
          envObj[item.join('_') as string] = env[key] as string;
        }
      } else {
        envObj[item.join('_') as string] = env[key] as string;
      }
    }
  });

  /**
   * 获取环境变量数据
   * @param type
   * @returns
   */
  function getEnv(type: EnvTYLE) {
    return envObj[type];
  }

  /**
   * 应用是否运行在生产环境
   * @returns boolean
   */
  function isProdMode() {
    return env.PROD;
  }

  /**
   * 应用是否运行在开发环境
   * @returns boolean
   */
  function isDevMode() {
    return env.DEV;
  }

  return {
    envVersion,
    getEnv,
    isProdMode,
    isDevMode,
  };
}
