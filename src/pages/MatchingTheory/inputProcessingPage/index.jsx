import React from 'react'
import "./style.scss"
import { useNavigate } from 'react-router'

import { useContext, useState, useEffect } from 'react'
import Player from '../../../components/Player';
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
    console.log(appData.problem);
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
    console.log(appData.problem);
    const handleSolveNow = async () => {
        try {
            if (!appData || !appData.problem) {
                displayPopup("Error", "Stable Matching Problem data is missing.", true);
                return;
            }
        
            const body = {
                problemName: appData.problem.nameOfProblem,
                setNumber: appData.problem.numberOfSets,
                //numberOfSets: appData.stableMatchingProblem.sets.length,
                individualNumber: appData.problem.numberOfIndividuals,
                allPropertyName: appData.problem.characteristics,
                // mapping over the individuals directly from appData.stableMatchingProblem 
                // and creating a new array of objects based on the properties of each individual. 
                // This assumes that appData.stableMatchingProblem directly contains an array of individuals
            
                individuals: appData.problem.individuals.map(individual => ({
                    name: individual.name,
                    set: individual.set,
                    
                    argument: individual.argument.map((arg) => [...arg]),
                })),
                fitnessFunction: appData.problem.fitnessFunction,
                // algorithm: algorithm,
                // distributedCores: distributedCoreParam,
                // populationSize: populationSizeParam,
                // generation: generationParam,
                // maxTime: maxTimeParam,
            }
            setIsLoading(true);
            console.log("MAKE a POST request to: ", body);
            const res = await axios.post(
                `http://${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/api/stable-matching-solver`,
                body
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
            navigate('/result')
        } catch (err) {
            console.log(err);
            setIsLoading(false);
            displayPopup("Running failed", "Please check the dataset and try again or contact the admin!", true)
        }

    }



    return (
        // <div className='input-processing-page'>
        //     <Loading isLoading={isLoading} message='Solve your problem, please do not close this window...' />
        //     <h1 className="problem-name">{appData.problem.name}</h1>




        //     <ParamSettingBox
        //         distributedCoreParam={distributedCoreParam}
        //         setDistributedCoreParam={setDistributedCoreParam}
        //         generationParam={generationParam}
        //         setGenerationParam={setGenerationParam}
        //         populationSizeParam={populationSizeParam}
        //         setPopulationSizeParam={setPopulationSizeParam}
        //         maxTimeParam={maxTimeParam}
        //         setMaxTimeParam={setMaxTimeParam}
        //     />
        //     {
        //         algorithm == 'PAES' &&
        //         <p className="error-text">Population size takes no effect for PAES algorithm</p>

        //     }
        //     <div className="algo-chooser">
        //         <p className='algorithm-text bold'>Choose an algorithm: </p>

        //         <select name="" id="" value={algorithm} onChange={handleChange} className='algorithm-select'>
        //             <option value="NSGAII">NSGAII</option>
        //             <option value="NSGAIII">NSGAIII</option>
        //             <option value="eMOEA">εMOEA</option>
        //             <option value="PESA2">PESA2</option>
        //             <option value="VEGA">VEGA</option>
        //             <option value="PAES">PAES</option>
        //             <option value="IBEA">IBEA</option>
        //         </select>
        //     </div>

            <p className="solve-now-btn" onClick={handleSolveNow}>Solve now</p>
            // {/* <p className="playerNum bold">{appData.Ind} {appData.problem.players.length < 2 ? 'Player' : "Players"}  </p> */}

    //         {/* <div className="player-container">
    //         {appData.problem && appData.problem.individuals.map((individual, index) => (
    //     <div key={index}>
    //       <p className="individual-info">
    //         <span className="bold">Name:</span> {individual.name}, 
    //         <span className="bold"> Set:</span> {individual.set}
    //       </p>
    //       <p className="characteristics-info">
    //         <span className="bold">Characteristics:</span> {individual.characteristics.join(', ')}
    //       </p>
    //       <p className="argument-info">
    //         <span className="bold">Argument:</span> {JSON.stringify(individual.argument)}
    //       </p>
    //     </div>
    //   ))}
    //         </div> */}
        // </div>
    )
}