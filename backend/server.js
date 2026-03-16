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

  const stopWords = ["and","the","with","for","a","to","of","in","on","at","is"];

const jobKeywords = jobDescription
  .split(/\W+/)
  .filter(word => word.length > 2 && !stopWords.includes(word));

const uniqueKeywords = [...new Set(jobKeywords)];

const foundSkills = uniqueKeywords.filter(word => text.includes(word));
const missingSkills = uniqueKeywords.filter(word => !text.includes(word));

  const atsScore = uniqueKeywords.length
  ? Math.round((foundSkills.length / uniqueKeywords.length) * 100)
  : 0;


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


