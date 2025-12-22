// utils/excelTemplateGenerator.js

export const generateToeicTemplate = () => {
  // Create template data structure
  const template = [
    {
      questionContent: "What is shown in the photograph?",
      optionA: "A person is sitting",
      optionB: "A person is standing",
      optionC: "A person is walking",
      optionD: "A person is running",
      correctOption: "A",
      questionImage: "part1_q1.jpg",
      questionScript: "Look at the picture marked number 1 in your test book.",
      questionAudio: "part1_q1.mp3",
      questionExplanation: "The correct answer is A because...",
      orderNumber: 1,
      questionPassage: "",
      questionPart: 1
    },
    {
      questionContent: "",
      optionA: "Yes, I did",
      optionB: "At the bank",
      optionC: "Tomorrow morning",
      optionD: "No, thank you",
      correctOption: "B",
      questionImage: "",
      questionScript: "Where did you go yesterday?",
      questionAudio: "part2_q7.mp3",
      questionExplanation: "Response B is appropriate for a 'where' question.",
      orderNumber: 7,
      questionPassage: "",
      questionPart: 2
    },
    {
      questionContent: "What are the speakers mainly discussing?",
      optionA: "A business trip",
      optionB: "A conference",
      optionC: "A meeting schedule",
      optionD: "A project deadline",
      correctOption: "A",
      questionImage: "",
      questionScript: "Questions 32-34 refer to the following conversation.",
      questionAudio: "part3_conv1.mp3",
      questionExplanation: "The conversation focuses on planning a business trip.",
      orderNumber: 32,
      questionPassage: "Conversation 1",
      questionPart: 3
    },
    {
      questionContent: "Where most likely are the speakers?",
      optionA: "At an airport",
      optionB: "At a hotel",
      optionC: "At an office",
      optionD: "At a restaurant",
      correctOption: "C",
      questionImage: "",
      questionScript: "",
      questionAudio: "part3_conv1.mp3",
      questionExplanation: "Context clues indicate an office setting.",
      orderNumber: 33,
      questionPassage: "Conversation 1",
      questionPart: 3
    },
    {
      questionContent: "What will the man probably do next?",
      optionA: "Make a phone call",
      optionB: "Send an email",
      optionC: "Schedule a meeting",
      optionD: "Book a flight",
      correctOption: "D",
      questionImage: "",
      questionScript: "",
      questionAudio: "part3_conv1.mp3",
      questionExplanation: "The man mentions he will book his flight.",
      orderNumber: 34,
      questionPassage: "Conversation 1",
      questionPart: 3
    },
    {
      questionContent: "Most business owners _______ their employees to work from home.",
      optionA: "allow",
      optionB: "allows",
      optionC: "allowing",
      optionD: "to allow",
      correctOption: "A",
      questionImage: "",
      questionScript: "",
      questionAudio: "",
      questionExplanation: "Subject-verb agreement: plural subject requires base verb.",
      orderNumber: 101,
      questionPassage: "",
      questionPart: 5
    },
    {
      questionContent: "",
      optionA: "However",
      optionB: "Therefore",
      optionC: "Moreover",
      optionD: "Nevertheless",
      correctOption: "B",
      questionImage: "",
      questionScript: "",
      questionAudio: "",
      questionExplanation: "Therefore shows logical consequence.",
      orderNumber: 131,
      questionPassage: "Questions 131-134 refer to the following letter.\n\nDear Valued Customer,\n\nWe are pleased to announce that our company will be expanding its services to include online ordering. [131] ______, customers will be able to place orders 24 hours a day.",
      questionPart: 6
    },
    {
      questionContent: "What is the purpose of the letter?",
      optionA: "To announce a new service",
      optionB: "To apologize for an error",
      optionC: "To request payment",
      optionD: "To confirm an order",
      correctOption: "A",
      questionImage: "",
      questionScript: "",
      questionAudio: "",
      questionExplanation: "The letter announces the expansion of online ordering services.",
      orderNumber: 147,
      questionPassage: "Questions 147-148 refer to the following email.\n\nFrom: John Smith <j.smith@company.com>\nTo: All Staff\nSubject: New Office Hours\nDate: March 15\n\nDear Team,\n\nEffective April 1, our office hours will change to 8:00 AM - 5:00 PM, Monday through Friday. This change will allow us to better serve our international clients.",
      questionPart: 7
    }
  ];

  // Convert to CSV format
  const headers = [
    "questionContent",
    "optionA", 
    "optionB",
    "optionC",
    "optionD",
    "correctOption",
    "questionImage",
    "questionScript",
    "questionAudio",
    "questionExplanation",
    "orderNumber",
    "questionPassage",
    "questionPart"
  ];

  let csv = headers.join(",") + "\n";
  
  template.forEach(row => {
    const rowData = headers.map(header => {
      const value = row[header] || "";
      // Escape quotes and wrap in quotes if contains comma or newline
      if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
        return '"' + value.replace(/"/g, '""') + '"';
      }
      return value;
    });
    csv += rowData.join(",") + "\n";
  });

  return csv;
};

export const downloadToeicTemplate = () => {
  const csv = generateToeicTemplate();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'toeic_template.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Instructions for using the template
export const TEMPLATE_INSTRUCTIONS = `
📋 TOEIC EXCEL TEMPLATE INSTRUCTIONS

Required Columns:
• questionContent: The question text (can be empty for Part 1, 2)
• optionA, optionB, optionC, optionD: Answer choices
• correctOption: The correct answer (A, B, C, or D)
• questionImage: Image filename (for Part 1, 3, 4, 7)
• questionScript: Audio script or question prompt
• questionAudio: Audio filename (for Part 1-4)
• questionExplanation: Explanation of the correct answer
• orderNumber: Question number (1-200)
• questionPassage: Passage text or group identifier (for Part 3, 4, 6, 7)
• questionPart: Part number (1-7)

Question Grouping Rules:
• Part 3 & 4: 3 questions per conversation/talk (use same questionPassage)
• Part 6: 4 questions per passage (use same questionPassage)
• Part 7: 2-5 questions per passage (use same questionPassage)

File Naming:
• Audio files: Match exactly with questionAudio column
• Image files: Match exactly with questionImage column
• Include file extensions (.mp3, .jpg, .png, etc.)

Upload Process:
1. Fill in the Excel template with your questions
2. Save as .xlsx or .xls format
3. Prepare all audio/image files with matching names
4. Upload Excel + all audio/image files together
`;