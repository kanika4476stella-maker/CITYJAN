import { NextResponse } from "next/server";
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";

// We'll mock some translations if AWS is not configured so the demo still works
const mockDict: Record<string, Record<string, string>> = {
  hi: {
    "Dashboard": "डैशबोर्ड",
    "Report an Issue": "समस्या दर्ज करें",
    "My Submitted Reports": "मेरी रिपोर्टें",
    "Ticket Status Tracker": "टिकट स्थिति ट्रैकर",
    "Nearby Emergency Resources": "आसपास के आपातकालीन संसाधन",
    "View Emergency Contacts": "आपातकालीन संपर्क देखें",
    "Govt Announcements": "सरकारी घोषणाएँ",
    "Profile Settings": "प्रोफ़ाइल सेटिंग्स",
    "City Overview": "शहर का अवलोकन",
    "Total Complaints": "कुल शिकायतें",
    "Resolved": "हल हो गई",
    "Pending": "लंबित",
  },
  ta: {
    "Dashboard": "டாஷ்போர்டு",
    "Report an Issue": "சிக்கலைப் புகாரளிக்கவும்",
  },
  bn: {
    "Dashboard": "ড্যাশবোর্ড",
    "Report an Issue": "সমস্যা রিপোর্ট করুন",
  },
  mr: {
    "Dashboard": "डॅशबोर्ड",
    "Report an Issue": "समस्या नोंदवा",
  }
};

export async function POST(req: Request) {
  try {
    const { text, targetLanguage } = await req.json();

    if (!text || !targetLanguage) {
      return NextResponse.json({ error: "Missing text or targetLanguage" }, { status: 400 });
    }

    if (targetLanguage === "en") {
      return NextResponse.json({ translatedText: text });
    }

    try {
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        const client = new TranslateClient({
          region: process.env.AWS_REGION || "ap-south-1",
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        });

        const command = new TranslateTextCommand({
          Text: text,
          SourceLanguageCode: "en",
          TargetLanguageCode: targetLanguage,
        });

        const response = await client.send(command);
        return NextResponse.json({ translatedText: response.TranslatedText || text });
      } else {
        // Mock fallback if AWS keys aren't present
        const langDict = mockDict[targetLanguage] || {};
        const translated = langDict[text];
        if (translated) {
          return NextResponse.json({ translatedText: translated });
        }
        
        // Simulating auto translation for dynamic content
        return NextResponse.json({ translatedText: `[${targetLanguage.toUpperCase()}] ${text}` });
      }
    } catch (awsError) {
      console.warn("AWS Translate failed", awsError);
      return NextResponse.json({ translatedText: `[ERR] ${text}` });
    }
  } catch (error) {
    console.error("Translate Protocol Error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
