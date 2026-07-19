import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function main() {
  const env = fs.readFileSync(".env", "utf8");
  const keyMatch = env.match(/GEMINI_API_KEY=(.*)/);
  if (!keyMatch) throw new Error("Key not found in .env");
  
  const ai = new GoogleGenAI({ apiKey: keyMatch[1].trim() });
  try {
    const models = await ai.models.list();
    for await (const m of models) {
      console.log(m.name);
    }
  } catch (e) {
    console.error(e);
  }
}

main();
