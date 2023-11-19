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

    const handleDrop = (event) => {
        event.preventDefault();
        setExcelFile(event.dataTransfer.files[0]);
        event.target.classList.remove("dragging")
    }

    const handleOnDragEnter = (event) => {
        event.preventDefault()
        event.target.classList.add("dragging")
    }

    const handleOnDragLeave = (event) => {
        event.preventDefault()
        event.target.classList.remove("dragging")
    }

    const handleFileInput = (event) => {
        setExcelFile(event.target.files[0]);
    };


    return (
        <div className='input-page'>
            <div className="guide-box">
                <p>Get the Excel file template, input your data, then drag & drop it to the box below</p>
                <Link to='/guide' className='guide-link' onClick={e => setGuideSectionIndex(9)}> Learn more on how to input to file Excel</Link>
            </div>
            {excelFileError && <p className='file-error'>{excelFileError}</p>}
            <div className={excelFileError ? 'drag-area file-error' : 'drag-area'}
                onDrop={handleDrop}
                onDragEnter={handleOnDragEnter}
                onDragLeave={handleOnDragLeave}
                onDragOver={handleOnDragEnter}
            >
                <p className='drag-text'>{excelFile ? excelFile.name : 'Drag and drop a file here'}</p>
                <label htmlFor="select-file" id='select-file-label'>Choose a file</label>
                <input type="file" id="select-file" onChange={handleFileInput} />
            </div>
        </div>
    );
}


