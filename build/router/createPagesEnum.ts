import fs from 'fs';

import createTemplate from './createTemplate';

export default (names: any, template = true) => {
  let coms = '/** \n * 页面定义 \n * 请不要修改此文件 \n';
  let content = 'enum Pages { \n';
  let conkeys = 'type PageKeys = {  \n';
  for (const key in names) {
    const item = names[key];
    coms += ' * @param ' + key + ' ' + (item.style.navigationBarTitleText || '') + '\n';
    conkeys += `  ${key}: '${key}',\n`;
    content += `  ${key} = '${item.path}',\n`;

    template && createTemplate(item, key);
  }

  coms += ' */';
  conkeys += '};\n';
  content += '};\n';
  content += 'type PagesType = keyof typeof Pages; \n';
  content += 'export { Pages, PageKeys, PagesType }; \n';
  fs.writeFileSync(
    process.env.UNI_INPUT_DIR + '/router/types/pages.ts',
    coms + '\n' + conkeys + '\n' + content,
  );
  // console.log('成功设置 =>  ' + process.env.UNI_INPUT_DIR + '/router/pages.ts');
};
