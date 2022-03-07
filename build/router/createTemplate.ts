import fs from 'fs';
import fse from 'fs-extra';
const in_file = (file: string) =>
  new Promise((re) => {
    fs.access(file, fs.constants.F_OK, (err: any) => {
      re(err ? true : false);
    });
  });

export default async (obj: any, name: string) => {
  let file_d = process.env.UNI_INPUT_DIR + '/' + obj.path;
  let ress = await in_file(file_d + '.vue');
  if (ress) ress = await in_file(file_d + '.nvue');
  if (ress) {
    fs.readFile(__dirname + '/template.vue', 'utf-8', (err: any, data: any) => {
      if (err) {
        throw err;
      }
      fse.outputFile(
        file_d + '.vue',
        data
          .toString()
          .replace(
            /\$name/g,
            name.replace(/^\S/, (s) => s.toUpperCase()),
          )
          .replace(/\$navigationBarTitleText/g, obj.style.navigationBarTitleText),
      );
      // console.log('成功创建文件 => ', file_d + '.vue');
    });
  }
};
