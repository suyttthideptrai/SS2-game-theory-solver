import React from 'react';
import { useState, useEffect } from 'react';
import "./style.scss";
import SpecialPlayerInput from "../../../components/specialPlayerInput";
import Input from "../../../components/input";
import ExcelImage from '../../../images/excel.png'
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useContext } from 'react';
import DataContext from "../../../context/DataContext"

import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom'

import Loading from '../../../components/Loading';
import MaxMinCheckbox from '../../../components/MaxMinCheckbox'
import PopupContext from '../../../context/PopupContext';
import ParamSettingBox from '../../../components/ParamSettingBox'
export default function InputPage() {
    //initialize from data
    const [excelFile, setExcelFile] = useState(null);
    const [problemName, setProblemName] = useState("");
    const [setNum, setsetNum] = useState(null);
    const [characteristicNum, setCharacteristicNum] = useState(null);
    const [totalNumberOfIndividuals, setTotalNumberOfIndividuals] = useState(null);
    const [fitnessFunction, setFitnessFunction] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [excelFileError, setExcelFileError] = useState('');

    const { setAppData, setGuideSectionIndex } = useContext(DataContext)
    const { displayPopup } = useContext(PopupContext)
    const navigate = useNavigate();
    const validateExcelFile = (file) => {
        const extension = file.name.split(".").pop();
        if (extension === "xlsx") {
            setExcelFileError("");
            return true; // File is valid
        } else {
            setExcelFileError("The file was not an Excel file!");
            throw new Error("The file was not an Excel file!");
        }
    };

    // Function to read data from the Excel file
    const readExcelFile = async (file) => {
        const reader = new FileReader();
        try {
            reader.onload = async (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const problemInfo = await loadIndividual(workbook, 0);
                setAppData({
                    problem: {
                        nameOfProblem: problemInfo.problemName,
                        numberOfChars: problemInfo.characteristicNum,
                        numberOfSets: problemInfo.setNum,
                        numberOfIndividuals: problemInfo.totalNumberOfIndividuals,
                        characteristics: problemInfo.characteristics,
                        individuals: problemInfo.individuals,
                        fitnessFunction: problemInfo.fitnessFunction,
                    }
                })

                navigate('/matching-theory/input-processing')
            };
            reader.readAsBinaryString(file);

        } catch (error) {
            setIsLoading(false)
            displayPopup("Something went wrong!", "Check the input file again for contact the admin!", true)
        }


    };

    const loadIndividual = async (workbook, sheetNumber) => {
        const sheetName = await workbook.SheetNames[sheetNumber];
        const sheet = await workbook.Sheets[sheetName];
        let currentRow = 6;
        let currentIndividual = 0;
        let currentSet = 0;

        let setArray = [];
        let characteristics = [];

        let errorMessage = "";
        try {
            const problemName = await sheet['A1']['v'];
            const setNum = await sheet['B2']['v'];
            const totalNumberOfIndividuals = await sheet['B3']['v'];
            const characteristicNum = await sheet['B4']['v'];
            const fitnessFunction = await sheet['B5']['v'];

            // LOAD CHARACTERISTICS
            for (let i = 2; i < characteristicNum + 2; i++) {
                const characteristicName = await sheet[XLSX.utils.encode_cell({
                    c: i, r: currentRow - 1
                })];
                if (characteristicName) {
                    characteristics.push(characteristicName['v']);
                }
            }

            // LOAD SET
            const individuals = [];
            const row = characteristicNum;
            const col = 3;
            let individualNum = null;
            let argumentCell = null;
            for (let g = 0; g < setNum; g++) {
                const set = await sheet[`A${currentRow}`]['v'];
                individualNum = await sheet[`B${currentRow}`];
                let individualName = "";
                if (typeof individualNum['v'] !== 'number') {
                    errorMessage = `Error when loading Set_${currentIndividual + 1}, row = ${currentRow} . Number of individual is invalid`;
                    throw new Error();
                } else {
                    individualNum = await sheet[`B${currentRow}`]['v'];

                    // LOAD INDIVIDUAL
                    for (let i = 0; i < individualNum; i++) {
                        let argument = [];
                        individualName = await sheet[`A${currentRow + 1}`]['v']
                        for (let k = 0; k < row; k++) {
                            argument[k] = []
                            for (let l = 0; l < col; l++) {
                                argumentCell = await sheet[XLSX.utils.encode_cell({
                                    c: k + 2,
                                    r: currentRow + l
                                })];
                                if (argumentCell === undefined) {
                                    errorMessage = `Error when loading Individual_${currentIndividual + 1}, row = ${currentRow}, column = ${k + 1}. Characteristic_ of strategy are invalid`;
                                    throw new Error()
                                };
                                argument[k][l] = argumentCell['v'];
                            }
                        }
                        let individual = {
                            name: individualName,
                            set: set,
                            characteristics: characteristics,
                            argument: argument
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
                fitnessFunction   
            };
        } catch (error) {
            displayPopup("Something went wrong!", errorMessage, true)
        }
        return sheet
    }

    // useEffect to validate and read file when it changes
    useEffect(() => {
        if (excelFile) {
            try {
                if (validateExcelFile(excelFile)) {
                    readExcelFile(excelFile);
                }
            } catch (error) {
                console.error(error.message);
                displayPopup("Error", error.message, true);
            }
        }
    }, [excelFile]);
    return (
        <div>
            <input type="file" onChange={(e) => setExcelFile(e.target.files[0])} />
            {excelFile && (
                <div>
                    <h3>Excel Data:</h3>
                    <pre>{JSON.stringify(excelFile, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}


