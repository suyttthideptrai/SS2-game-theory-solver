import React from "react";
import "./style.scss";
import PlayerResult from "../../../components/PlayerResult";
import ExcelImage from "../../../images/excel.png";
import GraphImage from "../../../images/graph.png";
import { useContext, useEffect, useState } from "react";
import DataContext from "../../../context/DataContext";
import { useNavigate } from "react-router-dom";
import NothingToShow from "../../../components/NothingToShow";
import Loading from "../../../components/Loading";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Popup from "../../../components/Popup";
import axios from "axios";
import ParamSettingBox from "../../../components/ParamSettingBox";
import PopupContext from "../../../context/PopupContext";

import SockJS from "sockjs-client";
import { v4 } from "uuid";
import { overWS } from "stompjs";
import { over } from "stompjs";

import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";

let stompClient = null;
export default function MatchingOutputPage() {
  const navigate = useNavigate();
  const { appData, setAppData } = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowPopup, setIsShowPopup] = useState(false);
  const { displayPopup } = useContext(PopupContext);
  const [sessionCode, setSessionCode] = useState(v4());
  const [loadingMessage, setLoadingMessage] = useState(
    "Processing to get problem insights, please wait..."
  );
  const [loadingEstimatedTime, setLoadingEstimatedTime] = useState(null);
  const [loadingPercentage, setLoadingPercentage] = useState();
  const [distributedCoreParam, setDistributedCoreParam] = useState("all");
  const [populationSizeParam, setPopulationSizeParam] = useState(1000);
  const [generationParam, setGenerationParam] = useState(100);
  const [maxTimeParam, setMaxTimeParam] = useState(5000);

  // const [abc, setABC] = useState([]);
  // const getABC = () => {
  //   axios
  //     .get(
  //       `http://${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/api/stable-matching-result`
  //     )
  //     .then((response) => {
  //       setABC(response.data.data);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  const navigateToHome = () => {
    setAppData(null);
    navigate("/");
  };

  if (appData == null) {
    return <NothingToShow />;
  }

  // const handleExportToExcel = async () => {
  //   const workbook = XLSX.utils.book_new();
  //   // write result data to sheet 1
  //   const sheet1 = XLSX.utils.aoa_to_sheet([
  //     ["Fitness value", appData.result.data.fitnessValue],
  //     ["Used algorithm", appData.result.params.usedAlgorithm],
  //     ["Runtime (in seconds)", appData.result.data.runtime],
  //     ["Player name", "Choosen strategy name", "Payoff value"],
  //   ]);

  //   // append players data to sheet 1
  //   appData.result.data.players.forEach((player) => {
  //     const row = [player.playerName, player.strategyName, player.payoff];
  //     XLSX.utils.sheet_add_aoa(sheet1, [row], { origin: -1 });
  //   });

  //   // write parameter configurations to sheet 2
  //   const numberOfCores =
  //     appData.result.params.distributedCoreParam == "all"
  //       ? "All available cores"
  //       : appData.result.params.distributedCoreParam + " cores";
  //   const sheet2 = XLSX.utils.aoa_to_sheet([
  //     ["Number of distributed cores", numberOfCores],
  //     ["Population size", appData.result.params.populationSizeParam],
  //     ["Number of crossover generation", appData.result.params.generationParam],
  //     [
  //       "Optimization execution max time (in milliseconds)",
  //       appData.result.params.maxTimeParam,
  //     ],
  //   ]);

  //   // write computer specs to sheet 3
  //   const sheet3 = XLSX.utils.aoa_to_sheet([
  //     ["Operating System Family", appData.result.data.computerSpecs.osFamily],
  //     [
  //       "Operating System Manufacturer",
  //       appData.result.data.computerSpecs.osManufacturer,
  //     ],
  //     ["Operating System Version", appData.result.data.computerSpecs.osVersion],
  //     ["CPU Name", appData.result.data.computerSpecs.cpuName],
  //     ["CPU Physical Cores", appData.result.data.computerSpecs.cpuLogicalCores],
  //     ["CPU Logical Cores", appData.result.data.computerSpecs.cpuPhysicalCores],
  //     ["Total Memory", appData.result.data.computerSpecs.totalMemory],
  //   ]);

  //   // append sheets to workbook
  //   XLSX.utils.book_append_sheet(workbook, sheet1, "Optiomal solution");
  //   XLSX.utils.book_append_sheet(workbook, sheet2, "Parameter Configurations");
  //   XLSX.utils.book_append_sheet(workbook, sheet3, "Computer Specifications");

  //   // write workbook to file
  //   const wbout = await XLSX.write(workbook, {
  //     bookType: "xlsx",
  //     type: "array",
  //   });
  //   const blob = new Blob([wbout], { type: "application/octet-stream" });
  //   saveAs(blob, "result.xlsx");
  // };

  const handleGetMoreInsights = () => {
    setIsShowPopup(true);
  };

  const handlePopupOk = async () => {
    try {
      const evaluateFunction = appData.problem.evaluateFunctions || [];

      setIsShowPopup(false);
      const body = {
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
        distributedCores: distributedCoreParam,
        populationSize: populationSizeParam,
        generation: generationParam,
        maxTime: maxTimeParam,
      };

      setIsLoading(true);
      await connectWebSocket(); // connect to websocket to get the progress percentage
      const res = await axios.post(
        `http://${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/api/matching-problem-result-insights/${sessionCode}`,
        body
      );
      setIsLoading(false);

      const insights = {
        data: res.data.data,
        params: {
          distributedCoreParam: distributedCoreParam,
          populationSizeParam: populationSizeParam,
          generationParam: generationParam,
          maxTimeParam: maxTimeParam,
        },
      };
      setAppData({ ...appData, insights });
      closeWebSocketConnection();
      navigate("/insights"); // navigate to insights page
    } catch (err) {
      setIsLoading(false);
      displayPopup(
        "Something went wrong!",
        "Get insights failed!, please contact the admin!",
        true
      );
    }
  };

  const connectWebSocket = async () => {
    let Sock = new SockJS(
      `http://${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/ws`
    );
    stompClient = over(Sock);
    await stompClient.connect({}, onConnected, onError);
  };
  const onConnected = () => {
    stompClient.subscribe(
      "/session/" + sessionCode + "/progress",
      onPrivateMessage
    );
    console.log("Connected to websocket server!");
  };

  const onError = (err) => {
    console.log(err);
    // displayPopup("Something went wrong!", "Connect to server failed!, please contact the admin!", true)
  };

  const closeWebSocketConnection = () => {
    if (stompClient) {
      stompClient.disconnect();
    }
  };

  const onPrivateMessage = (payload) => {
    let payloadData = JSON.parse(payload.body);

    // some return data are to show the progress, some are not
    // if the data is to show the progress, then it will have the estimated time and percentage
    if (payloadData.inProgress) {
      setLoadingEstimatedTime(payloadData.minuteLeft);
      setLoadingPercentage(payloadData.percentage);
    }

    setLoadingMessage(payloadData.message);
  };

  //Get data from sever
  const matchesArray = appData.result.data.matches.matches;
  const leftOversArray = appData.result.data.matches.leftOvers;

  console.log(appData.result.data);
  const fitnessValue = appData.result.data.fitnessValue.toFixed(3);
  const usedAlgorithm = appData.result.data.algorithm;
  const runtime = appData.result.data.runtime.toFixed(3);
  const htmlOutput = [];
  const htmlLeftOvers = [];

  // Loop through result

  let fileContent = "";

  // Success couple

  for (let i = 0, size = matchesArray.length; i < size; i++) {
    let individualMatchesArray = "";
    let semicolon = "; ";
    let matchingIndividual = appData.result.data.individuals[i].IndividualName;
    let indexMatchedArray = matchesArray[i].individualMatches;
    if (matchesArray[i].individualMatches.length === 0) {
      individualMatchesArray = "There are no individual matches";
    } else {
      for (
        let j = 0, size = matchesArray[i].individualMatches.length;
        j < size;
        j++
      ) {
        
        let matchedIndividual =
          appData.result.data.individuals[indexMatchedArray[j]].IndividualName;
          individualMatchesArray += matchedIndividual + semicolon
      }
    }

    fileContent += `${matchingIndividual} -> ${individualMatchesArray}\n`;

    htmlOutput.push(
      <tr className="table-success" key={"C" + i}>
        {/* <td>Couple {index + 1}</td> */}
        <td>{matchingIndividual}</td>
        <td>
          {
            // appData.result.data.individuals[Object.values(match)[2]].IndividualName
            individualMatchesArray
          }
        </td>
        {/* <td>{appData.result.data.matches.coupleFitness[index]}</td> */}
      </tr>
    );
  }

  // matchesArray.forEach((match, index) => {
  //   var individualName =
  //     appData.result.data.individuals[Object.values(match)[1]].IndividualName;
  //   var individualMatches = "";
  //   if (Object.values(match)[2].length == 0) {
  //     individualMatches = "There are no individual matches";
  //   } else {
  //     for (let i = 0; i < Object.values(match)[2].length; i++) {
  //       if (i == Object.values(match)[2].length - 1) {
  //         individualMatches +=
  //           appData.result.data.individuals[Object.values(match)[2][i]]
  //             .IndividualName;
  //       } else
  //         individualMatches +=
  //           appData.result.data.individuals[Object.values(match)[2][i]]
  //             .IndividualName + ", ";
  //     }
  //   }
  //   htmlOutput.push(
  //     <tr className="table-success" key={"C" + index}>
  //       {/* <td>Couple {index + 1}</td> */}
  //       <td>{individualName}</td>
  //       <td>
  //         {
  //           // appData.result.data.individuals[Object.values(match)[2]].IndividualName
  //           individualMatches
  //         }
  //       </td>
  //       {/* <td>{appData.result.data.matches.coupleFitness[index]}</td> */}
  //     </tr>
  //   );
  // });

  // LeftOves
  let leftoverArray = [];
  leftOversArray.forEach((individual, index) => {
    htmlLeftOvers.push(
      <tr className="table-danger" key={"L" + index}>
        <td>{index + 1}</td>
        <td>{appData.result.data.individuals[individual].IndividualName}</td>
      </tr>
    );
    leftoverArray.push(
      appData.result.data.individuals[individual].IndividualName
    );
  });
  fileContent += `Left over = [${leftoverArray}]`;

  fileContent += `Fitness value: ${appData.result.data.fitnessValue}`;
  fileContent += `Runtime: ${appData.result.data.runtime}`;
  // Create a Blob with the content
  const blob = new Blob([fileContent], { type: "text/plain" });

  // Create a download link
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = "output.txt";

  // // Append the link to the body and trigger the click event
  // document.body.appendChild(downloadLink);
  // downloadLink.click();

  // // Remove the link from the body
  // document.body.removeChild(downloadLink);

  // //Change view
  // const changeView = (event, view1, view2) => {
  //   //change style current page
  //   const view1Class = document.getElementsByClassName(view1);
  //   let view1Style = view1Class[0].getAttribute("style");
  //   let array1Style = view1Style.split(";");
  //   array1Style.pop();
  //   array1Style.pop();
  //   array1Style.push("display:block");

  //   let temp1Style = "";
  //   temp1Style += array1Style[0];

  //   view1Class[0].setAttribute("style", temp1Style);

  //   // console.log(view1Style);
  //   // console.log(array1Style);
  //   // console.log(temp1Style);

  //   //change style the other page
  //   const view2Class = document.getElementsByClassName(view2);
  //   let view2Style = view2Class[0].getAttribute("style");
  //   let array2Style = view2Style.split(";");
  //   array2Style.pop();
  //   array2Style.pop();
  //   array2Style.push("display:none");

  //   let temp2Style = "";
  //   temp2Style += array2Style[0];

  //   view2Class[0].setAttribute("style", temp2Style);

  //   // console.log(view2Style);
  //   // console.log(array2Style);
  //   // console.log(temp2Style);
  // };

  function generateColor(index) {
    const colors = ["red", "blue", "green", "orange", "purple", "yellow"]; // Define your desired colors
    const randomIndex = index % colors.length;
    return colors[randomIndex];
  }

  return (
    <div className="matching-output-page">
      <h2 id="head-title">MATCHING THEORY OUTPUT PAGE</h2>
      <Popup
        isShow={isShowPopup}
        setIsShow={setIsShowPopup}
        title={"Get detailed insights"}
        // message={`This process can take estimated ${data.estimatedWaitingTime || 1} minute(s) and you will be redirected to another page. Do you want to continue?`}
        message={`This process can take a while do you to continue?`}
        okCallback={handlePopupOk}
      />

      {/* <Loading isLoading={isLoading} message={`Get more detailed insights. This can take estimated ${data.estimatedWaitingTime || 1} minute(s)...`} /> */}
      <Loading
        isLoading={isLoading}
        percentage={loadingPercentage}
        estimatedTime={loadingEstimatedTime}
        message={loadingMessage}
      />
      <br />
      <p className="below-headertext">Optimal solution</p>
      <div className="output-container">
        <div className="param-box">
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
          <div className="btn insight-btn" onClick={handleGetMoreInsights}>
            <p>Get more insights</p>
            <img src={GraphImage} alt="" />
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-center"></div>
        <div className="result-information">
          <p>Fitness Value: {fitnessValue}</p>
          <p>Used Algorithm: {usedAlgorithm}</p>
          <p>Runtime: {runtime} ms</p>
        </div>
        {/* <div
        className="d-flex align-items-center justify-content-center"
        style={{ marginTop: 30 }}
      >
        <Button
          variant="success"
          size="md"
          style={{
            justifyContent: "center",
            width: 150,
            float: "left",
            marginRight: 5,
            display: "block",
          }}
          onClick={(e) => changeView(e, "view-1", "view-2")}
        >
          Table View
        </Button>
        <Button
          variant="success"
          size="md"
          style={{
            justifyContent: "center",
            width: 150,
            float: "right",
            marginLeft: 5,
          }}
          onClick={(e) => changeView(e, "view-2", "view-1")}
        >
          Graph View
        </Button>
      </div> */}
        <div className="view-1" style={{ display: "block" }}>
          <h3 style={{ marginBottom: 20, marginTop: 40 }}>
            THE COUPLES AFTER GALE-SHAPLEY ALGORITHM
          </h3>
          <Table striped bordered hover responsive>
            <thead>
              <tr className="table-success">
                {/* <th>#</th> */}
                <th>First Partner</th>
                <th>Second Partner</th>
                <th>Couple fitness</th>
              </tr>
            </thead>
            <tbody>{htmlOutput}</tbody>
          </Table>

          <h3 style={{ marginTop: 50, marginBottom: 20 }}>
            THE LEFTOVERS AFTER GALE-SHAPLEY ALGORITHM
          </h3>
          <Table striped bordered hover responsive>
            <thead>
              <tr className="table-danger">
                <th>No.</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>{htmlLeftOvers}</tbody>
          </Table>
          <div className="d-grid gap-2">
            <Button
              variant="primary"
              size="md"
              style={{ justifyContent: "center", margin: "auto", width: 150 }}
            >
              Get Result
            </Button>
          </div>
        </div>
        {/* {console.log(appData.result.data.individuals)} */}
      </div>
    </div>
  );
}
