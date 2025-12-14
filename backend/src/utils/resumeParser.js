// Enhanced Resume parsing utility - extracts comprehensive details from resume text
// Includes: Contact info, Education, Projects, Skills, Tools, Languages, Certifications, etc.

// ===== TECHNICAL SKILLS KEYWORDS =====
const TECHNICAL_SKILLS = [
    // UI/UX & Design
    "ui ux designing", "ui/ux", "ui ux", "ux design", "ui design", "wireframe", "wireframing", "prototyping",
    "user research", "usability testing", "user experience", "user interface", "interaction design",
    "video editing", "motion graphics", "graphic design", "visual design",
    // Programming Languages
    "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "go", "rust", "php", "swift", "kotlin", "scala",
    "html", "css", "sass", "scss", "sql", "nosql", "r programming", "matlab",
    // Frontend
    "react", "reactjs", "react.js", "angular", "vue", "vuejs", "vue.js", "svelte", "next.js", "nextjs", "nuxt",
    "tailwind", "tailwindcss", "bootstrap", "jquery", "redux", "material ui",
    // Backend
    "node", "nodejs", "node.js", "express", "expressjs", "django", "flask", "spring", "spring boot",
    "laravel", "rails", "ruby on rails", "fastapi", "nest.js", "nestjs", ".net", "asp.net",
    // Databases
    "mongodb", "mysql", "postgresql", "postgres", "sqlite", "redis", "elasticsearch", "dynamodb",
    "firebase", "supabase", "prisma", "mongoose", "oracle", "sql server",
    // Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s", "jenkins", "ci/cd",
    "terraform", "ansible", "nginx", "apache", "linux", "unix", "bash",
    // AI/ML
    "machine learning", "ml", "deep learning", "tensorflow", "pytorch", "keras", "scikit-learn",
    "pandas", "numpy", "nlp", "computer vision", "ai", "artificial intelligence", "data science",
    "tableau", "power bi", "data analysis", "data visualization",
    // Mobile
    "react native", "flutter", "ios development", "android development", "mobile development",
    // Other
    "git", "github", "gitlab", "agile", "scrum", "rest", "restful", "graphql", "api", "microservices",
    "product management", "project management"
];

// ===== TOOLS & TECHNOLOGIES =====
const TOOLS_LIST = [
    "figma", "adobe xd", "sketch", "invision", "zeplin", "marvel",
    "photoshop", "illustrator", "after effects", "premiere pro", "davinci resolve",
    "canva", "coreldraw",
    "power bi", "tableau", "excel", "google sheets",
    "vs code", "visual studio", "intellij", "eclipse", "pycharm", "sublime text",
    "postman", "insomnia", "swagger",
    "jira", "trello", "asana", "notion", "confluence", "slack",
    "github", "gitlab", "bitbucket", "sourcetree",
    "docker", "kubernetes", "jenkins", "circleci", "travis ci",
    "aws", "azure", "gcp", "heroku", "vercel", "netlify", "digitalocean",
    "mongodb compass", "mysql workbench", "pgadmin", "dbeaver",
    "android studio", "xcode", "unity", "unreal engine",
    "arduino", "raspberry pi",
    "zoom", "microsoft teams", "google meet"
];

// ===== PERSONAL/SOFT SKILLS =====
const PERSONAL_SKILLS = [
    "hard work", "time management", "communication", "problem solving", "problem-solving",
    "critical thinking", "leadership", "teamwork", "team player", "collaboration",
    "adaptability", "creativity", "attention to detail", "analytical", "presentation",
    "negotiation", "decision making", "mentoring", "public speaking", "interpersonal skills",
    "self-motivated", "quick learner", "multitasking", "organizational skills", "flexibility"
];

// ===== PROJECT CATEGORIES =====
const PROJECT_CATEGORIES = {
    "UI/UX Design": ["ui/ux", "ui ux", "user interface", "user experience", "wireframe", "prototype", "figma", "adobe xd"],
    "Web Development": ["web app", "website", "frontend", "backend", "full stack", "fullstack", "react", "angular", "vue", "node"],
    "Mobile Development": ["mobile app", "android", "ios", "react native", "flutter", "mobile development"],
    "AI/ML": ["machine learning", "deep learning", "ai", "artificial intelligence", "nlp", "computer vision", "tensorflow", "pytorch"],
    "Data Science": ["data analysis", "data science", "tableau", "power bi", "visualization", "analytics", "dashboard"],
    "IoT": ["iot", "internet of things", "arduino", "raspberry pi", "embedded", "sensors", "hardware"],
    "Cloud/DevOps": ["aws", "azure", "gcp", "docker", "kubernetes", "devops", "ci/cd", "cloud"],
    "Blockchain": ["blockchain", "crypto", "web3", "smart contract", "solidity", "ethereum"],
    "Game Development": ["game", "unity", "unreal", "gaming", "3d", "vr", "ar"],
    "E-commerce": ["e-commerce", "ecommerce", "online store", "shopping", "cart", "payment"],
    "Education": ["learning platform", "education", "e-learning", "lms", "online course", "teaching"]
};

// ===== LANGUAGE PATTERNS =====
const LANGUAGE_PATTERNS = [
    /(?:english|hindi|tamil|telugu|kannada|malayalam|bengali|marathi|gujarati|punjabi|urdu|french|german|spanish|japanese|chinese|korean)\s*[-–:]*\s*(r,?\s*w,?\s*s|read,?\s*write,?\s*speak|native|fluent|proficient|basic|intermediate|advanced)?/gi
];

// ===== EDUCATION PATTERNS =====
const EDUCATION_PATTERNS = [
    // B.Tech, B.E., etc.
    /(?:b\.?tech|b\.?e\.?|bachelor(?:'?s)?(?:\s+of)?\s+(?:technology|engineering|science|arts|commerce))[^.]*?(?:\d{4}[-–]\d{4}|\d{4})/gi,
    // M.Tech, M.E., MBA, etc.
    /(?:m\.?tech|m\.?e\.?|m\.?s\.?|mba|master(?:'?s)?(?:\s+of)?\s+(?:technology|engineering|science|business|arts))[^.]*?(?:\d{4}[-–]\d{4}|\d{4})/gi,
    // 10th, 12th
    /(?:10th|12th|sslc|hsc|higher secondary|secondary)[^.]*?(?:\d{4}[-–]\d{4}|\d{4})[^.]*?(?:\d+\.?\d*\s*%|\d+\.?\d*\s*cgpa)/gi,
    // CGPA patterns
    /(?:cgpa|gpa)\s*[:=-]?\s*(\d+\.?\d*)/gi,
];

// ===== CONTACT PATTERNS =====
const CONTACT_PATTERNS = {
    phone: /(?:\+91[-\s]?)?[6-9]\d{4}[\s-]?\d{5}|\+\d{1,3}[-\s]?\d{10}|[6-9]\d{9}/g,
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    linkedin: /(?:linkedin\.com\/in\/|linkedin:\s*)([a-zA-Z0-9_-]+)/gi,
    github: /(?:github\.com\/|github:\s*)([a-zA-Z0-9_-]+)/gi,
    location: /(?:location|address|city)[\s:]*([A-Za-z\s,]+[-\s]\d{6})/gi,
    dob: /(?:dob|date of birth|d\.o\.b\.?)[\s:]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/gi,
};

// ===== CERTIFICATION PATTERNS =====
const CERTIFICATION_PATTERNS = [
    /(?:certified|certification|certificate)[^.]*?(?:from|by|in)?\s+([A-Za-z\s]+)/gi,
    /(?:coursera|udemy|edx|linkedin learning|google|microsoft|aws|oracle|cisco)[^.]*?(?:certification|certificate|certified)/gi,
];

/**
 * Extract contact information from resume text
 */
export const extractContactInfo = (text) => {
    const contactInfo = {
        phone: "",
        email: "",
        location: "",
        linkedin: "",
        github: "",
        portfolio: "",
        dob: "",
    };

    // Extract phone
    const phoneMatch = text.match(CONTACT_PATTERNS.phone);
    if (phoneMatch) contactInfo.phone = phoneMatch[0];

    // Extract email
    const emailMatch = text.match(CONTACT_PATTERNS.email);
    if (emailMatch) contactInfo.email = emailMatch[0];

    // Extract LinkedIn
    const linkedinMatch = text.match(CONTACT_PATTERNS.linkedin);
    if (linkedinMatch) {
        contactInfo.linkedin = linkedinMatch[0].replace(/linkedin\.com\/in\/|linkedin:\s*/i, "");
    }

    // Extract GitHub
    const githubMatch = text.match(CONTACT_PATTERNS.github);
    if (githubMatch) {
        contactInfo.github = githubMatch[0].replace(/github\.com\/|github:\s*/i, "");
    }

    // Extract DOB
    const dobMatch = text.match(CONTACT_PATTERNS.dob);
    if (dobMatch) {
        contactInfo.dob = dobMatch[0].replace(/dob|date of birth|d\.o\.b\.?[\s:]*/i, "").trim();
    }

    // Extract location (look for city names with pin codes)
    const locationPatterns = [
        /(?:coimbatore|chennai|bangalore|mumbai|delhi|hyderabad|pune|kolkata|ahmedabad|jaipur|lucknow|kanpur|nagpur|indore|thane|bhopal|visakhapatnam|patna|vadodara|ghaziabad|ludhiana|agra|nashik|faridabad|meerut|rajkot|varanasi|srinagar|aurangabad|dhanbad|amritsar|allahabad|ranchi|howrah|gwalior|jabalpur|madurai|tiruchirappalli|kota|chandigarh|mysore|noida|gurugram|gurgaon)[^,\n]*[-\s]\d{6}/gi
    ];
    for (const pattern of locationPatterns) {
        const match = text.match(pattern);
        if (match) {
            contactInfo.location = match[0].trim();
            break;
        }
    }

    return contactInfo;
};

/**
 * Extract career objective from resume text
 */
export const extractCareerObjective = (text) => {
    const objectivePatterns = [
        /(?:career\s+objective|objective|summary|about\s+me|profile)[\s:]*([^]*?)(?=\n\s*(?:[A-Z]{2,}|education|skills|experience|projects|technical))/i,
    ];

    for (const pattern of objectivePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            const objective = match[1].trim().replace(/\s+/g, " ");
            if (objective.length > 20 && objective.length < 1000) {
                return objective;
            }
        }
    }
    return "";
};

/**
 * Extract skills from resume text (both technical and tools)
 */
export const extractTechnicalSkills = (text) => {
    const lowerText = text.toLowerCase();
    const foundSkills = new Set();

    TECHNICAL_SKILLS.forEach(skill => {
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(lowerText)) {
            const normalizedSkill = skill.split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            foundSkills.add(normalizedSkill);
        }
    });

    return Array.from(foundSkills);
};

/**
 * Extract tools and technologies
 */
export const extractTools = (text) => {
    const lowerText = text.toLowerCase();
    const foundTools = new Set();

    TOOLS_LIST.forEach(tool => {
        const regex = new RegExp(`\\b${tool.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(lowerText)) {
            const normalizedTool = tool.split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            foundTools.add(normalizedTool);
        }
    });

    return Array.from(foundTools);
};

/**
 * Extract personal/soft skills
 */
export const extractPersonalSkills = (text) => {
    const lowerText = text.toLowerCase();
    const foundSkills = new Set();

    PERSONAL_SKILLS.forEach(skill => {
        const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(lowerText)) {
            const normalizedSkill = skill.split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            foundSkills.add(normalizedSkill);
        }
    });

    return Array.from(foundSkills);
};

/**
 * Extract education details
 */
export const extractEducation = (text) => {
    const education = [];
    const lowerText = text.toLowerCase();

    // Look for B.Tech or B.E.
    const btechMatch = text.match(/b\.?(?:tech|e\.?)[^]*?(?:computer|cse|it|ece|eee|mechanical|civil|electronics|electrical)?[^]*?(\d{4}\s*[-–]\s*\d{4})/i);
    const beMatch = text.match(/b\.e\.?\s+([a-z\s]+engineering)[^]*?(\d{4}\s*[-–]\s*\d{4})/i);
    const cgpaMatch = text.match(/cgpa[:\s]*(\d+\.?\d*)/i);

    if (btechMatch || beMatch) {
        const match = beMatch || btechMatch;
        education.push({
            degree: beMatch ? "B.E." : "B.Tech",
            institution: "",
            year: match[beMatch ? 2 : 1],
            grade: cgpaMatch ? `CGPA: ${cgpaMatch[1]}` : "",
            field: text.match(/computer science|cse|information technology|it|electronics|mechanical|electrical/i)?.[0] || ""
        });
    }

    // Look for HSC / 12th / Higher Secondary
    const hscMatch = text.match(/(?:12th|higher secondary|hsc|\+2)[^\n]*?(\d{4})[^\n]*?(\d+\.?\d*)\s*%/i);
    if (hscMatch) {
        education.push({
            degree: "12th / HSC",
            institution: "",
            year: hscMatch[1],
            grade: hscMatch[2] + "%",
            field: ""
        });
    }

    // Look for SSLC / 10th / Secondary
    const sslcMatch = text.match(/(?:10th|secondary|sslc)[^\n]*?(\d{4})[^\n]*?(\d+\.?\d*)\s*%/i);
    if (sslcMatch) {
        education.push({
            degree: "10th / SSLC",
            institution: "",
            year: sslcMatch[1],
            grade: sslcMatch[2] + "%",
            field: ""
        });
    }

    // Fallback: Look for EDUCATION section and extract entries
    if (education.length === 0) {
        const educationSection = text.match(/education[:\s]*([^]*?)(?=(?:skills|projects|experience|certification|work|internship|career|objective))/i);
        if (educationSection) {
            const lines = educationSection[1].split(/\n/).filter(l => l.trim().length > 10);
            lines.forEach(line => {
                if (line.match(/\d{4}/) && line.match(/(?:cgpa|%|gpa)/i)) {
                    education.push({
                        degree: line.match(/(?:b\.?e\.?|b\.?tech|bsc|msc|mba|m\.?tech|bca|mca|diploma)/i)?.[0] || "Degree",
                        institution: "",
                        year: line.match(/(\d{4}[-–]\d{4}|\d{4})/)?.[0] || "",
                        grade: line.match(/(?:cgpa|gpa)[:\s]*(\d+\.?\d*)|(\d+\.?\d*)\s*%/i)?.[0] || "",
                        field: ""
                    });
                }
            });
        }
    }

    return education;
};

/**
 * Extract projects with details
 */
export const extractProjects = (text) => {
    const projects = [];

    // Look for project sections - more flexible regex that handles INTERNSHIP and various section orders
    let projectSection = text.match(/(?:projects?|internship)[:\s]*([^]*?)(?=(?:education|certification|extra|co-curricular|achievement|declaration|reference|languages?|hobbies|\n\n\n))/i);

    // Fallback: If not found, try to find PROJECTS section until end of major content
    if (!projectSection) {
        projectSection = text.match(/projects?[:\s]*([^]*?)$/i);
    }

    if (projectSection) {
        const projectText = projectSection[1];

        // Split by common project title patterns
        // Look for lines that start with project names (capitalized words, potentially with dashes)
        const projectBlocks = projectText.split(/\n(?=[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*[-–—])/);

        projectBlocks.forEach(block => {
            if (block.trim().length > 20) {
                const lines = block.split(/\n/);
                const titleLine = lines[0] || "";

                // Extract project name from title line
                const nameMatch = titleLine.match(/^([A-Za-z][^•●\n]{5,60}?)(?:\s*[-–—]|$)/);

                // Determine category from content
                let category = "Other";
                const lowerBlock = block.toLowerCase();
                for (const [cat, keywords] of Object.entries(PROJECT_CATEGORIES)) {
                    if (keywords.some(kw => lowerBlock.includes(kw))) {
                        category = cat;
                        break;
                    }
                }

                if (nameMatch && nameMatch[1].trim().length > 3) {
                    projects.push({
                        name: nameMatch[1].trim(),
                        duration: "",
                        role: "",
                        tools: [],
                        description: block.substring(0, 400),
                        category
                    });
                }
            }
        });

        // If no projects found with title pattern, try bullet point splitting
        if (projects.length === 0) {
            const bulletItems = projectText.split(/(?:•|●|➢|→|⦁|\*)\s+/);
            bulletItems.forEach(item => {
                if (item.length > 40) {
                    let category = "Other";
                    const lowerItem = item.toLowerCase();
                    for (const [cat, keywords] of Object.entries(PROJECT_CATEGORIES)) {
                        if (keywords.some(kw => lowerItem.includes(kw))) {
                            category = cat;
                            break;
                        }
                    }
                    projects.push({
                        name: item.substring(0, 60).trim(),
                        duration: "",
                        role: "",
                        tools: [],
                        description: item.substring(0, 300),
                        category
                    });
                }
            });
        }
    }

    return projects.slice(0, 10); // Limit to 10 projects
};

/**
 * Extract languages known
 */
export const extractLanguages = (text) => {
    const languages = [];
    const languageNames = ["english", "hindi", "tamil", "telugu", "kannada", "malayalam", "bengali", "marathi", "gujarati", "punjabi", "urdu", "french", "german", "spanish", "japanese", "chinese", "korean"];

    const lowerText = text.toLowerCase();

    languageNames.forEach(lang => {
        const regex = new RegExp(`${lang}\\s*[-–:]*\\s*([rwsRWS,\\s]+)?`, 'i');
        const match = lowerText.match(regex);
        if (match) {
            languages.push({
                language: lang.charAt(0).toUpperCase() + lang.slice(1),
                proficiency: match[1] ? match[1].toUpperCase().trim() : ""
            });
        }
    });

    return languages;
};

/**
 * Extract certifications
 */
export const extractCertifications = (text) => {
    const certifications = [];

    // Look for certification section
    const certSection = text.match(/certification[s]?[:\s]*([^]*?)(?=(?:education|experience|skills|projects|extra|co-curricular|achievement|declaration|reference|hobbies))/i);

    if (certSection) {
        const certText = certSection[1];
        const certItems = certText.split(/(?:•|\*|➢|→|⦁|\n)/);

        certItems.forEach(item => {
            item = item.trim();
            if (item.length > 10 && item.length < 200) {
                const issuerMatch = item.match(/(?:from|by|issued by)\s+([A-Za-z\s]+)/i);
                certifications.push({
                    name: item.replace(/(?:from|by|issued by)\s+[A-Za-z\s]+/i, "").trim(),
                    issuer: issuerMatch ? issuerMatch[1].trim() : "",
                    date: ""
                });
            }
        });
    }

    return certifications.slice(0, 10);
};

/**
 * Extract extra-curricular activities
 */
export const extractExtraCurricular = (text) => {
    const activities = [];

    const extraSection = text.match(/extra[-\s]?curricular[^:]*[:\s]*([^]*?)(?=(?:education|experience|skills|projects|certification|co-curricular|achievement|declaration|reference|hobbies|language))/i);

    if (extraSection) {
        const extraText = extraSection[1];
        const items = extraText.split(/(?:•|\*|➢|→|⦁|\n)/);

        items.forEach(item => {
            item = item.trim();
            if (item.length > 10 && item.length < 200) {
                activities.push({
                    activity: item,
                    achievement: ""
                });
            }
        });
    }

    return activities.slice(0, 10);
};

/**
 * Extract areas of interest
 */
export const extractAreasOfInterest = (text) => {
    const interests = [];

    const interestSection = text.match(/areas?\s+of\s+interest[:\s]*([^]*?)(?=(?:education|experience|skills|projects|certification|extra|co-curricular|achievement|declaration|reference|hobbies|language|personal))/i);

    if (interestSection) {
        const items = interestSection[1].split(/(?:•|\*|➢|→|⦁|\n)/);
        items.forEach(item => {
            item = item.trim();
            if (item.length > 3 && item.length < 100) {
                interests.push(item);
            }
        });
    }

    return interests.slice(0, 10);
};

/**
 * Extract hobbies
 */
export const extractHobbies = (text) => {
    const hobbies = [];

    const hobbiesSection = text.match(/hobbies[:\s]*([^]*?)(?=(?:education|experience|skills|projects|certification|extra|co-curricular|achievement|declaration|reference|language|personal))/i);

    if (hobbiesSection) {
        const items = hobbiesSection[1].split(/(?:•|\*|➢|→|⦁|\n)/);
        items.forEach(item => {
            item = item.trim();
            if (item.length > 3 && item.length < 100) {
                hobbies.push(item);
            }
        });
    }

    return hobbies.slice(0, 10);
};

/**
 * Determine project types/categories from resume
 */
export const extractProjectTypes = (text) => {
    const lowerText = text.toLowerCase();
    const foundTypes = new Set();

    Object.entries(PROJECT_CATEGORIES).forEach(([type, keywords]) => {
        keywords.forEach(keyword => {
            if (lowerText.includes(keyword.toLowerCase())) {
                foundTypes.add(type);
            }
        });
    });

    return Array.from(foundTypes);
};

/**
 * Calculate parse confidence score
 */
const calculateParseScore = (extractedData) => {
    let score = 0;

    // Contact info (25 points max)
    if (extractedData.contactInfo?.phone) score += 10;
    if (extractedData.contactInfo?.email) score += 5;
    if (extractedData.contactInfo?.linkedin) score += 5;
    if (extractedData.contactInfo?.github) score += 5;

    // Career objective (10 points)
    if (extractedData.careerObjective) score += 10;

    // Skills (25 points max)
    if (extractedData.technicalSkills?.length > 0) score += 10;
    if (extractedData.tools?.length > 0) score += 8;
    if (extractedData.personalSkills?.length > 0) score += 7;

    // Education and Projects (25 points max)
    if (extractedData.education?.length > 0) score += 12;
    if (extractedData.projects?.length > 0) score += 13;

    // Additional sections (25 points max)
    if (extractedData.projectTypes?.length > 0) score += 8;
    if (extractedData.languages?.length > 0) score += 5;
    if (extractedData.certifications?.length > 0) score += 7;
    if (extractedData.extraCurricular?.length > 0) score += 5;

    return Math.min(score, 100);
};

/**
 * Parse resume and extract all comprehensive data
 */
export const parseResume = (resumeText) => {
    const extractedData = {
        contactInfo: extractContactInfo(resumeText),
        careerObjective: extractCareerObjective(resumeText),
        technicalSkills: extractTechnicalSkills(resumeText),
        tools: extractTools(resumeText),
        personalSkills: extractPersonalSkills(resumeText),
        education: extractEducation(resumeText),
        projects: extractProjects(resumeText),
        languages: extractLanguages(resumeText),
        certifications: extractCertifications(resumeText),
        extraCurricular: extractExtraCurricular(resumeText),
        areasOfInterest: extractAreasOfInterest(resumeText),
        hobbies: extractHobbies(resumeText),
        projectTypes: extractProjectTypes(resumeText),
    };

    extractedData.resumeParseScore = calculateParseScore(extractedData);

    return extractedData;
};

export default parseResume;
