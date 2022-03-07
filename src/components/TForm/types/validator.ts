import type {
  Rules,
  ValidateError,
  InternalRuleItem,
  Value,
  Values,
  ValidateOption,
  SyncValidateResult,
} from 'async-validator';

import { RuleType } from './index';

export interface RuleItem {
  type?: RuleType;
  required?: boolean;
  pattern?: RegExp | string;
  min?: number;
  max?: number;
  len?: number;
  enum?: Array<string | number | boolean | null | undefined>;
  whitespace?: boolean;
  options?: ValidateOption;
  transform?: (value: Value) => Value;
  message?: string | ((a?: string) => string);
  asyncValidator?: (
    rule: InternalRuleItem,
    value: Value,
    callback: (error?: string | Error) => void,
    source: Values,
    options: ValidateOption,
  ) => void | Promise<void>;
  validator?: (
    rule: InternalRuleItem,
    value: Value,
    callback: (error?: string | Error) => void,
    source: Values,
    options: ValidateOption,
  ) => SyncValidateResult | void;
}

export type TRules = RuleItem[];

export { Rules, ValidateError };
