// import React from 'react'
// import "./style.scss"
// import PlayerResult from '../../components/PlayerResult'
// import ExcelImage from '../../images/excel.png'
// import GraphImage from '../../images/graph.png'
// import { useContext, useEffect, useState } from 'react'
// import DataContext from "../../context/DataContext"
// import { useNavigate } from 'react-router-dom';
// import NothingToShow from '../../components/NothingToShow';
// import Loading from '../../components/Loading';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';
// import Popup from '../../components/Popup';
// import axios from 'axios'
// import ParamSettingBox from '../../components/ParamSettingBox';
// import PopupContext from '../../context/PopupContext'

// import SockJS from 'sockjs-client';
// import { v4 } from 'uuid';
// import { overWS } from 'stompjs'
// import { over } from 'stompjs';


// let stompClient = null
// export default function MatchingOutputPage() {
//   const navigate = useNavigate();
//   const { appData, setAppData } = useContext(DataContext)
//   const { displayPopup } = useContext(PopupContext)
//   const [sessionCode, setSessionCode] = useState(v4())
//   const [loadingMessage, setLoadingMessage] = useState("Processing to get problem insights, please wait...")
//   const [loadingEstimatedTime, setLoadingEstimatedTime] = useState(null)
//   const [loadingPercentage, setLoadingPercentage] = useState()
//   const [distributedCoreParam, setDistributedCoreParam] = useState("all")
//   const [populationSizeParam, setPopulationSizeParam] = useState(1000)
//   const [generationParam, setGenerationParam] = useState(100)
//   const [maxTimeParam, setMaxTimeParam] = useState(5000)

//   const navigateToHome = () => {
//     setAppData(null)
//     navigate('/')
//   }


//   if (appData == null) {
//     return (
//       <NothingToShow />
//     )
//   }

//   const handleExportToExcel = async () => {
//     const workbook = XLSX.utils.book_new();
//     // write result data to sheet 1
//     const sheet1 = XLSX.utils.aoa_to_sheet([
//       ["Fitness value", appData.result.data.fitnessValue],
//       ["Used algorithm", appData.result.params.usedAlgorithm],
//       ["Runtime (in seconds)", appData.result.data.runtime],
//       ["Player name", "Choosen strategy name", "Payoff value"],
//     ]);

//     // append players data to sheet 1
//     appData.result.data.players.forEach(player => {
//       const row = [player.playerName, player.strategyName, player.payoff];
//       XLSX.utils.sheet_add_aoa(sheet1, [row], { origin: -1 });
//     })


//     // write parameter configurations to sheet 2
//     const numberOfCores = appData.result.params.distributedCoreParam == 'all' ? 'All available cores' : appData.result.params.distributedCoreParam + " cores"
//     const sheet2 = XLSX.utils.aoa_to_sheet([
//       ["Number of distributed cores", numberOfCores],
//       ["Population size", appData.result.params.populationSizeParam],
//       ["Number of crossover generation", appData.result.params.generationParam],
//       ["Optimization execution max time (in milliseconds)", appData.result.params.maxTimeParam],
//     ]);

//     // write computer specs to sheet 3
//     const sheet3 = XLSX.utils.aoa_to_sheet([
//       ["Operating System Family", appData.result.data.computerSpecs.osFamily],
//       ["Operating System Manufacturer", appData.result.data.computerSpecs.osManufacturer],
//       ["Operating System Version", appData.result.data.computerSpecs.osVersion],
//       ["CPU Name", appData.result.data.computerSpecs.cpuName],
//       ["CPU Physical Cores", appData.result.data.computerSpecs.cpuLogicalCores],
//       ["CPU Logical Cores", appData.result.data.computerSpecs.cpuPhysicalCores],
//       ["Total Memory", appData.result.data.computerSpecs.totalMemory],
//     ]);

//     // append sheets to workbook
//     XLSX.utils.book_append_sheet(workbook, sheet1, 'Optiomal solution');
//     XLSX.utils.book_append_sheet(workbook, sheet2, 'Parameter Configurations');
//     XLSX.utils.book_append_sheet(workbook, sheet3, 'Computer Specifications');


//     // write workbook to file
//     const wbout = await XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//     const blob = new Blob([wbout], { type: 'application/octet-stream' });
//     saveAs(blob, 'result.xlsx');
//   };

//   const handleGetMoreInsights = () => {
//     setIsShowPopup(true);
//   }

//   const handlePopupOk = async () => {
//     try {
//       setIsShowPopup(false);
//       const body = {
//         specialPlayer: appData.problem.specialPlayer,
//         normalPlayers: appData.problem.players,
//         fitnessFunction: appData.problem.fitnessFunction,
//         defaultPayoffFunction: appData.problem.playerPayoffFunction,
//         conflictSet: appData.problem.conflictSet,
//         distributedCores: distributedCoreParam,
//         populationSize: populationSizeParam,
//         generation: generationParam,
//         maxTime: maxTimeParam,
//       }
      
//       setIsLoading(true);
//       await connectWebSocket() // connect to websocket to get the progress percentage
//       const res = await axios.post(`http://${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/api/problem-result-insights/${sessionCode}`, body);
//       setIsLoading(false);

//       const insights = {
//         data: res.data.data,
//         params: {
//           distributedCoreParam: distributedCoreParam,
//           populationSizeParam: populationSizeParam,
//           generationParam: generationParam,
//           maxTimeParam: maxTimeParam,
//         }
//       }
//       setAppData({ ...appData, insights });
//       closeWebSocketConnection()
//       navigate('/insights') // navigate to insights page
//     } catch (err) {
//       setIsLoading(false);
//       displayPopup("Something went wrong!", "Get insights failed!, please contact the admin!", true)
//     }

//   }

//   const connectWebSocket = async () => {
//     let Sock = new SockJS(`http://${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/ws`);
//     stompClient = over(Sock);
//     await stompClient.connect({}, onConnected, onError);
//   }
//   const onConnected = () => {
//     stompClient.subscribe('/session/' + sessionCode + '/progress', onPrivateMessage);
//     console.log('Connected to websocket server!');
//   }

//   const onError = (err) => {
//     console.log(err);
//     // displayPopup("Something went wrong!", "Connect to server failed!, please contact the admin!", true)
//   }

//   const closeWebSocketConnection = () => {
//     if (stompClient) {
//       stompClient.disconnect();
//     }
//   }

//   const onPrivateMessage = (payload) => {
//     let payloadData = JSON.parse(payload.body);


//     // some return data are to show the progress, some are not
//     // if the data is to show the progress, then it will have the estimated time and percentage
//     if (payloadData.inProgress) {
//       setLoadingEstimatedTime(payloadData.minuteLeft)
//       setLoadingPercentage(payloadData.percentage)
//     } 

//     setLoadingMessage(payloadData.message)

//   }



//   return (
//     <div className='matching-output-page'>
//         {body && (
//                 <div>
//                     <h3>JSON Data to backend:</h3>
//                     <pre style={{ whiteSpace: 'pre-wrap', maxWidth: '800px', overflowX: 'auto' }}>{JSON.stringify(appData.result, null, 2)}</pre>
//                 </div>
//             )}
//     </div>
//   )
// }
