import { genMessage } from '../helper';

const modules = import.meta.globEager('./zh-CN/**/*.ts');

export default { ...genMessage(modules, 'zh-CN')};
