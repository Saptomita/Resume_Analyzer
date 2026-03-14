const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/analyze", upload.single("resume"), async (req, res) => {

  const dataBuffer = fs.readFileSync(req.file.path);
  const pdfData = await pdfParse(dataBuffer);

  const text = pdfData.text.toLowerCase();

  const sections = ["education","experience","projects","skills","certifications"];

  const foundSections = sections.filter(section =>
  text.includes(section));
  const missingSections = sections.filter(section =>
  !text.includes(section));

  const jobDescription = req.body.jobDescription?.toLowerCase() || "";

  const skills = ["javascript","react","node","python","html","css","sql"];

  const foundSkills = skills.filter(skill => text.includes(skill));
  const missingSkills = skills.filter(skill => !text.includes(skill));

  const atsScore = Math.round((foundSkills.length / skills.length) * 100);

  const jobKeywords = jobDescription.split(/\W+/);

  const matchedKeywords = jobKeywords.filter(word =>
    text.includes(word));

  const matchScore = jobKeywords.length
    ? Math.round((matchedKeywords.length / jobKeywords.length) * 100)
    : 0;

  res.json({
    detectedSkills: foundSkills,
    missingSkills: missingSkills,
    atsScore: atsScore,
    matchScore: matchScore,
    foundSections: foundSections, 
    missingSections: missingSections,
  });
});
app.listen(5000, () => {
  console.log("Server running on port 5000");
});


