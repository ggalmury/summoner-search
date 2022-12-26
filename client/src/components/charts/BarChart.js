import React from "react";
import { Chart, ArcElement } from "chart.js/auto";
import { Bar } from "react-chartjs-2";

const BarChart = ({ chartData, width, height, charOption }) => {
  Chart.register(ArcElement);

  return <Bar width={width} height={height} data={chartData} options={charOption} />;
};

export default BarChart;
