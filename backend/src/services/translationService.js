
import axios from "axios";

const translationClient = axios.create({
  baseURL: process.env.TRANSLATION_SERVICE_URL || "http://127.0.0.1:8001",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function translateText({
  text,
  sourceLanguage,
  targetLanguage,
}) {
  const response = await translationClient.post("/translate", {
    text,
    source_language: sourceLanguage,
    target_language: targetLanguage,
  });

  return response.data;
}
