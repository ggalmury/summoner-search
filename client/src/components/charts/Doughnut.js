import React from "react";
import { Chart, ArcElement } from "chart.js/auto";
import { Doughnut } from "react-chartjs-2";

const BarChart = ({ chartData, width }) => {
  Chart.register(ArcElement);

  return <Doughnut width={width} data={chartData} />;
};

export default BarChart;
