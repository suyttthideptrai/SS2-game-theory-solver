import React, { useContext } from "react";
import "../module/core/asset/css/insight.scss";
import NothingToShow from "../module/core/component/NothingToShow";
import { Chart, registerables } from "chart.js";
import DataContext from "../module/core/context/DataContext";
import { saveAs } from "file-saver";
import ExcelImage from "../module/core/asset/image/excel.png";
import { exportInsights } from "../utils/excel_utils";
import InsightsGraph from "../module/core/component/InsightsGraph";

export default function InsightPage() {
    const { appData } = useContext(DataContext);

    console.log("here we go:");
    console.log(appData.insights);
    Chart.register(...registerables);

    const handleExportToExcel = async () => {
        const blob = exportInsights(
            appData.insights.data.fitnessValues,
            appData.insights.data.runtimes,
            appData.insights.data.computerSpecs,
            appData.insights.params,
        );
        saveAs(blob, "insights.xlsx");
    };

    if (!appData || !appData.problem || !appData.insights) {
        return <NothingToShow />;
    }

    return (
        <div className="insight-page">
            <h1 className="problem-name">{appData.problem.name}</h1>
            <p className="header-text">Insights</p>
            <div className="row">
                <div className="btn" onClick={handleExportToExcel}>
                    <p>Export to Excel</p>
                    <img src={ExcelImage} alt="" />
                </div>
            </div>
            <div className="fitness-table">
                <table>
                    <thead>
                        <tr>
                            <th className="first-col">Iteration</th>
                            <th>NSGAII</th>
                            <th>NSGAIII</th>
                            <th>eMOEA</th>
                            <th>PESA2</th>
                            <th>VEGA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            // loop from 1 to 10
                            Array.from(Array(10).keys()).map((index) => (
                                <tr key={index}>
                                    <td className="first-col">{index + 1}</td>
                                    <td>{appData.insights.data.fitnessValues.NSGAII[index]}</td>
                                    <td>{appData.insights.data.fitnessValues.NSGAIII[index]}</td>
                                    <td>{appData.insights.data.fitnessValues.eMOEA[index]}</td>
                                    <td>{appData.insights.data.fitnessValues.PESA2[index]}</td>
                                    <td>{appData.insights.data.fitnessValues.VEGA[index]}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                <p className="figure-description">
                    Comparison of Fitness Values across different algorithms
                </p>
            </div>
            <div className="runtime-graph">
              <InsightsGraph runtimes={appData.insights.data.runtimes}/>
                <p className="figure-description">
                    Comparison of runtime (in seconds) across various algorithms
                </p>
            </div>
        </div>
    );
}
