import React from "react";

interface ResultCardProps {
  label: string;
  value: string | number;
  color?: "blue" | "green" | "yellow" | "red";
}

const ResultCard: React.FC<ResultCardProps> = ({ label, value, color = "blue" }) => {
  const colorClasses = {
    blue: "border-blue-400 bg-blue-50 text-blue-800",
    green: "border-green-400 bg-green-50 text-green-800",
    yellow: "border-yellow-400 bg-yellow-50 text-yellow-800",
    red: "border-red-400 bg-red-50 text-red-800",
  };
  
  return (
    <div className={`border-l-4 p-3 rounded-md ${colorClasses[color]}`}>
      <p className="text-xs uppercase tracking-wider">{label}</p>
      <p className="text-lg font-mono font-semibold">{value}</p>
    </div>
  );
};

export default ResultCard;