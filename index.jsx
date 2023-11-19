import React from 'react';
import { useState, useEffect } from 'react';
import "./style.scss";
import Input from "../../components/input";
import ExcelImage from '../../images/excel.png'

import * as XLSX from 'xlsx';
import { useContext } from 'react';
import DataContext from "../../context/DataContext"

import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom'

import Loading from '../../components/Loading';
import PopupContext from '../../context/PopupContext';
import ParamSettingBox from '../../components/ParamSettingBox'

export default function MatchingProblemPage() {
    const [excelFile, setExcelFile] = useState(null);

    const [problemName, setProblemName] = useState("");
    const [setNum, setSetNum] = useState("");
    const [characteristicsNum, setCharacteristicsNum] = useState("");
    const [totalIndividualsNum, setTotalIndividualsNum] = useState("");
    const [fitnessFunction, setFitnessFunction] = useState("");

    const [problemNameError, setProblemNameError] = useState("");
    const [setNumError, setSetNumError] = useState("");
    const [characteristicsNumError, setCharacteristicsNumError] = useState("");
    const [totalIndividualsNumError, setTotalIndividualsNumError] = useState("");
    const [fitnessFunctionError, setFitnessFunctionError] = useState("");
    
    const [isLoading, setIsLoading] = useState(false);
    const [excelFileError, setExcelFileError] = useState('');
    const {  setAppData, setGuideSectionIndex } = useContext(DataContext)
    const { displayPopup } = useContext(PopupContext)

    const navigate = useNavigate();

    useEffect(() => {
        if (excelFile) {
            const extension = excelFile.name.split(".").pop();

            if (extension === "xlsx") {
                setExcelFileError("");
                const data = readExcelFile(excelFile);
            } else {
                displayPopup("Something went wrong!", "The file was not an Excel file!", true)
                setExcelFileError("The file was not an Excel file!")

            }
        }
    }, [excelFile])

    const readExcelFile = async (file) => {
        const reader = new FileReader();
        setIsLoading(true)

        try {
            reader.onload = async (e) => {
                const excelData = e.target.result;
                const workbook = XLSX.read(excelData, { type: 'binary' });

                const problemInfo = await loadProblemInfo(workbook, 0);

                console.log("Problem Info: ");
                console.log(problemInfo);
                if (!problemInfo) return // stop processing in case of error

                setAppData({
                    problem: {
                        name: problemInfo.problemName,
                        setNum: problemInfo.setNum,
                        characteristicsNum: problemInfo.characteristicsNum,
                        totalIndividualsNum: problemInfo.totalIndividualsNum,
                        fitnessFunction: problemInfo.fitnessFunction,
                    }   
                })

                setIsLoading(false)
                navigate('/input-processing')

            };
            reader.readAsBinaryString(file);


        } catch (error) {
            setIsLoading(false)
            displayPopup("Something went wrong!", "Check the input file again for contact the admin!", true)
        }
    };

    const loadProblemInfo = async (workbook, sheetNumber) => {
        try {
            const sheetName = await workbook.SheetNames[sheetNumber];
            const problemInfoWorksheet = await workbook.Sheets[sheetName];

            const problemName = await problemInfoWorksheet["B1"].v
            const setNum = await problemInfoWorksheet["B2"].v
            const characteristicsNum = await problemInfoWorksheet["B3"].v
            const totalIndividualsNum = await problemInfoWorksheet["B4"].v
            const fitnessFunction = await problemInfoWorksheet["B5"].v

            
            return {
                problemName,
                setNum,
                characteristicsNum,
                totalIndividualsNum,
                fitnessFunction,
                
            }
        } catch (error) {
            setIsLoading(false)
            displayPopup("Something went wrong!", "Error when loading the Problem Information sheet", true)
        }
    }
     const handleGetExcelTemplate = () => {
        if (validateForm()) {
            //downloadExcel();
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
            setSetNumError("The number of set must not be empty");
            error = true;
        } else {
            setSetNumError("");
        }

        // check if the number of characteristics is empty
        if (!characteristicsNum) {
            setCharacteristicsNumError("The number of characteristics must not be empty");
            error = true;
        } else {
            setCharacteristicsNumError("");
        }
         // check if the number of individuals is empty
         if (!totalIndividualsNum) {
           setTotalIndividualsNumError("Player payoff function must not be empty");
            error = true;
        } else {
            setTotalIndividualsNumError("");
        }

        // check if the fitness function is empty
        if (!fitnessFunction) {
            setFitnessFunctionError("Fitness function must not be empty");
            error = true;
        } else {
            setFitnessFunctionError("");
        }
        if (error) {
            return false
        }
        return true;
    }
    const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();

        // write problem information to sheet1
        const sheet1 = XLSX.utils.aoa_to_sheet([
            ["Problem name", problemName],
            ["Number of set", Number(setNum)],
            ["Number of characteristics", Number(characteristicsNum)],
            ["Total of individuals ", Number(totalIndividualsNum)],
            ["Fitness function", fitnessFunction],
        ]);
    }

        // if there is no error, return true
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
                            text='number'
                            error={setNumError}
                            handleOnChange={(e) => setSetNum(e.target.value)}
                            value={setNum}
                            description="A positive number that reflects the number of set involved to ensure that the resulting is valid"
                            guideSectionIndex={2}

                        />
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
                            message='Number of individuals'
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


    )
}
