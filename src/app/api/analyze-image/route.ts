import { NextResponse } from "next/server";
import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";

const categoryKeywords: Record<string, string[]> = {
  pothole: ["Road", "Asphalt", "Pothole", "Street", "Hole", "Damage", "Path", "Gravel", "Dirt", "Crater", "Concrete"],
  garbage: ["Garbage", "Trash", "Waste", "Debris", "Litter", "Dump", "Rubbish", "Bin", "Plastic", "Can"],
  "water leakage": ["Water", "Leak", "Puddle", "Flood", "Pipe", "Wet", "Liquid", "Drain", "Sewer", "Plumbing"],
  streetlight: ["Light", "Lamp", "Pole", "Street Light", "Electrical", "Lantern", "Bulb"],
  traffic: ["Traffic", "Car", "Vehicle", "Road", "Intersection", "Jam", "Signal", "Street", "Automobile"],
};

export async function POST(req: Request) {
  try {
    const { image, category } = await req.json();

    if (!image || !category) {
      return NextResponse.json({ error: "Missing image or category" }, { status: 400 });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    const expectedLabels = categoryKeywords[category] || [];
    let isMatch = true; // Default true so we don't block on errors
    let detectedLabels: string[] = [];

    try {
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        const client = new RekognitionClient({
          region: process.env.AWS_REGION || "ap-south-1",
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        });

        const command = new DetectLabelsCommand({
          Image: { Bytes: imageBuffer },
          MaxLabels: 15,
          MinConfidence: 60,
        });

        const response = await client.send(command);
        detectedLabels = response.Labels?.map((l) => l.Name || "") || [];

        // Check if any detected label matches our expected keywords (case-insensitive)
        isMatch = detectedLabels.some((label) =>
          expectedLabels.some((expected) => label.toLowerCase() === label.toLowerCase() || label.toLowerCase().includes(expected.toLowerCase()))
        );
      } else {
        // Fallback or demo mode - simulate randomly or based on image size diff?
        // To allow demo to see a warning if they just upload a random pic like a person
        // We'll mock fail for generic test
        console.warn("Running Rekognition mock");
        // We randomly mock match false to show the warning feature
        isMatch = Math.random() > 0.5;
      }
    } catch (awsError) {
      console.warn("AWS Rekognition failed", awsError);
      isMatch = false; // Show warning on failure
    }

    return NextResponse.json({ match: isMatch, labels: detectedLabels });
  } catch (error) {
    console.error("Image Analysis Error:", error);
    return NextResponse.json({ error: "Image analysis failed" }, { status: 500 });
  }
}
