import React from 'react';
import { useState, useEffect } from 'react';
import "./style.scss";
import Input from "../../../components/input";
import ExcelImage from '../../../images/excel.png'
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useContext } from 'react';
import DataContext from "../../../context/DataContext"

import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom'

import Loading from '../../../components/Loading';
import PopupContext from '../../../context/PopupContext';
export default function InputPage() {
    //initialize from data
    const [excelFile, setExcelFile] = useState(null);
    const [problemName, setProblemName] = useState("");
    const [setNum, setSetNum] = useState(null);
    const [characteristicsNum, setCharacteristicsNum] = useState(null);
    const [totalIndividualsNum, setTotalIndividualsNum] = useState(null);
    const [fitnessFunction, setFitnessFunction] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [excelFileError, setExcelFileError] = useState("");
    const [problemNameError, setProblemNameError] = useState("");
    const [setNumError, setSetNumError] = useState("");
    const [characteristicsNumError, setCharacteristicsNumError] = useState("");
    const [totalIndividualsNumError, setTotalIndividualsNumError] = useState("");
    const [fitnessFunctionError, setFitnessFunctionError] = useState("");


    const { setAppData, setGuideSectionIndex } = useContext(DataContext)
    const { displayPopup } = useContext(PopupContext)
    const [rowNums, setRowNums] = useState(2);
    const [colNums, setColNums] = useState(0);
    const [setIndividuals, setSetIndividuals] = useState(Array.from({ length: colNums }, () => ''));
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

    // useEffect to validate and read file when it changes
    useEffect(() => {

        if (excelFile) {
            try {
                if (validateExcelFile(excelFile)) {
                    readExcelFile(excelFile);
                } else {
                    displayPopup("Something went wrong!", "The file was not an Excel file!", true)
                    setExcelFileError("The file was not an Excel file!")

                }
            } catch (error) {
                console.error(error.message);
                displayPopup("Error", error.message, true);
            }
        }
    }, [excelFile]);

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
            let individualName = null;
            for (let g = 0; g < setNum; g++) {
                const set = await sheet[`A${currentRow}`]['v'];
                individualNum = await sheet[`B${currentRow}`];
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

    const handleGetExcelTemplate = () => {
        if (validateForm()) {
            downloadExcel();
        }
    }

    const validateForm = () => {
        let error = false
        // check if the problem name is empty
        if (!problemName) {
            setProblemNameError("Problem name must not be empty");
            error = true;
        } else {
            setProblemNameError("");
        }

        // check if the number of set is empty
        if (!setNum) {
            setSetNumError("Number of set must not be empty");
            error = true;
        } else {
            setSetNumError("");
        }

        // check if the number of characteristics is empty
        if (!characteristicsNum) {
            setCharacteristicsNumError("Number of characteristics must not be empty");
            error = true;
        } else {
            setCharacteristicsNumError("");
        }

        // check if the number of total individuals is empty
        if (!totalIndividualsNum) {
            setTotalIndividualsNumError("Number of total individuals must not be empty");
            error = true;
        } else {
            setTotalIndividualsNumError("");
        }

        // check if the number of strategies is empty
        if (!fitnessFunction) {
            setFitnessFunctionError("Fitness function must not be empty");
            error = true;
        } else {
            setFitnessFunctionError("");
        }
        // if there is no error, return true
        if (error) {
            return false
        }
        return true;
    }

    // tao file excel dua tren input
    const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        // add some  example data for sheet1 (base on the number of normal players user input) 

        // write problem information to sheet1
        const sheet1 = XLSX.utils.aoa_to_sheet([
            ["Problem name", problemName],
            ["Number of set", setNum],
            ["Number of individuals", Number(totalIndividualsNum)],
            ["Number of characteristics", Number(characteristicsNum)],
            ["Fitness function", fitnessFunction],
        ]);

        const addTable = [];
        for (let i = 0; i < Number(setNum); i++) {
            const numberSetIndividuals = Number(setIndividuals[i]);
            if (i === 0) {
                const row6 = ["Set_1"];
                row6.push(numberSetIndividuals);

                for (let j = 0; j < Number(characteristicsNum); j++) {
                    row6.push(`Characteristic_${j + 1}`);
                }
                addTable.push(row6);
                for (let k = 0; k < numberSetIndividuals; k++) {
                    const rowIndividual = [`Individual_${k + 1}`];
                    rowIndividual.push(`Requirements`)
                    const rowWeights = [null];
                    rowWeights.push('Weights');
                    const rowProperties = [null];
                    rowProperties.push("Properties");

                    for (let h = 0; h < characteristicsNum; h++) {
                        rowIndividual.push(`req_${h + 1}`);
                        rowWeights.push(`w_${h + 1}`);
                        rowProperties.push(`p_${h + 1}`)
                    }

                    addTable.push(rowIndividual)
                    addTable.push(rowWeights)
                    addTable.push(rowProperties)

                }
            } else {
                const rowSet = [`Set_${i + 1}`];
                rowSet.push(numberSetIndividuals);
                addTable.push(rowSet)
                for (let k = 0; k < numberSetIndividuals; k++) {
                    const rowIndividual = [`Individual_${k + 1}`];
                    rowIndividual.push(`Requirements`)
                    const rowWeights = [null];
                    rowWeights.push('Weights');
                    const rowProperties = [null];
                    rowProperties.push("Properties");

                    for (let h = 0; h < characteristicsNum; h++) {
                        rowIndividual.push(`req_${h + 1}`);
                        rowWeights.push(`w_${h + 1}`);
                        rowProperties.push(`p_${h + 1}`)
                    }

                    addTable.push(rowIndividual)
                    addTable.push(rowWeights)
                    addTable.push(rowProperties)

                }
            }


        }
        XLSX.utils.sheet_add_aoa(sheet1, addTable, { origin: -1 });
        XLSX.utils.book_append_sheet(workbook, sheet1, 'Problem Information');

        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, 'Input_Matching_Theory.xlsx');
    }



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


    //Initialize table of individual per set
    const handleColumnsChange = (e) => {
        const value = e.target.value;
        setSetNum(value);
        setColNums(value);
        setSetIndividuals(Array.from({ length: value }, () => ''))
    }
    const generateTable = () => {
        const table = [];
        for (let i = 0; i < 2; i++) {
            const row = [];
            if (i === 0) {
                for (let j = 0; j < colNums; j++) {
                    row.push(<th className='th' key={j}>{` Set_${j + 1}`}</th>);
                }
            } else {
                for (let k = 0; k < colNums; k++) {
                    row.push(<td className="td" key={k}>
                        <input
                            type="text"
                            className='input-table-data'
                            placeholder={` #Individuals Set_${k + 1}`}
                            onChange={(e) => {
                                const newSetIndividuals = [...setIndividuals];
                                newSetIndividuals[k] = e.target.value;
                                setSetIndividuals(newSetIndividuals);
                            }

                            }
                        />
                    </td>);
                }
            }
            table.push(<tr key={i}>{row}</tr>);
        }
        return (
            <table>
                <tbody>{table}</tbody>
            </table>
        );
    }

    return (
        <>
            <div className="input-page">

                <Loading isLoading={isLoading} />
                <p className='header-text'>Enter information about your problem</p>
                <div className="input-container">
                    <div className="row">
                        <Input
                            message='Name of the problem'
                            type='text'
                            error={problemNameError}
                            handleOnChange={(e) => setProblemName(e.target.value)}
                            value={problemName}
                            description="The name should be concise and meaningful, reflecting the nature of the game being analyzed"
                            guideSectionIndex={1}
                        />
                    </div>

                    <div className="row">
                        <Input
                            message='Number of set'
                            type="text"
                            error={setNumError}
                            handleOnChange={handleColumnsChange}
                            value={setNum}
                            description="A positive number that reflects the number of set involved to ensure that the resulting is valid"
                            guideSectionIndex={2}

                        />
                    </div>
                    {
                        setNum ? (

                            <div className='table'>

                                {generateTable()}
                            </div>
                        ) : (
                            null
                        )

                    }

                    <div className='row'>
                        <Input
                            message='Number of characteristics'
                            text='number'
                            error={characteristicsNumError}
                            handleOnChange={(e) => setCharacteristicsNum(e.target.value)}
                            value={characteristicsNum}
                            description="A characteristic is the requirements and the properties that an individuals has that affects their weight during matching"
                            guideSectionIndex={3}
                        />
                        <Input
                            message='Number of total individuals'
                            text='number'
                            error={totalIndividualsNumError}
                            handleOnChange={(e) => setTotalIndividualsNum(e.target.value)}
                            value={totalIndividualsNum}
                            description="A positive number that reflects the number of individuals in each set involved to ensure that the resulting is valid"
                            guideSectionIndex={4}

                        />
                    </div>

                    <div className="row">
                        <Input
                            message='Fitness function'
                            type='text'
                            error={fitnessFunctionError}
                            handleOnChange={(e) => setFitnessFunction(e.target.value)}
                            value={fitnessFunction}
                            description="The fitness function is a mathematical function that represents the payoff that a player receives for a specific combination of strategies played by all the players in the game"
                            guideSectionIndex={5}
                        />
                    </div>
                </div>
                <div className="btn" onClick={handleGetExcelTemplate}>
                    <p>Get Excel Template</p>
                    <img src={ExcelImage} alt="" />
                </div>

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
        </>
    );
}


