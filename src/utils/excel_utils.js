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
  const sheetName = await workbook.SheetNames[sheetNumber];
  const sheet = await workbook.Sheets[sheetName];
  const problemName = await sheet['B1']['v'];
  const setNum = await sheet['B2']['v'];
  const totalNumberOfIndividuals = await sheet['B3']['v'];
  const characteristicNum = await sheet['B4']['v'];
  const fitnessFunction = await sheet['B5']['v'];
  let currentRow = 6 + Number(setNum);
  let currentIndividual = 0;
  let characteristics = [];
  let errorMessage = '';

  // LOAD CHARACTERISTICS
  for (let i1 = 4; i1 < characteristicNum + 4; i1++) {
    const characteristicName = await sheet[
        XLSX.utils.encode_cell({
          c: i1,
          r: currentRow - 1,
        })
        ];

    if (characteristicName) {
      characteristics.push(characteristicName['v']);
    }
  }

  // LOAD SET
  const individuals = [];
  let setEvaluateFunction = [];
  const row = characteristicNum;
  const col = 3;
  let individualNum = null;
  let argumentCell = null;
  let individualName = null;
  let setType = null;
  let capacity = null;
  let setName = null;

  // Add evaluate function
  for (let j = 0; j < setNum; j++) {
    let evaluateFunction = await sheet[`B${6 + j}`]['v'];
    setEvaluateFunction.push(evaluateFunction);
  }
  for (let g = 0; g < setNum; g++) {
    setName = await sheet[`A${currentRow}`]['v'];
    setType = await sheet[`B${currentRow}`]['v'];

    if (g === 0) {
      setType = 0;
    } else if (g === 1) {
      setType = 1;
    }

    // CHECK THE INDIVIDUAL NUMBER IS NUMBER
    individualNum = await sheet[`D${currentRow}`];
    if (typeof individualNum['v'] !== 'number') {
      errorMessage = `Error when loading Set_${
          currentIndividual + 1
      }, row = ${currentRow} . Number of individual is invalid`;
      throw new Error();
    } else {
      individualNum = await sheet[`D${currentRow}`]['v'];

      // LOAD INDIVIDUAL
      for (let i = 0; i < individualNum; i++) {
        let argument = [];
        individualName = await sheet[`A${currentRow + 1}`]['v'];
        capacity = await sheet[`C${currentRow + 1}`][`v`];

        for (let k = 0; k < row; k++) {
          argument[k] = [];
          for (let l = 0; l < col; l++) {
            argumentCell = await sheet[
                XLSX.utils.encode_cell({
                  c: k + 4,
                  r: currentRow + l,
                })
                ];

            if (argumentCell === undefined) {
              errorMessage = `Error when loading Individual_${
                  currentIndividual + 1
              }, row = ${currentRow}, column = ${
                  k + 1
              }. Characteristic_ of strategy are invalid`;
              throw new Error();
            }
            argument[k][l] = argumentCell['v'];
          }
        }
        let individual = {
          set: setName,
          setType: setType,
          individualName: individualName,
          capacity: capacity,
          argument: argument,
        };
        individuals.push(individual);
        currentRow += 3;
      }
      currentRow += 1;
    }
  }

  return {
    problemName,
    characteristicNum,
    setNum,
    totalNumberOfIndividuals,
    characteristics,
    individuals,
    fitnessFunction,
    setEvaluateFunction,
  };
};
