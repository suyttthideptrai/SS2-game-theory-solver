import {ALGORITHMS} from './const/algorithmConst';
import {
  DEFAULT_ALGORITHM,
  DEFAULT_PROBLEM_TYPE,
  DEFAULT_POPULATION_SIZE,
  DEFAULT_GENERATION_NUM,
  DEFAULT_SAMPLE_DISPLAY_NUM,
  DEFAULT_MAXTIME,
  INVALID_MATH_SYMBOLS,
  DEFAULT_CORE_NUM
} from './const/matchingConst';
import {MATCHING_PROBLEM_TYPES} from './const/matchingTypes';

export const SMT = Object.freeze({
  ALGORITHMS: ALGORITHMS,
  DEFAULT_ALGORITHM: DEFAULT_ALGORITHM,
  DEFAULT_PROBLEM_TYPE: DEFAULT_PROBLEM_TYPE,
  DEFAULT_POPULATION_SIZE: DEFAULT_POPULATION_SIZE,
  DEFAULT_GENERATION_NUM: DEFAULT_GENERATION_NUM,
  DEFAULT_SAMPLE_DISPLAY_NUM: DEFAULT_SAMPLE_DISPLAY_NUM,
  DEFAULT_MAXTIME: DEFAULT_MAXTIME,
  DEFAULT_CORE_NUM: DEFAULT_CORE_NUM,
  PROBLEM_TYPES: MATCHING_PROBLEM_TYPES,
});

export const SMT_VALIDATE = Object.freeze({
  INVALID_MATH_SYMBOLS: INVALID_MATH_SYMBOLS
});