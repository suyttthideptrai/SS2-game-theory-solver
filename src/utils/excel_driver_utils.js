//TODO: implement two separate translate to object mechanism (old & RBO) for stable matching problem excel forms
import * as XLSX from '@e965/xlsx';
import {MATCHING} from '../const/excel_const';

export const loadProblemDataParallel = async (workbook, sheetNumber) => {

  const sheetName = workbook.SheetNames[sheetNumber];
  const sheet = workbook.Sheets[sheetName];
  const problemName = sheet['B1'].v;
  const setNum = Number(sheet['B2'].v);
  const totalNumberOfIndividuals = sheet['B3'].v;
  const characteristicNum = sheet['B4'].v;
  const fitnessFunction = sheet['B5'].v;

  let currentRow = 6 + setNum;
  let characteristics = [];

  let currentColumnIndex = XLSX.utils.decode_col(
      MATCHING.CHARACTERISTIC_START_COL);

  for (let i = currentColumnIndex; ; i++) {
    const cellAddress = XLSX.utils.encode_cell({c: i, r: currentRow - 1});
    const cell = sheet[cellAddress];
    // Break if cell is empty or undefined
    if (!cell || !cell.v) {
      break;
    }
    characteristics.push(cell.v);
  }

  // LOAD SET
  const individuals = [];
  let setEvaluateFunction = [];
  let individualSetIndexes = [];
  let individualNames = [];
  let individualProperties = [];
  let individualRequirements = [];
  let individualWeights = [];
  let individualCapacities = [];

  let setNames = [];
  let setTypes = [];
  let individualNum = null;
  let setType = null;
  let setName = null;

  // Load evaluate functions for each set
  for (let j = 0; j < setNum; j++) {
    const evaluateFunction = sheet[`B${6 + j}`]?.v || '';
    setEvaluateFunction.push(evaluateFunction);
  }

  for (let g = 0; g < setNum; g++) {
    setName = await sheet[`A${currentRow}`]['v'];
    setType = await sheet[`B${currentRow}`]['v'];
    setNames.push(setName);
    setTypes.push(setType);

    individualNum = await sheet[`D${currentRow}`]?.v;

    for (let i = 0; i < individualNum; i++) {
      const name = sheet[`A${currentRow + 1}`]?.v;
      const properties = [];
      const requirements = [];
      const weights = [];

      for (let k = 0; k < characteristicNum; k++) {
        properties.push(
            sheet[XLSX.utils.encode_cell({c: k + 4, r: currentRow})]?.v || 0);
        requirements.push(
            sheet[XLSX.utils.encode_cell({c: k + 4, r: currentRow + 1})]?.v ||
            0);
        weights.push(
            sheet[XLSX.utils.encode_cell({c: k + 4, r: currentRow + 2})]?.v ||
            0);
      }

      individualNames.push(name);
      individualSetIndexes.push(g);
      individualProperties.push(properties);
      individualRequirements.push(requirements);
      individualWeights.push(weights);

      // Load capacity
      const capacityValue = await sheet[`C${currentRow + 1}`]?.v;
      if (capacityValue !== undefined && capacityValue !== null) {
        individualCapacities.push(capacityValue);
      }

      currentRow += 3;
    }

    currentRow += 1;
  }

  return {
    problemName,
    characteristicNum,
    setNum,
    setNames,
    setTypes,
    totalNumberOfIndividuals,
    individualNames,
    characteristics,
    individualSetIndexes,
    individualCapacities,
    individualRequirements,
    individualProperties,
    individualWeights,
    individuals,
    fitnessFunction,
    setEvaluateFunction,
  };
};

export const loadProblemDataOld = async (workbook, sheetNumber) => {

}
