import React from 'react'
import "./style.scss"
import { useNavigate } from 'react-router'

import { useContext, useState, useEffect } from 'react'
import Individual from '../../../components/Individual';
import axios from 'axios';
import DataContext from "../../../context/DataContext"
import NothingToShow from '../../../components/NothingToShow';
import Loading from '../../../components/Loading';
import ParamSettingBox from '../../../components/ParamSettingBox';
import PopupContext from '../../../context/PopupContext';
//TODO: algorithm selection
export default function InputProcessingPage() {
    const navigate = useNavigate();
    const { appData, setAppData } = useContext(DataContext);
    const [isLoading, setIsLoading] = useState(false);
    const [algorithm, setAlgorithm] = useState('NSGAII');
    const [distributedCoreParam, setDistributedCoreParam] = useState("all")
    const [populationSizeParam, setPopulationSizeParam] = useState(1000)
    const [generationParam, setGenerationParam] = useState(100)
    const [maxTimeParam, setMaxTimeParam] = useState(5000)

    const { displayPopup } = useContext(PopupContext)
    const [body, setBody] = useState(null);
    useEffect(() => {
        if (appData && appData.problem) {
            document.title = appData.problem.name;
        }
    }, [appData?.problem]);

    const handleChange = (event) => {
        setAlgorithm(event.target.value);
    }
    // navigate to home page if there is no problem data
    if (!appData || !appData.problem) {
        return (
            <NothingToShow />
        )
    }
    const handleSolveNow = async () => {
        try {
            if (!appData || !appData.problem) {
                displayPopup("Error", "Stable Matching Problem data is missing.", true);
                return;
            }

            const requestBody = {
                problemName: appData.problem.nameOfProblem,
                numberOfSets: appData.problem.numberOfSets,
                //numberOfSets: appData.stableMatchingProblem.sets.length,
                numberOfIndividuals: appData.problem.numberOfIndividuals,
                allPropertyNames: appData.problem.characteristics,
                // mapping over the individuals directly from appData.stableMatchingProblem 
                // and creating a new array of objects based on the properties of each individual. 
                // This assumes that appData.stableMatchingProblem directly contains an array of individuals

                Individuals: appData.problem.individuals.map(Individual => ({
                    IndividualName: Individual.name,
                    IndividualSet: Individual.set,
                    Properties: Individual.argument.map((arg) => [...arg]),
                })),
                fitnessFunction: appData.problem.fitnessFunction,
                // algorithm: algorithm,
                // distributedCores: distributedCoreParam,
                // populationSize: populationSizeParam,
                // generation: generationParam,
                // maxTime: maxTimeParam,
            }
            setBody(requestBody);
            setIsLoading(true);
            console.log(requestBody)
            console.log("MAKE a POST request to: ", JSON.stringify(requestBody, null, 2));
            const res = await axios.post(
                `http://${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/api/stable-matching-solver`,
                requestBody
            );
            console.log(res.data.data);
            const runtime = res.data.data.runtime;
            const usedAlgorithm = res.data.data.algorithm;
            console.log(appData);

            const result = {
                data: res.data.data,
                // params: {
                //     usedAlgorithm: usedAlgorithm,
                //     distributedCoreParam: distributedCoreParam,
                //     populationSizeParam: populationSizeParam,
                //     generationParam: generationParam,
                //     maxTimeParam: maxTimeParam
                // }

            }
            setAppData({ ...appData, result });
            setIsLoading(false);
            console.log(result);
            //navigate('/result')
        } catch (err) {
            // console.log(err);
            // setIsLoading(false);
            // displayPopup("Running failed", "Please check the dataset and try again or contact the admin!", true)
        }

    }

    return (
        <div>

            <p className="solve-now-btn" onClick={handleSolveNow}>Solve now</p>
            {body && (
                <div>
                    <h3 className='labelName'>INPUT MATCHING THEORY:</h3>
                    {/* <pre style={{ whiteSpace: 'pre-wrap', maxWidth: '800px', overflowX: 'auto' }}>{JSON.stringify(body, null, 2)}</pre> */}
                    <div className="player-container">
                        {appData.problem.individuals.map((individual, index) => (
                        <div key={index}>
                            <Individual index={index} allPropertyNames={appData.problem.characteristics} IndividualName={individual.name} Properties={individual.argument.map((arg) => [...arg])} />
                        </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}