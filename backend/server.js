const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const cors = require("cors");
const fs = require("fs");
const natural = require("natural");

const skillDictionary = [

  // Programming / Tech
  "python","java","c++","c","javascript","typescript","react","angular","vue",
  "node","express","django","flask","spring boot",
  "html","css","bootstrap","tailwind",
  "sql","mysql","postgresql","mongodb",
  "git","github","docker","kubernetes",
  "rest api","graphql","microservices",
  "web development","backend development","frontend development",

  // Data Science / AI
  "machine learning","deep learning","data science","data analysis",
  "data visualization","pandas","numpy","scikit learn","tensorflow",
  "pytorch","nlp","computer vision","statistics","big data",
  "tableau","power bi","spark","hadoop",

  // Accounting / Finance
  "financial reporting","accounting","bookkeeping",
  "tax preparation","gst","auditing","budgeting",
  "forecasting","tally","quickbooks","excel","financial analysis",

  // Marketing / Business
  "digital marketing","seo","sem","content marketing",
  "social media marketing","email marketing",
  "brand management","market research","sales",
  "business development","customer relationship management",

  // Project / Management
  "project management","agile","scrum",
  "team management","leadership",
  "risk management","strategic planning",

  // Design
  "ui design","ux design","figma","adobe xd",
  "photoshop","illustrator","graphic design",
  "wireframing","prototyping",

  // Engineering
  "autocad","solidworks","matlab","embedded systems",
  "circuit design","mechanical design","civil engineering",
  "structural analysis","cad","cam"

];
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/analyze", upload.single("resume"), async (req, res) => {

  try {

    if (!req.file) {
  return res.status(400).json({
    error: "No resume file uploaded"
  });
  }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const text = pdfData.text
      .toLowerCase()
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ");

    const sections = ["education","experience","projects","skills","certifications"];

    const foundSections = sections.filter(section => text.includes(section));
    const missingSections = sections.filter(section => !text.includes(section));

    const jobDescription = req.body.jobDescription?.toLowerCase() || "";

    const stopWords = [
      "and","the","with","for","a","to","of","in","on","at","is","are",
      "we","looking","candidate","should","must","have","knowledge",
      "experience","strong","good","motivated","detail","professional",
      "ability","skills","responsible","work","team"
    ];

    const jobKeywords = jobDescription
      .split(/\W+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));

    const uniqueKeywords = [...new Set(jobKeywords)];

    const matchedKeywords = jobKeywords.filter(word =>
      text.includes(word)
    );

    // Skill score
const skillScore = requiredSkills.length
  ? (detectedSkills.filter(skill => requiredSkills.includes(skill)).length / requiredSkills.length) * 100
  : 0;

// Section score
const sectionScore = (foundSections.length / sections.length) * 100;

// Keyword score
const keywordScore = uniqueKeywords.length
  ? (matchedKeywords.length / uniqueKeywords.length) * 100
  : 0;

// Base ATS score
let atsScore = Math.round(
  (skillScore * 0.6) +   // ↑ increase importance
  (sectionScore * 0.2) + // ↓ reduce importance
  (keywordScore * 0.2)
);

// HARD REJECTION LOGIC
if (
  detectedSkills.length === 0 ||
  requiredSkills.length === 0 ||
  skillScore < 30
) {
  atsScore = Math.min(atsScore, 35);
}

    const matchScore = jobKeywords.length
      ? Math.round((matchedKeywords.length / jobKeywords.length) * 100)
      : 0;

    const detectedSkills = skillDictionary.filter(skill =>
      text.includes(skill)
    );

    const requiredSkills = skillDictionary.filter(skill => {
      const skillWords = skill.split(" ");
      return skillWords.some(word => jobDescription.includes(word));
     });

    const missingSkills = requiredSkills.filter(skill =>
      !detectedSkills.includes(skill)
     );
     fs.unlinkSync(req.file.path);
    res.json({
      detectedSkills,
      missingSkills,
      atsScore,
      matchScore,
      foundSections,
      missingSections
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Resume analysis failed"
    });

  }

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


