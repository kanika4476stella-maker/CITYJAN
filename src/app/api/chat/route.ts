import { NextResponse } from 'next/server';

// This is a "Smart Mock" engine for JanBot in case AWS Bedrock/Lex is not configured.
// It provides a realistic civic assistant experience for the demo.
const MOCK_RESPONSES: Record<string, string[]> = {
  greeting: [
    "Namaste! I am JanBot, your 24/7 civic assistant. How can I help you today?",
    "Hello! Ready to make our city better. What's on your mind?",
    "Good day! I can help you file reports, check status, or find nearby facilities. How may I assist?",
    "Ram Ram! Kaise help kar sakta hoon aapki?",
  ],
  pothole: [
    "I've noted the pothole issue. Please provide the exact location or a photo to help the team reach faster.",
    "Road maintenance is a priority! You can file a 'Roads' grievance and our system will auto-route it to the engineering wing.",
    "Sarak kharaab hai? I can file a report for you right now.",
  ],
  water: [
    "Water supply issues are handled as high priority. Is there a total outage or low pressure in your area?",
    "I can check the ward announcements for scheduled maintenance. Would you like me to do that?",
    "Paani ki samasya? If it's a leakage, please mention the sector so we can dispatch the plumber team.",
  ],
  electricity: [
    "Power cuts can be frustrating. Is it a localized fuse issue or a wider area power outage?",
    "I can help you log an electricity grievance. Do you have your consumer ID handy?",
    "Bijli chali gayi? I can check if there's any scheduled maintenance in your ward.",
  ],
  garbage: [
    "Cleanliness is non-negotiable! Is the garbage collector not coming or is it a dump accumulation?",
    "I'll help you file a 'Sanitation' report. A photo helps the waste management team tremendously.",
    "Kachra nahi uthaya? Let me know the exact spot and I'll alert the ward supervisor.",
  ],
  parks: [
    "Green spaces are vital! Are you reporting about maintenance, lighting, or broken equipment in the park?",
    "I can log a request for park maintenance. Which park are we talking about?",
    "Park ki safai? I'll forward this to the Horticulture department.",
  ],
  tax: [
    "You can pay your house tax and property tax through our online 'E-Suvidha' portal. Would you like the link?",
    "Digital payments are now active. You get a 5% rebate if paid before March 31st!",
    "Tax bharna hai? I can guide you to the official municipal gateway.",
  ],
  emergency: [
    "REMAIN CALM. If this is a life-threatening emergency, call 112 or 100 immediately.",
    "I can provide the helpline numbers for Fire, Police, or Ambulance. Which one do you need?",
    "Emergency? Use the 'Emergency Resources' section on your dashboard for the nearest help centers.",
  ],
  status: [
    "Please provide your Ticket ID (e.g., GR-2025-XXX) and I'll fetch the latest update for you.",
    "You can view all your active reports in the 'My Reports' tab of your dashboard.",
    "Complaint ka status check karna hai? Just share the ID.",
  ],
  default: [
    "I understand. I can help you lodge a formal complaint about this in the 'Grievance' section.",
    "For this issue, I recommend filing a report so our municipal officers can investigate. Shall I guide you to the form?",
    "That's important. Our 'Community' section also discusses similar issues in your ward. Would you like to check it out?",
    "Samajh gaya. Kya main iss baare mein koi report file karun?",
  ],
};

const KEYWORD_MAP: Record<string, string[]> = {
  greeting: ["hello", "hi", "hey", "namaste", "morning", "evening", "ram ram", "kaise"],
  pothole: ["pothole", "road", "sarak", "pathole", "street", "highway", "lane", "broken"],
  water: ["water", "sewage", "leak", "paani", "drain", "pipe", "tank", "supply"],
  electricity: ["light", "power", "bijli", "current", "electricity", "transformer", "fuse", "cut"],
  garbage: ["garbage", "trash", "kachra", "clean", "smell", "waste", "bin", "dustbin"],
  parks: ["park", "garden", "tree", "plant", "green", "bench", "swing"],
  tax: ["tax", "money", "payment", "bill", "property", "house tax", "payslip"],
  emergency: ["emergency", "help", "police", "ambulance", "fire", "accident", "urgent", "112"],
  status: ["status", "check", "track", "ticket", "id", "update", "where is", "progress"],
};

function getMockResponse(text: string): string {
  const lower = text.toLowerCase();

  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      const responses = MOCK_RESPONSES[category];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  const defaults = MOCK_RESPONSES.default;
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Check for AWS credentials to potentially use real Bedrock/Lex
    const hasAws = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

    if (hasAws) {
      // Logic for Amazon Bedrock / Lex could go here
      // For now, we still use the high-quality mock to ensure 100% uptime for the demo
      // but in a production environment, you'd call the AWS SDK here.
    }

    // Simulate network delay for AI-like feel
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const response = getMockResponse(message);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
