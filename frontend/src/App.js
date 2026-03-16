import React, { useState } from "react";
import "./App.css";
import { FaRobot } from "react-icons/fa";
import { FaFileUpload } from "react-icons/fa";
import jsPDF from "jspdf";

function App() {

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");

  const handleUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
  };

  const analyzeResume = async () => {

  console.log("Analyze button clicked");

  if (!file) {
    alert("Please upload a resume first");
    return;
  }

  setLoading(true);

  const formData = new FormData();
  formData.append("resume", file);
  formData.append("jobDescription", jobDescription);

  try {

    const response = await fetch("https://resume-analyzer-e2e5.onrender.com/analyze", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    console.log("API Response:", data);

    setResult(data);

  } catch (error) {
    console.error("API Error:", error);
  }

  setLoading(false);
};

  const downloadReport = () => {

    const doc = new jsPDF();

    doc.text("Resume Analysis Report",20,20);

    doc.text(`ATS Score: ${result.atsScore}%`,20,40);
    doc.text(`Job Match Score: ${result.matchScore}%`,20,50);

    doc.text("Detected Skills:",20,70);
    doc.text(result.detectedSkills.join(", "),20,80);

    doc.text("Missing Skills:",20,100);
    doc.text(result.missingSkills.join(", "),20,110);

    doc.save("resume-report.pdf");
  };

  return (

    <div className="page">

      <div className="container">

        <div className="header">
          <FaRobot className="logo"/>
          <h1>AI Resume Analyzer</h1>
        </div>

        <p className="subtitle">
          Upload your resume and get instant ATS feedback
        </p>

        <textarea
          placeholder="Paste Job Description here..."
          value={jobDescription}
          onChange={(e)=>setJobDescription(e.target.value)}
          className="job-box"
        />

        <div
          className="drop-area"
          onDrop={handleDrop}
          onDragOver={(e)=>e.preventDefault()}
        >

          <FaFileUpload className="upload-icon"/>

          <p>Drag & Drop Resume</p>
          <p className="small">or upload manually</p>

          <input type="file" onChange={handleUpload} />

          {file && (
            <div>
              <p className="file-name">{file.name}</p>
              <p style={{color:"#22c55e",fontSize:"13px"}}>
                Resume uploaded successfully
              </p>
            </div>
          )}

        </div>

        <button onClick={analyzeResume}>Analyze Resume</button>

        {loading && <div className="loader"></div>}

        {result && (

          <div className="results">

            <div className="dashboard">

              {/* ATS SCORE */}
              <div className="card">
                <h3>ATS Score</h3>

                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width:`${result.atsScore}%`,
                      background:
                        result.atsScore < 40
                          ? "#ef4444"
                          : result.atsScore < 70
                          ? "#f59e0b"
                          : "#22c55e"
                    }}
                  >
                    {result.atsScore}%
                  </div>
                </div>
              </div>

              {/* JOB MATCH SCORE */}
              <div className="card">
                <h3>Job Match Score</h3>

                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width:`${result.matchScore}%`,
                      background:
                        result.matchScore < 40
                          ? "#ef4444"
                          : result.matchScore < 70
                          ? "#f59e0b"
                          : "#22c55e"
                    }}
                  >
                    {result.matchScore}%
                  </div>
                </div>
              </div>

              {/* DETECTED SKILLS */}
              <div className="card">
                <h3>Detected Skills</h3>

                <div className="tags">
                  {(result.detectedSkills || []).map((skill,i)=>(
                    <span className="tag" key={i}>{skill}</span>
                  ))}
                </div>
              </div>

              {/* MISSING SKILLS */}
              <div className="card">
                <h3>Missing Skills</h3>

                <div className="tags">
                  {(result.missingSkills || []).map((skill,i)=>(
                    <span className="tag missing" key={i}>{skill}</span>
                  ))}
                </div>
              </div>

              {/* RESUME SECTIONS */}
              <div className="card">

                <h3>Resume Sections</h3>

                <p>Present:</p>

                <div className="tags">
                  {result.foundSections.map((section,i)=>(
                    <span className="tag" key={i}>{section}</span>
                  ))}
                </div>

                <p>Missing:</p>

                <div className="tags">
                  {result.missingSections.map((section,i)=>(
                    <span className="tag missing" key={i}>{section}</span>
                  ))}
                </div>

              </div>

            </div>

            <button onClick={downloadReport}>
              Download Report
            </button>

          </div>

        )}

      </div>

    </div>

  );
}

export default App;