export interface AreaParams {
  /**
   * 查询关键字
   * @description 规则：只支持单个关键词语搜索关键词支持：行政区名称、citycode、adcode 例如，在subdistrict=2，搜索省份（例如山东），能够显示市（例如济南），区（例如历下区）adcode信息可参考城市编码表获取
   */
  keywords?: string;

  /**
   * 子级行政区
   * @description 规则：设置显示下级行政区级数（行政区级别包括：国家、省/直辖市、市、区/县、乡镇/街道多级数据）
   * @description	可选值：0、1、2、3等数字，并以此类推
   * @description 0：不返回下级行政区；
   * @description 1：返回下一级行政区；
   * @description	2：返回下两级行政区；
   * @description	3：返回下三级行政区；
   * @description 需要在此特殊说明，目前部分城市和省直辖县因为没有区县的概念，故在市级下方直接显示街道。
   * @description	例如：广东-东莞、海南-文昌市
   */
  subdistrict?: number;

  /**
   * 需要第几页数据
   * @description 最外层的districts最多会返回20个数据，若超过限制，请用page请求下一页数据。例如page=2；page=3。默认page=1
   */
  page?: number;

  /**
   * 	最外层返回数据个数
   */
  offset?: number;

  /**
   * 返回结果控制
   * @description 此项控制行政区信息中返回行政区边界坐标点； 可选值：base、all;
   * @description base:不返回行政区边界坐标点；
   * @description all:只返回当前查询district的边界值，不返回子节点的边界值；
   * @description 目前不能返回乡镇/街道级别的边界值
   */
  extensions?: 'base' | 'all';

  /**
   * 根据区划过滤
   * @description 按照指定行政区划进行过滤，填入后则只返回该省/直辖市信息需填入adcode，为了保证数据的正确，强烈建议填入此参数
   */
  filter?: number;

  /**
   * 返回数据格式类型
   */
  output?: 'JSON' | 'XML';
}

/**
 * 行政区
 */
export interface AreaResultDistricts {
  /**
   * 区域编码
   */
  adcode: string;

  /**
   * citycode
   */
  citycode: [] | string;

  /**
   * 行政区划级别
   */
  level: 'country' | 'province' | 'city' | 'district' | 'street';

  /**
   * 区域中心点
   */
  center: string;

  /**
   * 	行政区名称
   */
  name: string;

  /**
   * 下级行政区列表，包含district元素
   */
  districts: AreaResultDistricts[];
}

export interface AreaResult {
  /**
   * 返回结果状态值
   * 值为0或1，0表示失败；1表示成功
   */
  status: '0' | '1';

  /**
   * 返回状态说明
   * 返回状态说明，status为0时，info返回错误原因，否则返回“OK”。
   */
  info: string;

  /**
   * 状态码
   * 返回状态说明，10000代表正确，详情参阅info状态表
   */
  infocode: string;

  /**
   * 建议结果列表
   */
  suggestion: {
    /**
     * 建议关键字列表
     */
    keywords: any[];

    /**
     * 建议城市列表
     */
    cites: any[];
  };

  /**
   * 行政区列表
   */
  districts: AreaResultDistricts[];
}
