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
    const [isSetMany, setIsSetMany] = useState(false);

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
    const [setEvaluateFunction, setSetEvaluateFunction] = useState(Array.from({ length: colNums }, () => ''));
    const [setIndividuals, setSetIndividuals] = useState(Array.from({ length: colNums }, () => ''));
    const [setMany, setSetMany] = useState(Array.from({ length: colNums }, () => false));
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
                        evaluateFunctions: problemInfo.setEvaluateFucntion
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
        const problemName = await sheet['B1']['v'];
            const setNum = await sheet['B2']['v'];
            const totalNumberOfIndividuals = await sheet['B3']['v'];
            const characteristicNum = await sheet['B4']['v'];
            const fitnessFunction = await sheet['B5']['v'];
        let currentRow = 6 + Number(setNum);
        let currentIndividual = 0;
        let characteristics = [];
        let errorMessage = "";
        console.log(currentRow);

        // MODIFY THE ORDER OF SET MANY TO RETURN TO BACKEND

        try {
            // const problemName = await sheet['A2']['v'];
            // const setNum = await sheet['B2']['v'];
            // const totalNumberOfIndividuals = await sheet['B3']['v'];
            // const characteristicNum = await sheet['B4']['v'];
            // const fitnessFunction = await sheet['B5']['v'];

            // LOAD CHARACTERISTICS
            for (let i1 = 4; i1 < characteristicNum + 4; i1++) {
                const characteristicName = await sheet[XLSX.utils.encode_cell({
                    c: i1, r: currentRow - 1
                })];

                if (characteristicName) {
                    characteristics.push(characteristicName['v']);
                }
            }




            // LOAD SET
            const individuals = [];
            const individualSetMany = [];
            const individualSetOne = [];
            const evaluateSetMany = [];
            const evaluateSetOne = [];
            const tempEvaluateFunctions = [
                // await sheet[`B6`]['v'],
                // await sheet[`B7`]['v'],
            ];
            let setEvaluateFucntion = [];
            const row = characteristicNum;
            const col = 3;
            let individualNum = null;
            let argumentCell = null;
            let individualName = null;
            let setType = null;

            let capacity = null;
            let setName = null;
            for(let j = 0; j < setNum; j++){
                let evaluateFunction = await sheet[`B${6+j}`]['v'];
                console.log(evaluateFunction);
                tempEvaluateFunctions.push(evaluateFunction)
            }
            for (let g = 0; g < setNum; g++) {
                setName = await sheet[`A${currentRow}`]['v'];
                setType = await sheet[`B${currentRow}`]['v'];
                if (setType === 'Set Many') {
                    // change
                    setType = 1;
                    
                    // setEvaluateFucntion[1] = { [setType]: tempEvaluateFunctions[g] };
                    evaluateSetMany.push(tempEvaluateFunctions[g]);
                } else {
                    // change
                    setType = 0;
                    // setEvaluateFucntion[0] = { [setType]: tempEvaluateFunctions[g] };
                    evaluateSetOne.push(tempEvaluateFunctions[g]);
                    console.log(evaluateSetOne);
                }

                // CHECK THE INDIVIDUAL NUMBER IS NUMBER
                individualNum = await sheet[`D${currentRow}`];
                if (typeof individualNum['v'] !== 'number') {
                    errorMessage = `Error when loading Set_${currentIndividual + 1}, row = ${currentRow} . Number of individual is invalid`;
                    throw new Error();
                } else {
                    individualNum = await sheet[`D${currentRow}`]['v'];

                    // LOAD INDIVIDUAL
                    for (let i = 0; i < individualNum; i++) {
                        let argument = [];
                        individualName = await sheet[`A${currentRow + 1}`]['v'];
                        capacity = await sheet[`C${currentRow + 1}`][`v`];

                        for (let k = 0; k < row; k++) {
                            argument[k] = []
                            for (let l = 0; l < col; l++) {
                                argumentCell = await sheet[XLSX.utils.encode_cell({
                                    c: k + 4,
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
                            set: setName,
                            setType: setType,
                            individualName: individualName,
                            capacity: capacity,
                            argument: argument
                        };
                        if (setType === 1) {
                            individualSetMany.push(individual);
                        } else {
                            individualSetOne.push(individual);
                        }

                        currentRow += 3;
                    }
                    currentRow += 1;
                }
            }


            for (let i = 0, z = evaluateSetMany.length + evaluateSetOne.length; i < z; i++) {
                if(evaluateSetMany.length === setNum){
                    setEvaluateFucntion.push(evaluateSetMany[i]);
                }else if(evaluateSetOne.length === setNum){
                    setEvaluateFucntion.push(evaluateSetOne[i]);
                }
                else if (i < evaluateSetOne.length) {
                    setEvaluateFucntion.push(evaluateSetOne[i]);
                } else {
                    const indexInSetMany = i - evaluateSetOne.length;
                    if (indexInSetMany < evaluateSetMany.length) {
                        setEvaluateFucntion.push(evaluateSetMany[indexInSetMany]);
                    }
                }
            }
            console.log(setEvaluateFucntion);

            // Change
            for (let i = 0, z = individualSetMany.length + individualSetOne.length; i < z; i++) {
                if(individualSetMany.length === totalNumberOfIndividuals){
                    individuals.push(individualSetMany[i]);
                }else if(individualSetOne.length === totalNumberOfIndividuals){
                    individuals.push(individualSetOne[i]);
                }
                else if (i < individualSetOne.length) {
                    individuals.push(individualSetOne[i]);
                } else {
                    const indexInSetMany = i - individualSetOne.length;
                    if (indexInSetMany < individualSetMany.length) {
                        individuals.push(individualSetMany[indexInSetMany]);
                    }
                }
            }

            console.log(individuals);
            return {
                problemName,
                characteristicNum,
                setNum,
                totalNumberOfIndividuals,
                characteristics,
                individuals,
                fitnessFunction,
                setEvaluateFucntion,
            };
        } catch (error) {
            // displayPopup("Something went wrong!", errorMessage, true)
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
            [{ v: "Problem name", s: { alignment: { horizontal: "center" } } }, { v: problemName, s: { alignment: { horizontal: "center" } } }],
            ["Number of set", setNum],
            ["Number of individuals", totalIndividualsNum],
            ["Number of characteristics", characteristicsNum],
            ["Fitness function", fitnessFunction],
        ]);

        const addTable = [];
        setEvaluateFunction.forEach((evaluateFunction, index) => {
            addTable.push([`Evaluate Function Set_${index + 1}`, evaluateFunction]);
        });
        for (let i = 0; i < Number(setNum); i++) {


            const numberSetIndividuals = Number(setIndividuals[i]);
            if (i === 0) {
                const row8 = ["Set_1"];
                if (setMany[i] === true) {
                    row8.push("Set Many")
                } else {
                    row8.push("Set One")
                }
                row8.push("Capacity");
                row8.push(numberSetIndividuals);

                for (let j = 0; j < Number(characteristicsNum); j++) {
                    row8.push(`Characteristic_${j + 1}`);
                }
                addTable.push(row8);
                for (let k = 0; k < numberSetIndividuals; k++) {
                    const rowIndividual = [`Individual_${k + 1}`];
                    if (setMany[i] === true) {
                        rowIndividual.push(null);
                        //Change
                        rowIndividual.push(1);
                    } else {
                        rowIndividual.push(null);
                        //Change
                        rowIndividual.push("Fill capacity > 0");
                    }
                    rowIndividual.push(`Requirements`)
                    const rowWeights = [null];
                    rowWeights.push(null);
                    rowWeights.push(null);
                    rowWeights.push('Weights');
                    const rowProperties = [null];
                    rowProperties.push(null);
                    rowProperties.push(null);
                    rowProperties.push("Properties");

                    for (let h = 0; h < characteristicsNum; h++) {
                        rowIndividual.push(String(`req_${h + 1}`));
                        rowWeights.push(String(`w_${h + 1}`));
                        rowProperties.push(String(`p_${h + 1}`))
                    }

                    addTable.push(rowIndividual)
                    addTable.push(rowWeights)
                    addTable.push(rowProperties)

                }
            } else {
                const rowSet = [`Set_${i + 1}`];
                if (setMany[i] === true) {
                    rowSet.push("Set Many")
                } else {
                    rowSet.push("Set One")
                }
                rowSet.push(null);
                rowSet.push(numberSetIndividuals);
                addTable.push(rowSet)
                for (let k = 0; k < numberSetIndividuals; k++) {
                    const rowIndividual = [`Individual_${k + 1}`];
                    if (setMany[i] === true) {
                        rowIndividual.push(null);
                        //Change
                        rowIndividual.push(1);
                    } else {
                        rowIndividual.push(null);
                        //Change
                        rowIndividual.push("Fill capacity > 0");
                    }
                    rowIndividual.push(`Requirements`)
                    const rowWeights = [null];
                    rowWeights.push(null);
                    rowWeights.push(null);
                    rowWeights.push('Weights');
                    const rowProperties = [null];
                    rowProperties.push(null);
                    rowProperties.push(null);
                    rowProperties.push("Properties");

                    for (let h = 0; h < characteristicsNum; h++) {
                        rowIndividual.push(String(`req_${h + 1}`));
                        rowWeights.push(String(`w_${h + 1}`));
                        rowProperties.push(String(`p_${h + 1}`))
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
        setSetIndividuals(Array.from({ length: value }, () => ''));
        setSetEvaluateFunction(Array.from({ length: value }, () => ''));
        setSetMany(Array.from({ length: value }, () => ''));
    }
    const generateTable = () => {
        const table = [];
        for (let i = 0; i < 4; i++) {
            const row = [];
            if (i === 0) {
                for (let j = 0; j < colNums; j++) {
                    row.push(<th className='th' key={j}>{` Set_${j + 1}`}</th>);
                }
            } else if (i === 1) {
                for (let k = 0; k < colNums; k++) {
                    row.push(<td className="td" key={k}>
                        <label>
                            <input
                                type="checkbox"
                                name={`setType_Set_${k + 1}`}
                                onChange={() => {
                                    const updatedSetMany = [...setMany];
                                    updatedSetMany[k] = !updatedSetMany[k];
                                    setSetMany(updatedSetMany);

                                }}
                            />
                            <h6>Tick if Set_{k + 1} is Many</h6>
                        </label>

                    </td>);
                }
            } else if (i === 2) {
                for (let k = 0; k < colNums; k++) {
                    row.push(<td className="td" key={k}>
                        <input
                            type="text"
                            className='input-table-data'
                            placeholder={`Num individuals Set_${k + 1}`}
                            onChange={(e) => {
                                const newSetIndividuals = [...setIndividuals];
                                newSetIndividuals[k] = e.target.value;
                                setSetIndividuals(newSetIndividuals);

                            }

                            }
                        />
                    </td>);
                }
            } else if (i === 3) {
                for (let k = 0; k < colNums; k++) {
                    row.push(<td className="td" key={k}>
                        <input
                            type="text"
                            className='input-table-data'
                            placeholder={`Evaluate Function Set_${k + 1}`}
                            onChange={(e) => {
                                const newSetEvaluateFunction = [...setEvaluateFunction];
                                newSetEvaluateFunction[k] = e.target.value;
                                setSetEvaluateFunction(newSetEvaluateFunction);
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
                <div className="content-guideline">
                    <h1>Guidance</h1>
                    <p>Step 1: Enter the name of your problem</p>
                    <p>Step 2: Enter the number of sets</p>
                    <p>Step 3: Enter the number of characteristics of all individuals</p>
                    <p>Step 4: Enter the number of total individuals in each set involved</p>
                    <p>Step 5: Enter the fitness function which you initialize</p>
                    <p>Step 6: Click the button "Get Excel Templates" to receive the Excel file that contains all the information you entered above</p>
                    <p>Step 7: Select or drag and drop the Excel file you just received at the dotted line and the "Choose a file" button for the system to process your problem</p>
                </div>
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


