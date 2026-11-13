export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", nllb: "eng_Latn" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", nllb: "hin_Deva" },
  { code: "hi-Latn", name: "Hinglish", nativeName: "Romanized Hindi", flag: "🇮🇳", nllb: "hin_Latn" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳", nllb: "ben_Beng" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", nllb: "tam_Taml" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", nllb: "tel_Telu" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳", nllb: "mar_Deva" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳", nllb: "guj_Gujr" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳", nllb: "kan_Knda" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳", nllb: "mal_Mlym" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳", nllb: "pan_Guru" },
];

export const getLanguageByCode = (code) => {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code) || SUPPORTED_LANGUAGES[0];
};

export const getLanguageName = (code) => {
  const lang = getLanguageByCode(code);
  return lang ? `${lang.name} (${lang.nativeName})` : code;
};
