import React from 'react';
import { Component } from '../types';
import { PriceResult } from '../lib/priceEstimation';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ComponentPriceChartProps {
  component: Component;
  priceResults: PriceResult[];
}

const ComponentPriceChart: React.FC<ComponentPriceChartProps> = ({ component, priceResults }) => {
  // Only render the chart if we have price data
  if (!priceResults || priceResults.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-500">No price data available to display.</p>
      </div>
    );
  }

  // Prepare data for chart
  const chartData = {
    labels: priceResults.map(result => result.source.charAt(0).toUpperCase() + result.source.slice(1)),
    datasets: [
      {
        label: 'Price',
        data: priceResults.map(result => result.price),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)', // blue
          'rgba(255, 99, 132, 0.6)', // red
          'rgba(255, 206, 86, 0.6)', // yellow
          'rgba(75, 192, 192, 0.6)', // green
          'rgba(153, 102, 255, 0.6)', // purple
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: $${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          },
          font: {
            size: 10,
          },
        },
        title: {
          display: false,
        },
        grid: {
          display: false,
        }
      },
      x: {
        ticks: {
          font: {
            size: 10,
          }
        },
        grid: {
          display: false,
        }
      }
    },
    animation: {
      duration: 500,
    },
    layout: {
      padding: 0,
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2">
      <div style={{ height: '100px' }}>
        <Bar data={chartData} options={options} height={100} />
      </div>
    </div>
  );
};

export default ComponentPriceChart;