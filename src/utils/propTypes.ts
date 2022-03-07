import { createTypes, VueTypesInterface } from 'vue-types';
/**
 * https://dwightjack.github.io/vue-types/
 */
type PropTypes = VueTypesInterface & {};

const propTypes = createTypes({
  func: undefined,
  bool: undefined,
  string: undefined,
  number: undefined,
  object: undefined,
  integer: undefined,
}) as PropTypes;

export { propTypes };
