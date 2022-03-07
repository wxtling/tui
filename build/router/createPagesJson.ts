import fs from 'fs';
import createPagesEnum from './createPagesEnum';
function getPages(list: any[], hUrl = '', _path: string) {
  let items: any[] = [];
  let name_list: {
    [propName: string]: any;
  } = {};
  const _children = (arr: any[], url: string = '') => {
    arr.forEach((v) => {
      const path = url + v.path;
      if (v.children && v.children.length > 0) {
        _children(v.children, path + '/');
        delete v.children;
      }
      const to_path = hUrl + (v.path === '/' ? _path : path + '/' + _path);
      if (v.name)
        name_list[v.name] = {
          path: to_path,
          style: v,
        };
      delete v.name;
      delete v.path;
      items.push({
        path: to_path,
        style: v,
      });
    });
  };
  _children(list);
  return {
    items,
    name_list,
  };
}

export default (modules: { [x: string]: any }, path: string, template = true) => {
  const obj = JSON.parse(JSON.stringify(modules));

  let config = {};
  let pages: any[] = [];
  let subPackages: any[] = [];
  let names: any = {};

  for (const key in obj) {
    const value = obj[key];
    if (key === 'config') {
      config = value;
      continue;
    }

    if (key === 'base') {
      const { items, name_list } = getPages(value, 'pages/base/', path);
      pages = [...pages, ...items];
      names = { ...names, ...name_list };
      continue;
    }

    const { items, name_list } = getPages(value, '', path);
    let root = 'pages/' + key;
    subPackages.push({
      root,
      pages: items,
    });
    for (const key in name_list) {
      const path = root + '/' + name_list[key].path;
      names[key] = {
        path,
        style: name_list[key].style,
      };
    }
  }

  let data: any = { ...config };
  data.pages = pages;
  data.subPackages = subPackages;

  fs.writeFileSync(process.env.UNI_INPUT_DIR + '/pages.json', JSON.stringify(data, null, 2));
  // console.log('成功设置 => ' + process.env.UNI_INPUT_DIR + '/pages.json');

  createPagesEnum(names, template);
};
