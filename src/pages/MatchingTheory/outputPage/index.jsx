import React from 'react'
import "./style.scss"
// import ExcelImage from '../../images/excel.png'
// import GraphImage from '../../images/graph.png'
import { useContext, useEffect, useState } from 'react'
import DataContext from "../../../context/DataContext"
import { useNavigate } from 'react-router-dom';
import NothingToShow from '../../../components/NothingToShow';
import Loading from '../../../components/Loading';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';
import Popup from '../../../components/Popup';
import axios from 'axios'
import ParamSettingBox from '../../../components/ParamSettingBox';
import PopupContext from '../../../context/PopupContext'

import SockJS from 'sockjs-client';
import { v4 } from 'uuid';
import { overWS } from 'stompjs'
import { over } from 'stompjs';



let stompClient = null
export default function MatchingOutputPage() {
  const navigate = useNavigate();
  const { appData, setAppData } = useContext(DataContext)
  const { displayPopup } = useContext(PopupContext)
  const [isLoading, setIsLoading] = useState(false);
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [body, setBody] = useState(null);
  const [sessionCode, setSessionCode] = useState(v4())
  const [loadingMessage, setLoadingMessage] = useState("Processing to get problem insights, please wait...")
  const [loadingEstimatedTime, setLoadingEstimatedTime] = useState(null)
  const [loadingPercentage, setLoadingPercentage] = useState()
  const [distributedCoreParam, setDistributedCoreParam] = useState("all")
  const [populationSizeParam, setPopulationSizeParam] = useState(1000)
  const [generationParam, setGenerationParam] = useState(100)
  const [maxTimeParam, setMaxTimeParam] = useState(5000)
  const [resultData, setResultData] = useState(null);

//   const navigateToHome = () => {
//     setAppData(null)
//     navigate('/')
//   }


  if (appData == null) {
    return (
      <NothingToShow />
    )
  }


  const handlePopupOk = async () => {
    try {
      setIsShowPopup(false);
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
        
      }
      setBody(requestBody);
      setIsLoading(true);
      await connectWebSocket() // connect to websocket to get the progress percentage
      const res = await axios.post(`http://${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/api/problem-result-insights/${sessionCode}`, requestBody);
      setIsLoading(false);

      const insights = {
        data: res.data.data,
        params: {
          distributedCoreParam: distributedCoreParam,
          populationSizeParam: populationSizeParam,
          generationParam: generationParam,
          maxTimeParam: maxTimeParam,
        }
      }
      setAppData({ ...appData, insights });
      setResultData(insights);
      closeWebSocketConnection()
      navigate('/insights') // navigate to insights page
    } catch (err) {
      setIsLoading(false);
      displayPopup("Something went wrong!", "Get insights failed!, please contact the admin!", true)
    }

  }

  const connectWebSocket = async () => {
    let Sock = new SockJS(`http://${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/ws`);
    stompClient = over(Sock);
    await stompClient.connect({}, onConnected, onError);
  }
  const onConnected = () => {
    stompClient.subscribe('/session/' + sessionCode + '/progress', onPrivateMessage);
    console.log('Connected to websocket server!');
  }

  const onError = (err) => {
    console.log(err);
    // displayPopup("Something went wrong!", "Connect to server failed!, please contact the admin!", true)
  }

  const closeWebSocketConnection = () => {
    if (stompClient) {
      stompClient.disconnect();
    }
  }

  const onPrivateMessage = (payload) => {
    let payloadData = JSON.parse(payload.body);


    // some return data are to show the progress, some are not
    // if the data is to show the progress, then it will have the estimated time and percentage
    if (payloadData.inProgress) {
      setLoadingEstimatedTime(payloadData.minuteLeft)
      setLoadingPercentage(payloadData.percentage)
    } 

    setLoadingMessage(payloadData.message)

  }


  function generateColor(index) {
    const colors = ['red', 'blue', 'green', 'orange', 'purple', 'yellow']; // Define your desired colors
    const randomIndex = index % colors.length;
    return colors[randomIndex];
  }

  

  return (
    <div className='output-page'>
      <Popup
        isShow={isShowPopup}
        setIsShow={setIsShowPopup}
        title={"Get detailed insights"}
        // message={`This process can take estimated ${data.estimatedWaitingTime || 1} minute(s) and you will be redirected to another page. Do you want to continue?`}
        message={`This process can take a while do you to continue?`}
        okCallback={handlePopupOk}
      />

      {/* <Loading isLoading={isLoading} message={`Get more detailed insights. This can take estimated ${data.estimatedWaitingTime || 1} minute(s)...`} /> */}
      <Loading isLoading={isLoading}
        percentage={loadingPercentage}
        estimatedTime={loadingEstimatedTime}
        message={loadingMessage} />
      <h1 className="problem-name">{appData.problem.nameOfProblem}</h1>
      <br />
      <p className='below-headertext'>Solution</p>


      <br />
      <p className='below-headertext'> Fitness value: {appData.result.data.fitnessValue}</p>

      <p className='below-headertext'> Number of Sets: {appData.problem.numberOfSets}</p>

      <p className='below-headertext'> Number of Individuals: {appData.problem.numberOfIndividuals}</p>
      <br />
      
      <div className="table-matches-container">

        {/* Create a graph (Other view of table) */}
        <svg className="chart" viewBox="0 0 1200 600">
              {appData.result.data.matches.matches &&
                appData.result.data.matches.leftOvers &&
                appData.result.data.matches.matches.map((match, index) => {
                  const color = generateColor(index);
                  const startX = 300;
                  const startY = 50 + index * 50;
                  const endX = 900;
                  const endY = startY;
                  const lineStyle = { stroke: color, strokeWidth: 5 };

                  return (
                    <React.Fragment key={index}>
                      <line x1={startX} y1={startY} x2={endX} y2={endY} style={lineStyle} />
                      <circle cx={startX} cy={startY} r={6} fill={color} />
                      <circle cx={endX} cy={endY} r={6} fill={color} />
                      <text x={startX - 30} y={startY} fill={color}>
                        {match.individual1Index}
                      </text>
                      <text x={endX + 10} y={endY} fill={color}>
                        {match.individual2Index}
                      </text>
                    </React.Fragment>
                  );
                })}
            </svg>
        
        
        {/* Create a result table */}
        <div className="grid-container">
          {/* const {No, Individual_1_Index, Individual_2_Index, IndividualMatches, Capacity} = JSON.stringify(match) */}
          <div className="column head-column0">No</div>
          <div className="column head-column1">Individual_1_Index</div>
          <div className="column head-column2">Individual_2_Index</div>
          <div className="column head-column3">IndividualMatches</div>
          <div className="column head-column4">Capacity</div>
          <div className="column head-column5">LeftOvers</div>
          
        </div>

        {appData.result.data.matches.matches && appData.result.data.matches.leftOvers &&(
            // Use .map to iterate over the matches array
            appData.result.data.matches.matches.map((match, index) => (
                <div key={index} className="grid-container">
                    <div className="column">{index + 1}</div>
                    <div className="column">{match.individual1Index}</div>
                    <div className="column">{match.individual2Index}</div>
                    <div className="column">{match.individualMatches !== null ? match.individualMatches : "null"}</div>
                    <div className="column">{match.capacity}</div>
                    <div className="column">{appData.result.data.matches.leftOvers[index]}</div>
                    {/* <div className="column">{JSON.stringify(match)}</div> */}
                </div>
            ))
        )}
      </div>

      <br />

      {/* <div className="table-leftOvers-container">
        <div className="grid-container">
          
          <div className="column head-column5">No</div>
          <div className="column head-column5">Leftovers</div>
          
        </div>

        {appData.result.data.matches.leftOvers&&(
            // Use .map to iterate over the matches array
            appData.result.data.matches.leftOvers.map((leftOver, index) => (
                <div key={index} className="grid-container">
                    <div className="column">{JSON.stringify(leftOver)}</div>
                </div>
            ))

        )}
      </div> */}


      <button id="toggle-btn" onclick="toggleView()">Toggle View</button>
      <div id="graph-view">
        {/* Graph view implementation goes here */}
      </div>
      <table id="table-view">
        {/* Table view implementation goes here */}
      </table>

    </div>
    
  )
}


