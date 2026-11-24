export const mockResumes: Resume[] = [
    {
        id: "sample-1",
        companyName: "XYZ Consulting Firm",
        jobTitle: "Business Development Manager",
        imagePath: "/images/resume_01.png",
        resumePath: "/resumes/sally_branders.pdf",
        feedback: {
            overallScore: 68,
            ATS: {
                score: 72,
                tips: [
                    { type: "good", tip: "Job title alignment: The resume clearly states 'Business Development Manager' matching the job role." },
                    { type: "good", tip: "Standard font sizes and clear section headings make it easy for ATS parsing engines." },
                    { type: "improve", tip: "Use more quantified achievements: Instead of 'identified and pursued opportunities', include metrics (e.g., 'analyzed 15+ markets')." },
                    { type: "improve", tip: "Missing keyword density: Add specific keywords like 'strategic alliances', 'client acquisition', and 'market expansion'." }
                ]
            },
            toneAndStyle: {
                score: 65,
                tips: [
                    {
                        type: "good",
                        tip: "Professional Profile",
                        explanation: "The profile summary is brief and directly sets a professional, business-focused tone."
                    },
                    {
                        type: "improve",
                        tip: "Passive Language",
                        explanation: "Replace passive expressions like 'looking to obtain' with proactive statements such as 'Goal-oriented manager driving revenue expansion through strategic partnership building.'"
                    },
                    {
                        type: "improve",
                        tip: "Repetitive Action Verbs",
                        explanation: "The verb 'conducted' is used repeatedly. Mix in alternatives like 'spearheaded', 'orchestrated', or 'implemented' to keep the content engaging."
                    }
                ]
            },
            content: {
                score: 70,
                tips: [
                    {
                        type: "good",
                        tip: "Solid Professional Progression",
                        explanation: "The roles transition logically from Market Research Analyst to Sales Representative and finally Business Development Manager."
                    },
                    {
                        type: "improve",
                        tip: "Elaborate on MBA achievements",
                        explanation: "Your Master of Business Administration from NYU is a major asset. Mention relevant coursework, projects, or honors earned during this program."
                    },
                    {
                        type: "improve",
                        tip: "Incomplete Date Formatting",
                        explanation: "The placeholders '00/0000 - 00/0000' and '20XX' look like draft errors. Always provide real start/end months and years to show consistent tenure."
                    }
                ]
            },
            structure: {
                score: 60,
                tips: [
                    {
                        type: "good",
                        tip: "Standard Single-Page Layout",
                        explanation: "A single-page design is excellent for candidates with moderate experience, ensuring high-impact content is immediately visible."
                    },
                    {
                        type: "improve",
                        tip: "Avoid Two-Column Division",
                        explanation: "Two-column resume layouts sometimes confuse older ATS software. Consider a single-column layout where experience flows top-to-bottom."
                    },
                    {
                        type: "improve",
                        tip: "Balance Left & Right Column margins",
                        explanation: "The left sidebar feels a bit cramped compared to the main section. Adjust spacing to create a cleaner visual hierarchy."
                    }
                ]
            },
            skills: {
                score: 75,
                tips: [
                    {
                        type: "good",
                        tip: "Relevance of core skills",
                        explanation: "Tools like Excel, PowerPoint, and CRM are essential for business development managers and are clearly marked."
                    },
                    {
                        type: "improve",
                        tip: "Add specific CRM platforms",
                        explanation: "Instead of just 'CRM', specify platforms you have used, such as Salesforce, HubSpot, or Zoho, to trigger relevant keywords."
                    },
                    {
                        type: "improve",
                        tip: "Categorize skills",
                        explanation: "Group your skills into 'Technical Skills' (CRM, Excel) and 'Core Competencies' (Negotiation, Market Research) for better readability."
                    }
                ]
            }
        }
    },
    {
        id: "sample-2",
        companyName: "Burton Agency",
        jobTitle: "Lead Copywriter",
        imagePath: "/images/resume_02.png",
        resumePath: "/resumes/melissa_ware.pdf",
        feedback: {
            overallScore: 85,
            ATS: {
                score: 82,
                tips: [
                    { type: "good", tip: "Strong keyword matching: Words like 'SEO content writing', 'brand voice', and 'campaign' appear naturally." },
                    { type: "good", tip: "Excellent clear dates: Detailed month and year ranges help ATS track experience duration accurately." },
                    { type: "improve", tip: "Modern template icons: The social media icons in the header block may not translate to text on older parser engines." },
                    { type: "improve", tip: "Two-column parse order: Verify that details in the right column ('General Skills') are read after or alongside work history." }
                ]
            },
            toneAndStyle: {
                score: 88,
                tips: [
                    {
                        type: "good",
                        tip: "Action-Oriented Language",
                        explanation: "Strong active verbs like 'wrote', 'increased', 'developed', and 'rewrote' are used to begin achievements, projecting confidence."
                    },
                    {
                        type: "good",
                        tip: "Compelling Profile Statement",
                        explanation: "The introductory bio is punchy, clearly articulates the candidate's value proposition, and includes concrete figures (5+ years, 34% engagement, 67% sales)."
                    },
                    {
                        type: "improve",
                        tip: "Vary Word Choices",
                        explanation: "The word 'engagement' and 'sales' are repeated. Use synonyms like 'audience interaction', 'conversion rates', or 'revenue' to expand vocabulary."
                    }
                ]
            },
            content: {
                score: 90,
                tips: [
                    {
                        type: "good",
                        tip: "Quantified Results",
                        explanation: "Almost every bullet point in the experience section includes concrete results (e.g., 'audience of 120,000+ readers', 'grow base from 6,000 to 30,000+'). This is outstanding."
                    },
                    {
                        type: "good",
                        tip: "Showcases Side Projects",
                        explanation: "Listing the 'Freelance Fiction Writer' project adds depth, demonstrating a genuine passion for writing outside of the corporate setting."
                    },
                    {
                        type: "improve",
                        tip: "Detail SEO metrics",
                        explanation: "You mention 'SEO blog articles'. Specifying organic rank improvements or search volume targets would make this achievement even stronger."
                    }
                ]
            },
            structure: {
                score: 82,
                tips: [
                    {
                        type: "good",
                        tip: "Clean Visual Branding",
                        explanation: "The deep navy header banner and circular headshot make the resume visually striking and professional for creative fields."
                    },
                    {
                        type: "improve",
                        tip: "Headshot ATS compatibility",
                        explanation: "While common in creative roles, profile images can cause parsing issues with some corporate ATS filters. Keep a text-only copy available."
                    }
                ]
            },
            skills: {
                score: 85,
                tips: [
                    {
                        type: "good",
                        tip: "Comprehensive copywriting tools",
                        explanation: "Includes Wordpress, SEO, digital marketing, and creative editing, covering all bases for modern digital copywriters."
                    },
                    {
                        type: "improve",
                        tip: "Add specific analytical tools",
                        explanation: "Since SEO is highlighted, adding tools like Google Analytics, SEMrush, or Ahrefs would validate your SEO content expertise."
                    }
                ]
            }
        }
    },
    {
        id: "sample-3",
        companyName: "ABC Tech Solutions",
        jobTitle: "Senior UX Designer",
        imagePath: "/images/resume_03.png",
        resumePath: "/resumes/max_johnson.pdf",
        feedback: {
            overallScore: 78,
            ATS: {
                score: 70,
                tips: [
                    { type: "good", tip: "Great search terms: Standard industry tools like 'Figma', 'Sketch', and 'InVision' are clearly indexed." },
                    { type: "improve", tip: "Two-column design format: The dark left sidebar could cause modern parsers to scramble contact details and skills." },
                    { type: "improve", tip: "Text extraction errors: The contrast between the white text on the dark sidebar needs to be high enough for visual OCR fallback." }
                ]
            },
            toneAndStyle: {
                score: 82,
                tips: [
                    {
                        type: "good",
                        tip: "Clear Value Proposition",
                        explanation: "The profile reads well, balancing human-centered design principles ('intuitive and visually compelling') with business metrics ('data-driven insights')."
                    },
                    {
                        type: "improve",
                        tip: "Active achievements instead of duties",
                        explanation: "Instead of 'conducted user research', phrase it as: 'Spearheaded user research initiatives that informed interface improvements and directly reduced cart abandonment.'"
                    }
                ]
            },
            content: {
                score: 80,
                tips: [
                    {
                        type: "good",
                        tip: "Strong Education Matching",
                        explanation: "A Master of Science in HCI (Human-Computer Interaction) from NYU is the gold standard for Senior UX Designer roles."
                    },
                    {
                        type: "good",
                        tip: "Impressive metrics",
                        explanation: "Stating 'boosting engagement by 30%' and 'reducing abandonment by 25%' makes the work history highly credible."
                    },
                    {
                        type: "improve",
                        tip: "Elaborate on design deliverables",
                        explanation: "Mention specific deliverables you created, such as wireframes, interactive prototypes, user personas, or customer journey maps."
                    }
                ]
            },
            structure: {
                score: 75,
                tips: [
                    {
                        type: "good",
                        tip: "Modern & structured aesthetic",
                        explanation: "The split layout looks neat, organizing secondary details on the left and primary work/education blocks on the right."
                    },
                    {
                        type: "improve",
                        tip: "Add portfolio URL to headers",
                        explanation: "As a UX designer, your portfolio is your most important document. Place it prominently at the top next to email and phone details."
                    }
                ]
            },
            skills: {
                score: 83,
                tips: [
                    {
                        type: "good",
                        tip: "Industry-standard design tools",
                        explanation: "Listing Figma, Sketch, and Adobe XD highlights command over critical design software."
                    },
                    {
                        type: "improve",
                        tip: "Include design methodology skills",
                        explanation: "Add core UX methodologies like 'Usability Testing', 'Heuristic Evaluation', 'Wireframing', and 'A/B Testing' to the skills list."
                    }
                ]
            }
        }
    }
];
