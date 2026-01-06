// Simple test script for AI parser
import 'dotenv/config';
import { parseResumeWithAI } from './src/utils/aiResumeParser.js';

const testText = `
SANJAY S
Email: sanjay@gmail.com
Phone: 8838247359

CAREER OBJECTIVE
Seeking a challenging position in UI/UX Design

EDUCATION
B.E. Computer Science
PSG College of Technology
CGPA: 8.5

PROJECTS
1. Car Service Appointment Booking
   Duration: November 2024 - December 2024
   Role Played: Developer
   Tools: Figma, React
   Description: A web application for booking car services

2. Online Learning Platform
   Duration: August 2024 - October 2024
   Tools: NextJS, Tailwind
   Description: E-learning platform with video courses

TECHNICAL SKILLS
HTML, CSS, JavaScript, React, Figma

HOBBIES
Reading, Football, Music
`;

console.log("Testing AI parser...");
console.log("API Key:", process.env.GEMINI_API_KEY ? "Present" : "MISSING");

try {
    const result = await parseResumeWithAI(testText);
    console.log("\n=== RESULT ===");
    console.log("Success:", result.success);
    console.log("Score:", result.parseScore);
    if (result.success) {
        console.log("Projects:", result.data.projects?.map(p => p.name));
        console.log("Skills:", result.data.technicalSkills);
    } else {
        console.log("Error:", result.error);
    }
} catch (e) {
    console.error("Exception:", e.message);
}
