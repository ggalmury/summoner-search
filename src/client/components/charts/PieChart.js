import React from "react";
import { Chart, ArcElement } from "chart.js/auto";
import { Pie } from "react-chartjs-2";

const PieChart = ({ chartData }) => {
  Chart.register(ArcElement);

  return <Pie width="250" data={chartData} />;
};

export default PieChart;
