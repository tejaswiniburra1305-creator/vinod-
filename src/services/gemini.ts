import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  age: number;
  grade: string;
  email: string;
  phone: string;
  aadharNumber: string;
  parentContact: string;
  attendanceStatus: "present" | "absent";
  lastAttentionScore: number;
  feedback: string[];
  role?: "student" | "teacher";
}

export interface AttentionAnalysis {
  overallEngagement: number;
  studentCount: number;
  focusedCount: number;
  distractedCount: number;
  mood: "energetic" | "focused" | "bored" | "confused" | "distracted";
  summary: string;
  recommendations: string[];
  studentDetails?: {
    rollNumber: string;
    attentionScore: number;
    feedback: string;
  }[];
}

export async function analyzeClassroom(base64Image: string, students: Student[]): Promise<AttentionAnalysis> {
  const studentContext = students.map(s => `${s.name} (Roll: ${s.rollNumber})`).join(", ");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `Analyze this classroom image for student attention. 
            Context: The students in this class are: ${studentContext}.
            
            Provide a JSON response:
            {
              "overallEngagement": number (0-100),
              "studentCount": number,
              "focusedCount": number,
              "distractedCount": number,
              "mood": "energetic" | "focused" | "bored" | "confused" | "distracted",
              "summary": "short description",
              "recommendations": ["tip 1", "tip 2"],
              "studentDetails": [
                {
                  "rollNumber": "string matching one of the provided roll numbers",
                  "attentionScore": number (0-100),
                  "feedback": "specific feedback for this student"
                }
              ]
            }`,
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallEngagement: { type: Type.NUMBER },
          studentCount: { type: Type.NUMBER },
          focusedCount: { type: Type.NUMBER },
          distractedCount: { type: Type.NUMBER },
          mood: { type: Type.STRING, enum: ["energetic", "focused", "bored", "confused", "distracted"] },
          summary: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          studentDetails: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                rollNumber: { type: Type.STRING },
                attentionScore: { type: Type.NUMBER },
                feedback: { type: Type.STRING },
              }
            }
          }
        },
        required: ["overallEngagement", "studentCount", "focusedCount", "distractedCount", "mood", "summary", "recommendations"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export interface SessionSummary {
  topic: string;
  keyPoints: string[];
  engagementOverview: string;
  studentHighlights: { name: string; status: string }[];
  overallRating: number;
}

export async function generateSessionSummary(base64Image: string, students: Student[]): Promise<SessionSummary> {
  const studentContext = students.map(s => `${s.name} (Attention: ${s.lastAttentionScore}%)`).join(", ");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `Based on this classroom image and student data, generate a comprehensive session summary.
            Student Data: ${studentContext}
            
            Provide a JSON response:
            {
              "topic": "Inferred lesson topic",
              "keyPoints": ["point 1", "point 2", "point 3"],
              "engagementOverview": "A paragraph summarizing overall class engagement",
              "studentHighlights": [
                { "name": "student name", "status": "e.g., Highly Focused, Needs Encouragement" }
              ],
              "overallRating": number (1-5)
            }`,
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          engagementOverview: { type: Type.STRING },
          studentHighlights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                status: { type: Type.STRING },
              }
            }
          },
          overallRating: { type: Type.NUMBER },
        },
        required: ["topic", "keyPoints", "engagementOverview", "studentHighlights", "overallRating"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function verifyFace(base64Image: string, studentName: string): Promise<boolean> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `Does this image contain a person who looks like they could be ${studentName}? 
            This is for a simulated classroom attendance system. 
            Respond with JSON: { "verified": boolean, "confidence": number }`,
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const result = JSON.parse(response.text || "{}");
  return result.verified === true && result.confidence > 0.7;
}
