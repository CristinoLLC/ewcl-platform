"use client";

import { useState } from "react";

export default function UploadForm({ setResults, setBenchmarkData }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    
    // Example submission logic (to be implemented)
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      // Call your API endpoint
      // const response = await fetch("/api/ewcl-infer", {
      //   method: "POST",
      //   body: formData,
      // });
      
      // const data = await response.json();
      // setResults(data.results);
      // setBenchmarkData(data.benchmark);
      
      // For now, just mock some data
      setTimeout(() => {
        setResults({ score: 0.75, risk: "Medium" });
        setBenchmarkData([
          { name: "Your Protein", score: 0.75 },
          { name: "Avg. Stable", score: 0.3 },
          { name: "Avg. Unstable", score: 0.8 },
        ]);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error processing protein structure:", error);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          id="protein-file"
          className="hidden"
          accept=".pdb,.cif"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <label
          htmlFor="protein-file"
          className="cursor-pointer text-blue-600 hover:text-blue-800"
        >
          {file ? file.name : "Click to upload protein structure file (.pdb or .cif)"}
        </label>
      </div>
      
      <button
        type="submit"
        disabled={!file || loading}
        className={`w-full py-2 px-4 rounded-md ${
          !file || loading
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading ? "Analyzing..." : "Analyze Structure"}
      </button>
    </form>
  );
}