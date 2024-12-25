import {ALGORITHMS} from './algorithm_const';

export const GT_ALGORITHMS = Object.freeze(
    [
        ALGORITHMS.NSGA2,
        ALGORITHMS.NSGA3,
        ALGORITHMS.eMOEA,
        ALGORITHMS.PESA2,
        ALGORITHMS.VEGA,
        ALGORITHMS.PAES,
        ALGORITHMS.MOEAD,
        ALGORITHMS.OMOPSO,
        ALGORITHMS.SMPSO
    ]
);

//TODO: better handle problem type

export const PSP_PROBLEM_TYPE = "PSP";
export const PSP_CHEAT_CODE = "HelloWorld";