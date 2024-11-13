import React from "react";
import "../../module/stableMatching/css/processing.scss";
import {useNavigate} from "react-router-dom";
import {useContext, useState, useEffect} from "react";
import axios from "axios";
import DataContext from "../../module/core/context/DataContext";
import NothingToShow from "../../module/core/component/NothingToShow";
import Loading from "../../module/core/component/Loading";
import ParamSettingBox from "../../module/core/component/ParamSettingBox";
import PopupContext from "../../module/core/context/PopupContext";
import { ENDPOINTS } from "../../module/core/context/apiEndpoints"; // Adjust the path as needed

const INVALID_MATH_SYMBOLS = ["π","∞","Σ","√","∛","∜","∫","∬","∭","∮","∯","∰","∱","∲","∳","∀","∁","∂","∃","∄","∅","∆","∇","∈","∉","∊","∋","∌","∍","∎","∏","∐","∑","−","∓","∔","∕","∖","∗","∘","∙","∝","∟","∠","∡","∢","∣","∤","∥","∦","∧","∨","∩","∪","∴","∵","∶","∷","∸","∹","∺","∻","∼","∽","∾","∿","≀","≁","≂","≃","≄","≅","≆","≇","≈","≉","≊","≋","≌","≍","≎","≏","≐","≑","≒","≓","≔","≕","≖","≗","≘","≙","≚","≛","≜","≝","≞","≟","≠","≡","≢","≣","≤","≥","≦","≧","≨","≩","≪","≫","≬","≭","≮","≯","≰","≱","≲","≳","≴","≵","≶","≷","≸","≹","≺","≻","≼","≽","≾","≿","⊀","⊁","⊂","⊃","⊄","⊅","⊆","⊇","⊈","⊉","⊊","⊋","⊌","⊍","⊎","⊏","⊐","⊑","⊒","⊓","⊔","⊕","⊖","⊗","⊘","⊙","⊚","⊛","⊜","⊝","⊞","⊟","⊠","⊡","⊢","⊣","⊤","⊥","⊦","⊧","⊨","⊩","⊪","⊫","⊬","⊭","⊮","⊯","⊰","⊱","⊲","⊳","⊴","⊵","⊶","⊷","⊸","⊹","⊺","⊻","⊼","⊽","⊾","⊿","⋀","⋁","⋂","⋃","⋄","⋅","⋆","⋇","⋈","⋉","⋊","⋋","⋌","⋍","⋎","⋏","⋐","⋑","⋒","⋓","⋔","⋕","⋖","⋗","⋘","⋙","⋚","⋛","⋜","⋝","⋞","⋟","⋠","⋡","⋢","⋣","⋤","⋥","⋦","⋧","⋨","⋩","⋪","⋫","⋬","⋭","⋮","⋯","⋰","⋱","⁺","⁻","⁼","⁽","⁾","ⁿ","₊","₋","₌","₍","₎","✖","﹢","﹣","＋","－","／","＝","÷","±","×","²","³"];

//TODO: algorithm selection
export default function InputProcessingPage() {
    const navigate = useNavigate();
    const {appData, setAppData} = useContext(DataContext);
    const [isLoading, setIsLoading] = useState(false);
    const [algorithm, setAlgorithm] = useState("NSGAII");
    const [distributedCoreParam, setDistributedCoreParam] = useState("all");
    const [problemType, setProblemType] = useState('one-to-one');
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

    // Hàm thay đổi problemType
    const handleChangeProblemType = (event) => {
        setProblemType(event.target.value);
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
            // Validate evaluate func
            for (const func of evaluateFunction) {
                for (const keyword of INVALID_MATH_SYMBOLS){
                    if (func.includes(keyword)) {
                        return displayPopup("Invalid Evaluate Function(s)", `Evaluate function (${func}) contains invalid symbol (${keyword})`, true);
                    }
                }
            }
            // Validate fitness func
            for (const keyword of INVALID_MATH_SYMBOLS){
                if (appData.problem.fitnessFunction.includes(keyword)) {
                    return displayPopup("Invalid Evaluate Function(s)", `Fitness function (${appData.problem.fitnessFunction}) contains invalid symbol (${keyword})`, true);
                }
            }
            console.log(evaluateFunction);

            const requestBody = {
                problemName: appData.problem.nameOfProblem,
                numberOfSets: appData.problem.numberOfSets,
                //numberOfSets: appData.stableMatchingProblem.sets.length,
                numberOfIndividuals: appData.problem.numberOfIndividuals,
                allPropertyNames: appData.problem.characteristics,
                // mapping over the individuals directly from appData.stableMatchingProblem
                // and creating a new array of objects based on the properties of each individual.
                // This assumes that appData.stableMatchingProblem directly contains an array of individuals

                Individuals: appData.problem.individuals.map((individual) => ({
                    // IndividualSet: individual.set,

                    SetType: individual.setType,
                    IndividualName: individual.individualName,
                    Capacity: individual.capacity,
                    Properties: individual.argument.map((arg) => [...arg]),
                })),
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

            //Thêm phần One to One
            const endpoint = problemType === "one-to-one"
                ? ENDPOINTS.ONE_TO_ONE
                : ENDPOINTS.ONE_TO_MANY;

            setIsLoading(true);
            // console.log(evaluateFunctionStrings);
            console.log(
                "MAKE a POST request to: ",
                JSON.stringify(requestBody, null, 2)
            );
            //const res = await axios.post(
            //`http://${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/api/stable-matching-solver`,
            //requestBody
            //);
            //thay đổi phần res này để phù hợp
            const res = await axios.post(endpoint, requestBody);

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

            {/* Lựa chọn Problem type */}
            <div className="problem-type-chooser">
                <p className='problem-type-text bold'>Choose a problem type: </p>
                <select value={problemType} onChange={handleChangeProblemType} className='problem-type-select'>
                    <option value="one-to-one">One to One</option>
                    <option value="one-to-many">One to Many / Many to Many</option>
                </select>
            </div>

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

            {/* Hiển thị thông tin */}
            <div className="info-display">
                <h3>Information:</h3>
                <table className="info-table">
                    <tbody>
                    <tr>
                        <td><strong>Name</strong></td>
                        <td>{appData.problem.nameOfProblem}</td>
                    </tr>
                    <tr>
                        <td><strong>Number of sets</strong></td>
                        <td>{appData.problem.numberOfSets}</td>
                    </tr>
                    <tr>
                        <td><strong>Number of individuals</strong></td>
                        <td>{appData.problem.numberOfIndividuals}</td>
                    </tr>
                    <tr>
                        <td><strong>Attributes</strong></td>
                        <td>{appData.problem.characteristics.join(', ')}</td>
                    </tr>
                    </tbody>
                </table>
            </div>

            {/* Bảng hiển thị dữ liệu Individuals */}
            <div className="individuals-table-container">
                <h2>Individuals Data</h2>
                <table className="individuals-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Set Type</th>
                            <th>Capacity</th>
                            <th>Properties</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appData.problem.individuals.slice(0, 5).map((individual, index) => (
                            <tr key={index}>
                                <td>{individual.individualName}</td>
                                <td>{individual.setType}</td>
                                <td>{individual.capacity}</td>
                                <td>{individual.argument.map((arg, i) => (
                                    <div key={i}>{JSON.stringify(arg)}</div>
                                ))}</td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>
        </div>
    );


}