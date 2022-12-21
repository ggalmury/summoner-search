import React from "react";
import { Chart, ArcElement } from "chart.js/auto";
import { Pie } from "react-chartjs-2";

const PieChart = ({ chartData, width }) => {
  Chart.register(ArcElement);

  return <Pie width={width} data={chartData} />;
};

export default PieChart;
