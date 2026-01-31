
import { GoogleGenAI, Type } from "@google/genai";
import { CellState } from "../types.ts";

export async function getHint(board: CellState[][]) {
  // Initialize right before call to ensure environment variables are ready
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const boardStr = board.map(row => row.map(cell => 
    cell === 'peg' ? 'P' : cell === 'empty' ? 'E' : '.'
  ).join('')).join('\n');

  const prompt = `
    I am playing Brainvita (Peg Solitaire). The board state is:
    ${boardStr}
    
    'P' is a peg, 'E' is an empty hole, '.' is invalid.
    Rules: A peg can move by jumping over an adjacent peg into an empty hole.
    Find ONE valid move. Return the "from" and "to" coordinates (0-indexed row and column).
    If no moves remain, say no moves.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasMove: { type: Type.BOOLEAN },
            from: {
              type: Type.OBJECT,
              properties: {
                r: { type: Type.INTEGER },
                c: { type: Type.INTEGER }
              }
            },
            to: {
              type: Type.OBJECT,
              properties: {
                r: { type: Type.INTEGER },
                c: { type: Type.INTEGER }
              }
            },
            explanation: { type: Type.STRING }
          },
          required: ["hasMove"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}
