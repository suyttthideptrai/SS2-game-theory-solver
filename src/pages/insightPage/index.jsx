import React from 'react'
import "./style.scss"

import { useNavigate } from 'react-router-dom';
import NothingToShow from '../../components/NothingToShow';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

import { useContext } from 'react';
import DataContext from '../../context/DataContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ExcelImage from '../../images/excel.png'

export default function InsightPage() {
    const { appData } = useContext(DataContext);

    console.log("here we go:");
    console.log(appData.insights);
    Chart.register(...registerables);
    
    const handleExportToExcel = async () => {
        const workbook = XLSX.utils.book_new();
    

        // write fitness values to the first sheet
        const sheet1 = XLSX.utils.aoa_to_sheet([
            ['Iteration', 'NSGAII', 'NSGAIII', 'eMOEA', 'PESA2', 'VEGA'],
        ])
        const totalRun = appData.insights.data.fitnessValues.NSGAII.length
        for (let i = 0; i < totalRun; i++) {
            const row = [i + 1,
            appData.insights.data.fitnessValues.NSGAII[i],
            appData.insights.data.fitnessValues.NSGAIII[i],
            appData.insights.data.fitnessValues.eMOEA[i],
            appData.insights.data.fitnessValues.PESA2[i],
            appData.insights.data.fitnessValues.VEGA[i]]
            XLSX.utils.sheet_add_aoa(sheet1, [row], { origin: - 1 })
        }


        // write runtime values to the second sheet
        const sheet2 = XLSX.utils.aoa_to_sheet([
            ['Iteration', 'NSGAII', 'NSGAIII', 'eMOEA', 'PESA2', 'VEGA'],
        ])
        for (let i = 0; i < totalRun; i++) {
            const row = [i + 1,
            appData.insights.data.runtimes.NSGAII[i],
            appData.insights.data.runtimes.NSGAIII[i],
            appData.insights.data.runtimes.eMOEA[i],
            appData.insights.data.runtimes.PESA2[i],
            appData.insights.data.runtimes.VEGA[i]]
            XLSX.utils.sheet_add_aoa(sheet2, [row], { origin: -1 })
        }

        // write parameter configurations to the third sheet
        const numberOfCores = appData.insights.params.distributedCoreParam == 'all' ? 'All available cores' : appData.insights.params.distributedCoreParam + " cores"
        const sheet3 = XLSX.utils.aoa_to_sheet([
            ["Number of distributed cores", numberOfCores],
            ["Population size", appData.insights.params.populationSizeParam],
            ["Number of crossover generation", appData.insights.params.generationParam],
            ["Optimization execution max time (milliseconds)", appData.insights.params.maxTimeParam],
        ]);

        // write computer specifications to the fourth sheet
        const sheet4 = XLSX.utils.aoa_to_sheet([
            ["Operating System Family", appData.insights.data.computerSpecs.osFamily],
            ["Operating System Manufacturer", appData.insights.data.computerSpecs.osManufacturer],
            ["Operating System Version", appData.insights.data.computerSpecs.osVersion],
            ["CPU Name", appData.insights.data.computerSpecs.cpuName],
            ["CPU Physical Cores", appData.insights.data.computerSpecs.cpuLogicalCores],
            ["CPU Logical Cores", appData.insights.data.computerSpecs.cpuPhysicalCores],
            ["Total Memory", appData.insights.data.computerSpecs.totalMemory],
        ]);

        // add sheets to the workbook
        XLSX.utils.book_append_sheet(workbook, sheet1, 'Fitness Values')
        XLSX.utils.book_append_sheet(workbook, sheet2, 'Runtimes')
        XLSX.utils.book_append_sheet(workbook, sheet3, 'Parameter Configurations');
        XLSX.utils.book_append_sheet(workbook, sheet4, 'Computer Specifications');

        // save the workbook
        const wbout = await XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, "insights.xlsx");
    }


    if (!appData || !appData.problem || !appData.insights) {
        return (
            <NothingToShow />
        )
    }


    // configure the graph data, 10 means 10 iterations
    const graphData = {
        labels: Array.from(Array(10).keys(), x => x + 1),
        datasets: [
            {
                label: 'NSGAII',
                data: appData.insights.data.runtimes.NSGAII,
                fill: false,
                borderColor: '#262A56',
                tension: 0.1
            },
            {
                label: 'NSGAIII',
                data: appData.insights.data.runtimes.NSGAIII,
                fill: false,
                borderColor: '#45CFDD',
                tension: 0.1
            },
            {
                label: 'eMOEA',
                data: appData.insights.data.runtimes.eMOEA,
                fill: false,
                borderColor: '#6527BE',
                tension: 0.1
            },
            {
                label: 'PESA2',
                data: appData.insights.data.runtimes.PESA2,
                fill: false,
                borderColor: '#E11299',
                tension: 0.1
            },
            {
                label: 'VEGA',
                data: appData.insights.data.runtimes.VEGA,
                fill: false,
                borderColor: '#EBB02D',
                tension: 0.1
            }
        ]
    };


    const graphOptions = {
        responsive: true,
        maintainAspectRatio: false,
        width: 600,
        height: 600,
    };

    return (
        <div className='insight-page'>
            <h1 className="problem-name">{appData.problem.name}</h1>
            <p className='header-text'>Insights</p>
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
                            <th class='first-col'>Iteration</th>
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
                                    <td class='first-col'>{index + 1}</td>
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
                <p class='figure-description'>Comparison of Fitness Values across different algorithms</p>

            </div>
            <div className="runtime-graph">
                <Line class='graph' data={graphData} option={graphOptions} />
                <p class='figure-description'>Comparison of runtime (in seconds) across various algorithms</p>

            </div>
        </div>
    );
}