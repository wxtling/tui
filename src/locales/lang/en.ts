import { genMessage } from '../helper';

const modules = import.meta.globEager('./en/*.ts');

export default { ...genMessage(modules, 'en') };
