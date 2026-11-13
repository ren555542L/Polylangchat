
import "dotenv/config";
import { translateText } from "./src/services/translationService.js";

try {
  const result = await translateText({
    text: "Hello, how are you?",
    sourceLanguage: "eng_Latn",
    targetLanguage: "hin_Deva",
  });

  console.log("Original:", result.original_text);
  console.log("Translation:", result.translated_text);
  console.log("Inference time:", result.inference_seconds, "seconds");
  console.log("PASS: Node.js successfully called the Python translation service.");
} catch (error) {
  console.error(
    "FAIL:",
    error.response?.data ?? error.message
  );
  process.exitCode = 1;
}
    