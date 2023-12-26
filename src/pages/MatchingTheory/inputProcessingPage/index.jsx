import React from "react";
import "./style.scss";
import { useNavigate } from "react-router";

import { useContext, useState, useEffect } from "react";
import Individual from "../../../components/Individual";
import axios from "axios";
import DataContext from "../../../context/DataContext";
import NothingToShow from "../../../components/NothingToShow";
import Loading from "../../../components/Loading";
import ParamSettingBox from "../../../components/ParamSettingBox";
import PopupContext from "../../../context/PopupContext";
//TODO: algorithm selection
export default function InputProcessingPage() {
  const navigate = useNavigate();
  const { appData, setAppData } = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [algorithm, setAlgorithm] = useState("NSGAII");
  const [distributedCoreParam, setDistributedCoreParam] = useState("all");
  const [populationSizeParam, setPopulationSizeParam] = useState(1000);
  const [generationParam, setGenerationParam] = useState(100);
  const [maxTimeParam, setMaxTimeParam] = useState(5000);

  const { displayPopup } = useContext(PopupContext);
  const [body, setBody] = useState(null);
  useEffect(() => {
    if (appData && appData.problem) {
      document.title = appData.problem.name;
    }
  }, [appData?.problem]);

  const handleChange = (event) => {
    console.log(event.target.value);
    setAlgorithm(event.target.value);
  };
  // navigate to home page if there is no problem data
  if (!appData || !appData.problem) {
    return <NothingToShow />;
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

        Individuals: appData.problem.individuals.map((Individual) => ({
          IndividualName: Individual.name,
          IndividualSet: Individual.set,
          Properties: Individual.argument.map((arg) => [...arg]),
        })),
        fitnessFunction: appData.problem.fitnessFunction,
        algorithm: algorithm,
        distributedCores: distributedCoreParam,
        populationSize: populationSizeParam,
        generation: generationParam,
        maxTime: maxTimeParam,
      };
      setBody(requestBody);
      setIsLoading(true);
      // console.log(requestBody)
      // console.log("MAKE a POST request to: ", JSON.stringify(requestBody, null, 2));
      const res = await axios.post(
        `http://${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/api/stable-matching-solver`,
        requestBody
      );
      // console.log(res.data.data);
      const runtime = res.data.data.runtime;
      const usedAlgorithm = res.data.data.algorithm;
      console.log(appData);
      console.log(res)

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
      setAppData({ ...appData, result });
      setIsLoading(false);
      console.log(result);

      navigate("/matching-theory/result");
    } catch (err) {
      // console.log(err);
      // setIsLoading(false);
      // displayPopup("Running failed", "Please check the dataset and try again or contact the admin!", true)
    }
  };

  //Display by set
  const set1 = [];
  const set2 = [];
  const set3 = [];
  const set4 = []
  const allSet = [set1, set2, set3, set4];

  appData.problem.individuals.map((individual, index) => {
    if (individual.set === 0) {
      set1.push(
        <div key={index}>
              <Individual key={index}
                index={index}
                allPropertyNames={appData.problem.characteristics}
                IndividualName={individual.name}
                Properties={individual.argument.map((arg) => [...arg])}
              />
            </div>
      );
    }
    if (individual.set === 1) {
      set2.push(
        <div key={index}>
              <Individual key={index}
                index={index}
                allPropertyNames={appData.problem.characteristics}
                IndividualName={individual.name}
                Properties={individual.argument.map((arg) => [...arg])}
              />
            </div>
      );
    }
    if (individual.set === 2) {
      set3.push(
        <div key={index}>
              <Individual key={index}
                index={index}
                allPropertyNames={appData.problem.characteristics}
                IndividualName={individual.name}
                Properties={individual.argument.map((arg) => [...arg])}
              />
            </div>
      );
    }
  })

  //Final Result
  const finalHTML = [];

  for (var i=0; i<appData.problem.numberOfSets;i++) {
    finalHTML.push(
      <div className={`set-${i}`} style={{width:500}}>
        <h4>{`Set ${i+1}`}</h4>
        {allSet[i]}
        </div>
    )
  }

  return (
    <div>
      <div>
        <h3 className="labelName" style={{marginBottom:50}}>INPUT PROCESSING PAGE:</h3>

        <p style={{marginLeft:250}}>Number of sets: {appData.problem.numberOfSets}</p>
        <p style={{marginBottom:50, marginLeft:250}}>Number of Individuals: {appData.problem.numberOfIndividuals}</p>

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
            <div className="algo-chooser" style={{width:1046}}>
                <p className='algorithm-text bold'>Choose an algorithm: </p>

                <select name="" id="" value={algorithm} onChange={handleChange} className='algorithm-select'>
                    <option value="NSGAII">NSGAII</option>
                    <option value="NSGAIII">NSGAIII</option>
                    <option value="eMOEA">MOEA</option>
                    <option value="PESA2">PESA2</option>
                    <option value="VEGA">VEGA</option>
                    <option value="PAES">PAES</option>
                    <option value="IBEA">IBEA</option>
                </select>
            </div>
        {/* <pre style={{ whiteSpace: 'pre-wrap', maxWidth: '800px', overflowX: 'auto' }}>{JSON.stringify(body, null, 2)}</pre> */}
        {/* <div className="player-container" style={{display:"flex"}}>
            {finalHTML}
        </div> */}
      </div>
      <p className="solve-now-btn" onClick={handleSolveNow}>
        Solve now
      </p>
    </div>
  );
}
