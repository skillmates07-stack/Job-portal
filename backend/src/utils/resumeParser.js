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
    "Web Development": ["web app", "website", "frontend", "backend", "full stack", "fullstack", "react", "angular", "vue", "node", "html", "css", "javascript", "landing page", "e-commerce", "landing", "responsive", "chat application", "chat app", "whatsapp", "messaging"],
    "Mobile Development": ["mobile app", "android", "ios", "react native", "flutter", "mobile development"],
    "AI/ML": ["machine learning", "deep learning", "ai", "artificial intelligence", "nlp", "computer vision", "tensorflow", "pytorch"],
    "Data Science": ["data analysis", "data science", "tableau", "power bi", "visualization", "analytics", "dashboard"],
    "IoT": ["iot", "internet of things", "arduino", "raspberry pi", "embedded", "sensors", "hardware"],
    "Cloud/DevOps": ["aws", "azure", "gcp", "docker", "kubernetes", "devops", "ci/cd", "cloud"],
    "Blockchain": ["blockchain", "crypto", "web3", "smart contract", "solidity", "ethereum"],
    "Game Development": ["game", "unity", "unreal", "gaming", "3d game", "vr game", "ar game", "game engine"],
    "E-commerce": ["online store", "shopping", "cart", "payment gateway", "checkout"],
    "Education": ["learning platform", "e-learning", "lms", "online course", "teaching platform"]
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
 * Extract education details - IMPROVED
 */
export const extractEducation = (text) => {
    const education = [];

    // Find EDUCATION section first
    const educationSection = text.match(/education[:\s]*([^]*?)(?=(?:languages?\s*known|skills|projects|experience|certification|work|internship|career|hobbies))/i);
    const sectionText = educationSection ? educationSection[1] : text;

    // Look for B.E. Computer Science and Engineering pattern (from user's resume)
    const beMatch = sectionText.match(/B\.?E\.?\s+([A-Za-z\s]+(?:Engineering|Science))[\s\S]*?([A-Za-z\s,]+(?:University|College|Institute|IIT|NIT))[\s\S]*?(?:Graduated|Graduation|in)?[:\s]*(\d{4})[\s\S]*?(?:CGPA|GPA)?[:\s]*(\d+\.?\d*)?/i);
    if (beMatch) {
        education.push({
            degree: "B.E.",
            field: beMatch[1]?.trim() || "Engineering",
            institution: beMatch[2]?.trim() || "",
            year: beMatch[3] || "",
            grade: beMatch[4] ? `CGPA: ${beMatch[4]}` : ""
        });
    }

    // Look for B.Tech pattern
    const btechMatch = sectionText.match(/B\.?Tech[\s\S]*?(?:in)?\s*([A-Za-z\s]+)?[\s\S]*?([A-Za-z\s,]+(?:University|College|Institute|IIT|NIT))[\s\S]*?(?:Graduated|Graduation)?[:\s]*(\d{4})[\s\S]*?(?:CGPA|GPA)?[:\s]*(\d+\.?\d*)?/i);
    if (btechMatch && education.length === 0) {
        education.push({
            degree: "B.Tech",
            field: btechMatch[1]?.trim() || "",
            institution: btechMatch[2]?.trim() || "",
            year: btechMatch[3] || "",
            grade: btechMatch[4] ? `CGPA: ${btechMatch[4]}` : ""
        });
    }

    // Fallback: Generic degree + institution + year + CGPA pattern
    if (education.length === 0) {
        // Look for degree patterns
        const genericMatch = sectionText.match(/(?:B\.?E\.?|B\.?Tech|B\.?Sc|M\.?Tech|M\.?Sc|MBA|MCA|BCA)\s*(?:in)?\s*([A-Za-z\s]+)/i);
        const institutionMatch = sectionText.match(/([A-Za-z\s,]+(?:University|College|Institute|IIT|NIT|School))/i);
        const yearMatch = sectionText.match(/(?:Graduated|Graduation|Year|in)[:\s]*(\d{4})/i) || sectionText.match(/(\d{4})/);
        const cgpaMatch = sectionText.match(/(?:CGPA|GPA)[:\s]*(\d+\.?\d*)/i);

        if (genericMatch || institutionMatch) {
            education.push({
                degree: genericMatch?.[0]?.split(/\s+in/i)[0]?.trim() || "Degree",
                field: genericMatch?.[1]?.trim() || "",
                institution: institutionMatch?.[1]?.trim() || "",
                year: yearMatch?.[1] || "",
                grade: cgpaMatch ? `CGPA: ${cgpaMatch[1]}` : ""
            });
        }
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

    return education;
};

/**
 * Extract projects - REWRITTEN for Sanjay's resume format
 */
export const extractProjects = (text) => {
    const projects = [];

    // Words that should NEVER be project names (expanded blocklist)
    const blocklist = [
        // Section headers
        'career objective', 'objective', 'summary', 'profile', 'about me',
        'education', 'skills', 'technical skills', 'skillset', 'tools and technologies',
        'work experience', 'experience', 'internship', 'employment',
        'projects', 'certifications', 'certificates', 'achievements',
        'extra-curricular', 'co-curricular', 'activities', 'hobbies',
        'languages', 'languages known', 'personal details', 'personal info',
        'contact', 'contact info', 'declaration', 'references', 'degree',
        'areas of interest', 'interests', 'soft skills', 'hard skills',
        'education background', 'personal skills', 'tools and technologies',
        // Metadata labels
        'role played', 'duration', 'tools or techniques', 'description',
        'tools used', 'technology used', 'tech stack',
        // Contact info
        'dob', 'date of birth', 'coimbatore', 'bangalore', 'chennai', 'mumbai',
        'delhi', 'hyderabad', 'pune', 'kolkata', 'email', 'phone', 'mobile',
        'linkedin', 'github', 'contact info', 'nationality',
        // Soft skills
        'problem', 'problem-solving', 'problem solving', 'risk management',
        'design thinking', 'active listening', 'interpersonal communication',
        'time management', 'communication', 'leadership', 'teamwork',
        'creativity', 'adaptability', 'critical thinking', 'solving',
        // Other
        'business systems', 'computer science', 'this is an', 'an innovative',
        'a collaborative', 'the platform', 'figma', 'adobe xd'
    ];

    // Patterns that are METADATA, not project titles
    const metadataPatterns = [
        /^role\s*played/i,
        /^duration/i,
        /^tools?\s*(or|used|and)/i,
        /^technology/i,
        /^description/i,
        /^tech\s*stack/i,
        /^\(.*\d{4}.*\)/,  // Date in parentheses like (November 2024)
        /^\d{4}[-–]\d{4}/, // Year range
        /^[a-z]/,          // Starts with lowercase
        /^ui\s*ux/i,       // UI UX role
        /^i\s+(am|aim|have|want)/i,
        /^creating\b/i,
        /^building\b/i,
        /^an?\s+(innovative|online|collaborative)/i,
        /^the\s+platform/i,
        /^this\s+is/i,
        /^\d+\/\d+\/\d+/,  // Date format
        /^https?:\/\//i,   // URLs
        /^@/,              // Social handles
    ];

    // Look for PROJECTS section only
    const projectSection = text.match(/(?:^|\n)\s*projects?\s*[:\n]([^]*?)(?=(?:\n\s*(?:education|certification|extra[-\s]?curricular|co[-\s]?curricular|achievement|hobbies|languages?\s*known|areas\s*of\s*interest|personal\s*skills|declaration)\s*[:\n])|$)/i);

    if (!projectSection) {
        return projects;
    }

    const projectText = projectSection[1];

    // Split by bullet points - these mark project titles
    const bulletSections = projectText.split(/(?=(?:•|●|\*|➢|→|⦁))/);

    for (const section of bulletSections) {
        if (section.trim().length < 10) continue;

        // Remove the bullet point and get lines
        const lines = section.replace(/^(?:•|●|\*|➢|→|⦁)\s*/, '').split('\n').map(l => l.trim()).filter(l => l.length > 0);

        if (lines.length === 0) continue;

        const firstLine = lines[0];
        const lowerFirst = firstLine.toLowerCase();

        // Skip if it's in blocklist
        if (blocklist.some(b => lowerFirst === b || lowerFirst.startsWith(b + ':') || lowerFirst.startsWith(b + ' '))) continue;

        // Skip if it matches metadata patterns
        if (metadataPatterns.some(p => p.test(firstLine))) continue;

        // Skip if it's too short or looks like a single word
        if (firstLine.length < 5) continue;
        if (!/\s/.test(firstLine) && firstLine.length < 15) continue; // Single word less than 15 chars

        // This looks like a project title!
        let projectName = firstLine;
        let duration = '';
        let role = '';
        let tools = [];
        let description = '';

        // Parse metadata from remaining lines
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();

            if (lowerLine.startsWith('duration:') || lowerLine.match(/^\([a-z]+\s+\d{4}/i)) {
                duration = line.replace(/^duration[:\s]*/i, '').replace(/^\(/, '').replace(/\)$/, '').trim();
            } else if (lowerLine.startsWith('role played:') || lowerLine.startsWith('role:')) {
                role = line.replace(/^role\s*(?:played)?[:\s]*/i, '').trim();
            } else if (lowerLine.startsWith('tools') || lowerLine.startsWith('technology') || lowerLine.startsWith('tech stack')) {
                const toolsText = line.replace(/^(?:tools|technology|tech\s*stack)[^:]*[:\s]*/i, '');
                tools = toolsText.split(/[,\s]+/).filter(t => t.length > 1 && !/^(and|or|the|used|with)$/i.test(t));
            } else if (lowerLine.startsWith('description:')) {
                description = line.replace(/^description[:\s]*/i, '').trim();
            } else if (line.length > 20 && !lowerLine.match(/^(role|duration|tool|tech|desc)/i)) {
                // Additional description text
                if (!description) {
                    description = line;
                } else {
                    description += ' ' + line;
                }
            }
        }

        // Determine category
        const fullText = (projectName + ' ' + description).toLowerCase();
        const category = determineCategory(fullText);

        projects.push({
            name: projectName,
            duration: duration,
            role: role,
            tools: tools,
            description: description.substring(0, 500),
            category
        });
    }

    return projects.slice(0, 10);
};

/**
 * Helper function to determine project category
 */
const determineCategory = (text) => {
    if (text.includes('game') || text.includes('gaming') || text.includes('unity') || text.includes('unreal') || text.includes('tournament')) {
        return "Game Development";
    } else if (text.includes('mobile') || text.includes('android') || text.includes('ios') || text.includes('flutter') || text.includes('react native')) {
        return "Mobile Development";
    } else if (text.includes('machine learning') || text.includes('ai') || text.includes('ml') || text.includes('deep learning') || text.includes('chatbot') || text.includes('llm')) {
        return "AI/ML";
    } else if (text.includes('data') || text.includes('analytics') || text.includes('visualization') || text.includes('tableau')) {
        return "Data Science";
    } else if (text.includes('iot') || text.includes('arduino') || text.includes('raspberry') || text.includes('embedded')) {
        return "IoT";
    } else if (text.includes('ui') || text.includes('ux') || text.includes('figma') || text.includes('design') || text.includes('prototype')) {
        return "UI/UX Design";
    } else if (text.includes('e-commerce') || text.includes('ecommerce') || text.includes('shopping') || text.includes('store') || text.includes('amazon')) {
        return "E-commerce";
    } else if (text.includes('learning platform') || text.includes('education') || text.includes('teaching') || text.includes('college')) {
        return "Education";
    } else {
        return "Web Development";
    }
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
 * Extract certifications - FIXED multi-line merging
 */
export const extractCertifications = (text) => {
    const certifications = [];

    // Look for certification section - stop at next section
    const certSection = text.match(/(?:^|\n)\s*certifications?\s*[:\n]([^]*?)(?=(?:\n\s*(?:hobbies|interests|languages\s*known|education|experience|skills|projects|extra|co-curricular|achievement|declaration)\s*[:\n])|$)/i);

    if (!certSection) {
        return certifications;
    }

    const certText = certSection[1];

    // Split by bullet points ONLY (not newlines) to preserve multi-line certs
    const certItems = certText.split(/(?:•|●|\*|➢|→|⦁)/);

    certItems.forEach(item => {
        // Merge all lines and clean up
        item = item.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();

        // Skip empty or too short items
        if (item.length < 20 || item.length > 400) return;

        // Skip items that start with "by" (these are truncated)
        if (/^by\s+/i.test(item)) return;

        // Skip items that are just headers or random text
        if (/^certification/i.test(item)) return;

        // The full item IS the certification name
        let name = item;

        // Extract issuer - look for patterns like "by W3C" or "from Coursera"
        const issuerMatch = item.match(/(?:by|from|issued by)\s+([A-Za-z0-9\s]+?)(?:\s*\(|$)/i);
        let issuer = issuerMatch ? issuerMatch[1].trim() : "";

        // Extract duration if present like "(8 months)"
        const durationMatch = item.match(/\((\d+\s*months?)\)/i);
        const duration = durationMatch ? durationMatch[1] : "";

        // Extract year if present
        const yearMatch = item.match(/\b(20\d{2})\b/);
        const date = yearMatch ? yearMatch[1] : "";

        certifications.push({
            name: name,
            issuer: issuer,
            duration: duration,
            date: date
        });
    });

    return certifications.slice(0, 10);
};

/**
 * Extract work experience - NEW FUNCTION
 */
export const extractWorkExperience = (text) => {
    const positions = [];
    let totalYears = 0;
    let internshipCount = 0;

    // Look for WORK EXPERIENCE section
    const workSection = text.match(/work\s*experience[:\s]*([^]*?)(?=(?:projects?|education|certification|skills|hobbies|languages|extra|achievements?))/i);

    if (workSection) {
        const workText = workSection[1];

        // Split by job title patterns (e.g., "Front End Developer Intern", "Software Engineer")
        const jobBlocks = workText.split(/(?=(?:[A-Z][a-z]+\s+){1,4}(?:Developer|Engineer|Intern|Designer|Manager|Analyst|Consultant|Lead))/);

        jobBlocks.forEach(block => {
            if (block.trim().length > 30) {
                // Extract job title
                const titleMatch = block.match(/^([A-Za-z\s]+(?:Developer|Engineer|Intern|Designer|Manager|Analyst|Consultant|Lead))/i);

                // Extract company name and location
                const companyMatch = block.match(/(?:at|@)?\s*([A-Za-z\s]+(?:Solutions|Technologies|Tech|Inc|Ltd|Company|Corp|Pvt|Services|Systems))[,\s]*([A-Za-z,\s]+)?/i);

                // Extract duration (e.g., "July 2020 - November 2020")
                const durationMatch = block.match(/([A-Z][a-z]+\s+\d{4})\s*[-–]\s*([A-Z][a-z]+\s+\d{4}|Present)/i);

                // Extract responsibilities
                const responsibilities = block.match(/(?:•|●|\*|-)\s*([^•●\*\n]+)/g) || [];

                if (titleMatch) {
                    const isInternship = /intern/i.test(titleMatch[1]);
                    if (isInternship) internshipCount++;

                    positions.push({
                        title: titleMatch[1].trim(),
                        company: companyMatch?.[1]?.trim() || "",
                        location: companyMatch?.[2]?.trim() || "",
                        duration: durationMatch ? `${durationMatch[1]} - ${durationMatch[2]}` : "",
                        description: responsibilities.map(r => r.replace(/[•●\*-]\s*/, '').trim()).join('. ')
                    });

                    // Calculate approximate years
                    if (durationMatch) {
                        const startYear = parseInt(durationMatch[1].match(/\d{4}/)?.[0]);
                        const endYear = durationMatch[2] === "Present" ? new Date().getFullYear() : parseInt(durationMatch[2].match(/\d{4}/)?.[0]);
                        if (startYear && endYear) {
                            totalYears += Math.max(0, endYear - startYear);
                        }
                    }
                }
            }
        });
    }

    return {
        years: totalYears,
        internships: internshipCount,
        description: "",
        positions: positions.slice(0, 10)
    };
};

/**
 * Extract extra-curricular activities - FIXED to group activities properly
 */
export const extractExtraCurricular = (text) => {
    const activities = [];

    // Invalid entries to filter out
    const invalidEntries = [
        'sports', 'hobbies', 'personal skills', 'areas of interest', 'languages',
        'extra-curricular', 'co-curricular', 'activities'
    ];

    // Try to match extra-curricular OR co-curricular sections
    const extraSection = text.match(/(?:extra[-\s]?curricular|co[-\s]?curricular)\s*(?:activities)?[^:]*[:\n]([^]*?)(?=(?:\n\s*(?:education|skills|projects|certification|declaration|reference|hobbies|language|personal\s*skills|areas\s*of\s*interest)\s*[:\n])|$)/i);

    if (!extraSection) {
        return activities;
    }

    const extraText = extraSection[1];

    // Look for numbered items (1., 2., 3.) or titled items (BRICS - 2023)
    const numberedPattern = /(?:\d+\.|[A-Z]+[-\s]*\d{4})\s*([^]*?)(?=(?:\d+\.|[A-Z]+[-\s]*\d{4})|$)/g;
    let match;

    while ((match = numberedPattern.exec(extraText)) !== null) {
        let content = match[0].trim();

        // Skip if too short
        if (content.length < 15) continue;

        // Merge all lines into one activity description
        const cleanContent = content.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();

        if (cleanContent.length > 15 && cleanContent.length < 500) {
            activities.push({
                activity: cleanContent,
                achievement: ""
            });
        }
    }

    // Fallback: Split by bullet points if no numbered items found
    if (activities.length === 0) {
        const items = extraText.split(/(?:•|●|\*|➢|→|⦁)/);

        items.forEach(item => {
            // Merge multiple lines into one
            const cleanItem = item.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();

            // Skip too short or too long
            if (cleanItem.length < 15 || cleanItem.length > 400) return;

            const lowerItem = cleanItem.toLowerCase();

            // Skip if it's just a header
            if (invalidEntries.some(inv => lowerItem === inv)) return;

            // Skip ALL CAPS headers
            if (cleanItem === cleanItem.toUpperCase()) return;

            // Skip partial sentences (start with lowercase)
            if (/^[a-z]/.test(cleanItem)) return;

            activities.push({
                activity: cleanItem,
                achievement: ""
            });
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
 * Extract hobbies - STRICT VERSION
 */
export const extractHobbies = (text) => {
    const hobbies = [];

    // Things that should NEVER be hobbies
    const invalidItems = [
        // Section headers
        'personal skills', 'areas of interest', 'extra-curricular', 'extracurricular',
        'activities', 'languages known', 'co-curricular', 'co curricular',
        'certification', 'education', 'experience', 'projects', 'declaration',
        // Skills (not hobbies)
        'hard work', 'time management', 'communication', 'problem solving',
        'leadership', 'teamwork', 'creativity', 'wireframe', 'prototyping',
        'ui ux', 'ui/ux', 'product management', 'user research',
        // Areas of interest content
        'designing', 'designs', 'usability', 'testing',
        // Sports achievements (not hobbies)
        'district level', 'zonal level', 'state level', 'national level',
        'runnerup', 'runner-up', 'winner', 'champion', 'championship',
        // Footer content
        'date:', 'place:', 'signature', 'coimbatore', 'bangalore', 'chennai',
        // Languages
        'english', 'hindi', 'tamil', 'telugu', 'french', 'german', 'malayalam',
        'r,w,s', 'r, w, s'
    ];

    // Valid hobby keywords - must contain one of these
    const validHobbies = [
        'reading', 'painting', 'dancing', 'singing', 'music', 'playing games',
        'traveling', 'travel', 'photography', 'cooking', 'writing', 'chess',
        'swimming', 'cycling', 'hiking', 'running', 'gym', 'yoga', 'meditation',
        'gardening', 'drawing', 'crafts', 'movies', 'watching movies', 'watching',
        'cricket', 'football', 'basketball', 'tennis', 'badminton', 'table tennis',
        'violin', 'guitar', 'piano', 'drums', 'content writing', 'blogging'
    ];

    // Match HOBBIES section only - stop at next section
    const hobbiesSection = text.match(/(?:^|\n)\s*hobbies(?:\s+and\s+|\s*&\s*)?(?:interests)?\s*[:\n]([^]*?)(?=(?:\n\s*(?:languages|declaration|certification|education|projects|skills|experience|personal|areas|extra|co-curricular)\s*[:\n])|$)/i);

    if (!hobbiesSection) {
        return hobbies;
    }

    const hobbiesText = hobbiesSection[1];
    const items = hobbiesText.split(/(?:•|●|\*|➢|→|⦁|\n)+/);

    items.forEach(item => {
        item = item.trim();

        // Skip if too short or too long
        if (item.length < 4 || item.length > 50) return;

        const lowerItem = item.toLowerCase();

        // Skip if contains any invalid content
        if (invalidItems.some(invalid => lowerItem.includes(invalid))) return;

        // Skip if it's ALL CAPS (likely a section header)
        if (item === item.toUpperCase() && item.length > 4) return;

        // Skip if contains numbers (likely an achievement or rating)
        if (/\d/.test(item)) return;

        // Only add if it matches a valid hobby keyword
        const isValidHobby = validHobbies.some(h => lowerItem.includes(h));

        if (isValidHobby) {
            hobbies.push(item);
        }
    });

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
 * Calculate parse confidence score - RESTORED higher values
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

    // Education (15 points)
    if (extractedData.education?.length > 0) score += 15;

    // Experience (15 points)
    if (extractedData.experience?.positions?.length > 0) score += 15;

    // Projects (15 points)
    if (extractedData.projects?.length > 0) score += 15;

    // Additional sections (20 points max)
    if (extractedData.projectTypes?.length > 0) score += 5;
    if (extractedData.languages?.length > 0) score += 5;
    if (extractedData.certifications?.length > 0) score += 5;
    if (extractedData.hobbies?.length > 0) score += 5;

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
        experience: extractWorkExperience(resumeText),
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
