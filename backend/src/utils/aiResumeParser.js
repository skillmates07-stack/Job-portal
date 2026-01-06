// AI-powered Resume Parser using Google Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Parse resume using Gemini AI
 * @param {string} resumeText - The extracted text from the resume
 * @returns {Object} - Structured resume data
 */
export async function parseResumeWithAI(resumeText) {
    try {
        console.log("🤖 Starting AI resume parsing...");

        // Initialize Gemini INSIDE the function so API key is available
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY not found in environment");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are an expert resume parser. Extract ALL information from this resume text.

RESUME TEXT:
${resumeText}

PARSING INSTRUCTIONS:
1. Extract the FULL NAME from the top of the resume (usually large/bold text)
2. Extract ALL work experience entries - look for "WORK EXPERIENCE", "EXPERIENCE", "EMPLOYMENT" sections
3. Extract ALL education entries including multiple degrees (Masters, Bachelors, etc.)
4. Extract ALL certifications mentioned anywhere (often in Experience section as bullet points)
5. Extract ALL projects mentioned in PROJECTS section
6. Extract ALL skills, tools, and technologies

Return ONLY valid JSON with this structure:

{
    "contact": {
        "name": "Full name (e.g., Deep M. Mehta, John Smith)",
        "email": "email@domain.com",
        "phone": "phone number",
        "location": "City, State/Country",
        "linkedin": "LinkedIn username or URL",
        "github": "GitHub username or URL",
        "website": "Personal website if any"
    },
    "careerObjective": "Career objective or professional summary",
    "education": [
        {
            "degree": "Master of Computer Science",
            "field": "Computer Science",
            "institution": "University Name",
            "graduationYear": "2024",
            "cgpa": "4.0/4.0 or 9.1/10"
        }
    ],
    "technicalSkills": ["C#", "Java", "Python", "JavaScript", "SQL", "React", "Angular", etc.],
    "tools": ["Azure", "AWS", "GitHub", "Kubernetes", "Docker", "Terraform", etc.],
    "softSkills": ["Leadership", "Communication", etc.],
    "experience": [
        {
            "title": "Software Engineer",
            "company": "Microsoft",
            "location": "Redmond, WA",
            "duration": "June 2024 - Present",
            "responsibilities": [
                "Description of work done",
                "Technologies used and impact"
            ]
        }
    ],
    "projects": [
        {
            "name": "Generative AI GitHub Bot",
            "description": "Brief project description",
            "tools": ["Python", "LLMs", "GitHub Actions"],
            "link": "github.com/project-link if available"
        }
    ],
    "certifications": [
        {
            "name": "Azure Solutions Architect",
            "issuer": "Microsoft",
            "year": "2021"
        }
    ],
    "languages": [
        {
            "language": "English",
            "proficiency": "Native/Fluent"
        }
    ],
    "hobbies": [],
    "extraCurricular": [],
    "coCurricular": [],
    "areasOfInterest": []
}

CRITICAL - DO NOT MISS:
1. WORK EXPERIENCE - Extract ALL jobs with company name, title, duration, and responsibilities
2. ALL EDUCATION - Include both Masters AND Bachelors degrees if present
3. CERTIFICATIONS - Often mentioned in work experience bullet points (e.g., "Certifications - Azure Solutions Architect")
4. The person's ACTUAL NAME from the resume header
5. Return valid JSON only, no markdown or extra text`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up response - remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Parse JSON response
        const parsedData = JSON.parse(text);

        // Calculate parse score based on extracted data
        const parseScore = calculateAIParseScore(parsedData);

        return {
            success: true,
            data: parsedData,
            parseScore
        };

    } catch (error) {
        console.error('Gemini AI parsing error:', error);
        return {
            success: false,
            error: error.message,
            parseScore: 0
        };
    }
}

/**
 * Calculate parse score based on extracted data quality
 */
function calculateAIParseScore(data) {
    let score = 0;

    // Contact info (max 20)
    if (data.contact?.name) score += 5;
    if (data.contact?.email) score += 5;
    if (data.contact?.phone) score += 5;
    if (data.contact?.location) score += 3;
    if (data.contact?.linkedin || data.contact?.github) score += 2;

    // Career Objective (max 5)
    if (data.careerObjective && data.careerObjective.length > 20) score += 5;

    // Education (max 15)
    if (data.education && data.education.length > 0) {
        score += 10;
        if (data.education[0].cgpa) score += 5;
    }

    // Skills (max 20)
    if (data.technicalSkills && data.technicalSkills.length > 0) {
        score += Math.min(10, data.technicalSkills.length);
    }
    if (data.softSkills && data.softSkills.length > 0) {
        score += Math.min(5, data.softSkills.length);
    }
    if (data.tools && data.tools.length > 0) {
        score += Math.min(5, data.tools.length);
    }

    // Projects (max 20)
    if (data.projects && data.projects.length > 0) {
        score += Math.min(20, data.projects.length * 7);
    }

    // Experience (max 10)
    if (data.experience && data.experience.length > 0) {
        score += Math.min(10, data.experience.length * 5);
    }

    // Certifications (max 5)
    if (data.certifications && data.certifications.length > 0) {
        score += Math.min(5, data.certifications.length * 2);
    }

    // Languages (max 3)
    if (data.languages && data.languages.length > 0) {
        score += 3;
    }

    // Hobbies + Activities (max 2)
    if (data.hobbies && data.hobbies.length > 0) score += 1;
    if (data.extraCurricular && data.extraCurricular.length > 0) score += 1;

    return Math.min(100, score);
}

/**
 * Categorize projects based on description
 */
export function categorizeProject(project) {
    const text = (project.name + ' ' + (project.description || '')).toLowerCase();

    if (text.includes('game') || text.includes('gaming') || text.includes('tournament')) {
        return 'Game Development';
    } else if (text.includes('mobile') || text.includes('android') || text.includes('ios') || text.includes('flutter')) {
        return 'Mobile Development';
    } else if (text.includes('machine learning') || text.includes('ai') || text.includes('chatbot') || text.includes('llm')) {
        return 'AI/ML';
    } else if (text.includes('data') || text.includes('analytics') || text.includes('tableau') || text.includes('visualization')) {
        return 'Data Science';
    } else if (text.includes('iot') || text.includes('arduino') || text.includes('embedded')) {
        return 'IoT';
    } else if (text.includes('ui') || text.includes('ux') || text.includes('figma') || text.includes('design')) {
        return 'UI/UX Design';
    } else if (text.includes('e-commerce') || text.includes('shopping') || text.includes('store') || text.includes('amazon')) {
        return 'E-commerce';
    } else if (text.includes('learning') || text.includes('education') || text.includes('platform') || text.includes('teaching')) {
        return 'Education';
    } else {
        return 'Web Development';
    }
}

export default parseResumeWithAI;
