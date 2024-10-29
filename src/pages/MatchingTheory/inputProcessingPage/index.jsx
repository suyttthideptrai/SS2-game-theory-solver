import React from "react";
import "./style.scss";
import {useNavigate} from "react-router-dom";

import {useContext, useState, useEffect} from "react";
import axios from "axios";
import DataContext from "../../../context/DataContext";
import NothingToShow from "../../../components/NothingToShow";
import Loading from "../../../components/Loading";
import ParamSettingBox from "../../../components/ParamSettingBox";
import PopupContext from "../../../context/PopupContext";
//TODO: algorithm selection
export default function InputProcessingPage() {
    const navigate = useNavigate();
    const {appData, setAppData} = useContext(DataContext);
    const [isLoading, setIsLoading] = useState(false);
    const [algorithm, setAlgorithm] = useState("NSGAII");
    const [distributedCoreParam, setDistributedCoreParam] = useState("all");
    const [populationSizeParam, setPopulationSizeParam] = useState(1000);
    const [generationParam, setGenerationParam] = useState(100);
    const [maxTimeParam, setMaxTimeParam] = useState(5000);

    const {displayPopup} = useContext(PopupContext);
    const [body, setBody] = useState(null);
    useEffect(() => {
        if (appData && appData.problem) {
            document.title = appData.problem.name;
        }
    }, [appData?.problem]);

    const handleChange = (event) => {
        setAlgorithm(event.target.value);
    };
    // navigate to home page if there is no problem data
    if (!appData || !appData.problem) {
        return <NothingToShow/>;
    }

    const handleSolveNow = async () => {
        try {
            if (!appData || !appData.problem) {
                displayPopup("Error", "Stable Matching Problem data is missing.", true);
                return;
            }

            const evaluateFunction = appData.problem.evaluateFunctions || [];
            // const evaluateFunctionStrings = evaluateFunction.flatMap(item => Object.entries(item));
            // const evaluateFunctionStrings = evaluateFunction.map(item => ({

            // }))
            console.log(evaluateFunction);

            const requestBody = {
                problemName: appData.problem.nameOfProblem,
                numberOfSets: appData.problem.numberOfSets,
                //numberOfSets: appData.stableMatchingProblem.sets.length,
                numberOfIndividuals: appData.problem.numberOfIndividuals,
                numberOfProperty: appData.problem.characteristicsNum,
                individualSetIndexes: appData.problem.individualSetIndexes,
                individualCapacities: appData.problem.individualCapacities,
                individualProperties: appData.problem.individualProperties,
                individualRequirements: appData.problem.individualRequirements,
                individualWeights: appData.problem.individualWeights,
//                 Individuals: appData.problem.individuals.map((individual) => ({
//                     // IndividualSet: individual.set,
//
//                     SetType: individual.setType,
//                     IndividualName: individual.individualName,
//                     Capacity: individual.capacity,
//                     Properties: individual.argument.map((arg) => [...arg]),
//                 })),
                fitnessFunction: appData.problem.fitnessFunction,
                // evaluateFunction: Object.fromEntries(evaluateFunctionStrings),
                evaluateFunction: evaluateFunction,

                algorithm: algorithm,
                distributedCores: distributedCoreParam,
                populationSize: populationSizeParam,
                generation: generationParam,
                maxTime: maxTimeParam,
            };
            // console.log("Evaluate Function:", appData?.problem?.evaluateFunction);
            // console.log("Request Body:", requestBody);
            setBody(requestBody);
            setIsLoading(true);
            // console.log(evaluateFunctionStrings);
            console.log(
                "MAKE a POST request to: ",
                JSON.stringify(requestBody, null, 2)
            );
            const res = await axios.post(
                `http://${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/api/stable-matching-solver`,
                requestBody
            );
            console.log(res.data.data);
            const runtime = res.data.data.runtime;
            const usedAlgorithm = res.data.data.algorithm;

            const result = {
                data: res.data.data,
                params: {
                    usedAlgorithm: usedAlgorithm,
                    distributedCoreParam: distributedCoreParam,
                    populationSizeParam: populationSizeParam,
                    generationParam: generationParam,
                    maxTimeParam: maxTimeParam
                }
            };

            setAppData({...appData, result});
            setIsLoading(false);
            console.log(result);
            navigate('/matching-theory/result')
        } catch (err) {
            //  console.log(err);
            // setIsLoading(false);
            // displayPopup("Running failed", "Please check the dataset and try again or contact the admin!", true)
        }
    };

    return (
        <div className='input-processing-page'>
            <Loading isLoading={isLoading} message='Solve your problem, please do not close this window...'/>
            <h1 className="problem-name">{appData.problem.name}</h1>

            <ParamSettingBox
                distributedCoreParam={distributedCoreParam}
                setDistributedCoreParam={setDistributedCoreParam}
                generationParam={generationParam}
                setGenerationParam={setGenerationParam}
                populationSizeParam={populationSizeParam}
                setPopulationSizeParam={setPopulationSizeParam}
                maxTimeParam={maxTimeParam}
                setMaxTimeParam={setMaxTimeParam}
            />
            {
                algorithm == 'PAES' &&
                <p className="error-text">Population size takes no effect for PAES algorithm</p>

            }
            <div className="algo-chooser">
                <p className='algorithm-text bold'>Choose an algorithm: </p>

                <select name="" id="" value={algorithm} onChange={handleChange} className='algorithm-select'>
                    <option value="NSGAII">NSGAII</option>
                    <option value="NSGAIII">NSGAIII</option>
                    <option value="eMOEA">εMOEA</option>
                    <option value="PESA2">PESA2</option>
                    <option value="VEGA">VEGA</option>
                    <option value="PAES">PAES</option>
                    <option value="MOEAD">MOEAD</option>
                </select>
            </div>
            <div>
                <p className="solve-now-btn" onClick={handleSolveNow}>
                    Solve now
                </p>
                {body && (
                    <div>
                        <h3>JSON Data to backend:</h3>
                        <pre
                            style={{
                                whiteSpace: "pre-wrap",
                                maxWidth: "800px",
                                overflowX: "auto",
                            }}
                        >
            {JSON.stringify(body, null, 2)}
          </pre>
                    </div>
                )}
            </div>
            // {/* <p className="playerNum bold">{appData.Ind} {appData.problem.players.length < 2 ? 'Player' : "Players"}  </p> */}

            // {/* <div className="player-container">
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
    );
}