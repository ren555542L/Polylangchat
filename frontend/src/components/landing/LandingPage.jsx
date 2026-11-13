import { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Globe2,
  Lock,
  Zap,
  Repeat,
  CheckCircle,
  Eye,
  EyeOff,
  MessageSquare,
  Shield,
  Layers,
} from "lucide-react";
import "../../styles/landing.css";
import { SUPPORTED_LANGUAGES } from "../../constants/languages";
import { useAuth } from "../../context/AuthContext";
import { MOCK_USERS } from "../../data/mockData";

export default function LandingPage({ onLogin, onSignup, onEnterApp }) {
  const { isAuthenticated, currentUser, switchMockUser } = useAuth();

  // Hero interactive state
  const [heroOriginalRevealed, setHeroOriginalRevealed] = useState(false);

  // Playground interactive state
  const [playgroundInput, setPlaygroundInput] = useState(
    "नमस्ते! क्या हम कल दोपहर को प्रोजेक्ट का रिव्यु कर सकते हैं?"
  );
  const [selectedPresetId, setSelectedPresetId] = useState("p1");
  const [playgroundTargetLang, setPlaygroundTargetLang] = useState("en");

  const PRESETS = [
    {
      id: "p1",
      lang: "hi",
      label: "Hindi",
      original: "नमस्ते! क्या हम कल दोपहर को प्रोजेक्ट का रिव्यु कर सकते हैं?",
      translations: {
        en: "Hello! Can we review the project tomorrow afternoon?",
        ta: "வணக்கம்! நாளை மதியம் திட்டத்தை மதிப்பாய்வு செய்யலாமா?",
        te: "నమస్కారం! రేపు మధ్యాహ్నం ప్రాజెక్ట్ సమీక్ష చేయవచ్చా?",
        bn: "নমস্কার! আমরা কি আগামীকাল দুপুরে প্রজেক্ট রিভিউ করতে পারি?",
      },
    },
    {
      id: "p2",
      lang: "ta",
      label: "Tamil",
      original: "வணக்கம்! புதிய வடிவமைப்பு மிக அழகாக இருக்கிறது.",
      translations: {
        en: "Hello! The new design looks very beautiful.",
        hi: "नमस्ते! नया डिज़ाइन बहुत सुंदर लग रहा है।",
        te: "నమస్కారం! కొత్త డిజైన్ చాలా అందంగా ఉంది.",
        bn: "নমস্কার! নতুন ডিজাইনটি খুবই সুন্দর দেখাচ্ছে।",
      },
    },
    {
      id: "p3",
      lang: "hi-Latn",
      label: "Hinglish",
      original: "Sab ready hai bro, client ko presentation bahut pasand aayegi!",
      translations: {
        en: "Everything is ready bro, the client will really love the presentation!",
        hi: "सब तैयार है भाई, क्लाइंट को प्रेजेंटेशन बहुत पसंद आएगी!",
        ta: "அனைத்தும் தயாராக உள்ளது நண்பா, வாடிக்கையாளருக்கு விளக்கக்காட்சி மிகவும் பிடிக்கும்!",
        bn: "সব তৈরি আছে ভাই, ক্লায়েন্ট প্রেজেন্টেশন খুব পছন্দ করবে!",
      },
    },
    {
      id: "p4",
      lang: "bn",
      label: "Bengali",
      original: "দারুণ আইডিয়া! আমি প্রয়োজনীয় ফাইলগুলো এখনই পাঠাচ্ছি।",
      translations: {
        en: "Great idea! I am sending the necessary files right away.",
        hi: "शानदार विचार! मैं आवश्यक फाइलें अभी भेज रहा हूँ।",
        ta: "சிறந்த யோசனை! தேவையான கோப்புகளை இப்போதே அனுப்புகிறேன்.",
        te: "గొప్ప ఆలోచన! నేను అవసరమైన ఫైళ్లను ఇప్పుడే పంపుతున్నాను.",
      },
    },
  ];

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setPlaygroundInput(preset.original);
  };

  const getPlaygroundTranslation = () => {
    const activePreset = PRESETS.find((p) => p.id === selectedPresetId);
    if (activePreset && activePreset.original === playgroundInput) {
      return (
        activePreset.translations[playgroundTargetLang] ||
        activePreset.translations.en ||
        "Translation preview ready."
      );
    }
    return `[Translated to ${playgroundTargetLang.toUpperCase()}]: ${playgroundInput}`;
  };

  const handleQuickDemoEnter = (user) => {
    switchMockUser(user);
    onEnterApp();
  };

  return (
    <div className="landing-container">
      {/* Background ambient lighting */}
      <div className="landing-bg-glow-1" />
      <div className="landing-bg-glow-2" />

      {/* Navigation Header */}
      <nav className="landing-navbar">
        <div className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="landing-brand-logo">P</div>
          <span className="landing-brand-name">
            polyglot<span>.</span>
          </span>
        </div>

        <div className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#preview" className="landing-nav-link">Live Preview</a>
          <a href="#playground" className="landing-nav-link">Try Live</a>
          <a href="#languages" className="landing-nav-link">11 Languages</a>
          <a href="#security" className="landing-nav-link">Security</a>
        </div>

        <div className="landing-nav-actions">
          {isAuthenticated ? (
            <button className="btn-nav-signup" onClick={onEnterApp}>
              <span>Open Chat</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <button className="btn-nav-login" onClick={onLogin}>
                Log in
              </button>
              <button className="btn-nav-signup" onClick={onSignup}>
                <span>Get started free</span>
                <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="hero-pill-badge">
          <Sparkles size={14} color="var(--primary-light)" />
          <span>NEURAL MULTILINGUAL REAL-TIME MESSAGING</span>
        </div>

        <h1 className="hero-headline">
          Different languages.{" "}
          <span className="hero-headline-gradient">One fluid conversation.</span>
        </h1>

        <p className="hero-subtitle">
          Type in the language you think in. Your contacts receive instant translations
          in their preferred tongue — while the sender's authentic original text is
          preserved 100% of the time.
        </p>

        <div className="hero-cta-group">
          <button className="btn-hero-primary" onClick={onSignup}>
            <span>Start Chatting Free</span>
            <ArrowRight size={18} />
          </button>

          <button
            className="btn-hero-secondary"
            onClick={() => handleQuickDemoEnter(MOCK_USERS[0])}
          >
            <span>Instant Demo as Aarav (Hindi)</span>
            <span style={{ fontSize: 13, color: "var(--accent-cyan)" }}>➔</span>
          </button>
        </div>

        <div className="hero-micro-notes">
          <span>
            <CheckCircle size={14} color="var(--accent-emerald)" />
            No credit card needed
          </span>
          <span>
            <CheckCircle size={14} color="var(--accent-emerald)" />
            11 Indian & International languages
          </span>
          <span>
            <CheckCircle size={14} color="var(--accent-emerald)" />
            End-to-End WebSocket architecture
          </span>
        </div>

        {/* Live Translation Hero Card (Interactive Preview) */}
        <div className="hero-visual-container" id="preview">
          <div className="hero-chat-mockup-card">
            <div className="mockup-header">
              <div className="mockup-users-flow">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img
                    src={MOCK_USERS[0].avatar}
                    alt="Aarav"
                    style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Aarav Sharma</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Typing in Hinglish / Hindi</div>
                  </div>
                </div>

                <span style={{ color: "var(--border-medium)", margin: "0 4px" }}>➔</span>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt="Talan"
                    style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Talan Septimus</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Reading in English</div>
                  </div>
                </div>
              </div>

              <div className="mockup-bridge-badge">
                <span>✦ LIVE TRANSLATION BRIDGE</span>
              </div>
            </div>

            <div className="mockup-message-group">
              {/* Sent in Hinglish / Hindi */}
              <div className="mockup-msg received">
                <div className="mockup-bubble">
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span>ORIGINAL MESSAGE • HINDI / HINGLISH</span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 500 }}>
                    Kal milte hain! Sab taiyari ho chuki hai. 😊
                  </p>
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Sent at 10:42 AM</span>
                </div>
              </div>

              <div className="mockup-bridge-divider">
                <span>文 Instant AI Neural Translation</span>
              </div>

              {/* Received in English */}
              <div className="mockup-msg sent">
                <div className="mockup-bubble">
                  <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.9, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span>TRANSLATED TO ENGLISH</span>
                    <button
                      onClick={() => setHeroOriginalRevealed(!heroOriginalRevealed)}
                      style={{
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        background: "rgba(0, 0, 0, 0.25)",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-full)",
                      }}
                    >
                      {heroOriginalRevealed ? <EyeOff size={11} /> : <Eye size={11} />}
                      <span>{heroOriginalRevealed ? "Hide original" : "Reveal original"}</span>
                    </button>
                  </div>

                  <p style={{ fontSize: 15, fontWeight: 500 }}>
                    {heroOriginalRevealed
                      ? "Kal milte hain! Sab taiyari ho chuki hai. 😊"
                      : "See you tomorrow! All preparations are done. 😊"}
                  </p>

                  {heroOriginalRevealed && (
                    <div
                      style={{
                        marginTop: 4,
                        padding: "6px 8px",
                        background: "rgba(0, 0, 0, 0.35)",
                        borderRadius: "var(--radius-xs)",
                        fontSize: 11,
                        fontStyle: "italic",
                      }}
                    >
                      Original text preserved and verified.
                    </div>
                  )}

                  <span style={{ fontSize: 10, opacity: 0.8, alignSelf: "flex-end" }}>
                    Delivered & Translated in 220ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Supported Languages Ribbon */}
      <section className="languages-ribbon-section" id="languages">
        <div className="languages-ribbon-title">
          Supporting 11 Indian & International Languages
        </div>
        <div className="languages-tags-grid">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              className="lang-tag-interactive"
              onClick={() => {
                setPlaygroundTargetLang(lang.code);
                const el = document.getElementById("playground");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              title={`Click to test ${lang.name} in the live playground`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
              <span className="native-script">({lang.nativeName})</span>
            </div>
          ))}
        </div>
      </section>

      {/* Live Interactive Playground Section */}
      <section className="playground-section" id="playground">
        <div className="section-eyebrow">Interactive Live Playground</div>
        <h2 className="section-title">Test the translation bridge right now</h2>
        <p className="section-desc">
          Click any preset sample or type in your language below to witness real-time
          cross-lingual translation.
        </p>

        <div className="playground-card">
          <div className="playground-sample-pills">
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginRight: 6 }}>
              Quick Presets:
            </span>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                className={`sample-chip ${selectedPresetId === preset.id ? "active" : ""}`}
                onClick={() => handleSelectPreset(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="playground-grid">
            {/* Input Box */}
            <div className="playground-box">
              <div className="playground-box-header">
                <span>INPUT MESSAGE</span>
                <span>Type freely</span>
              </div>
              <textarea
                className="playground-textarea"
                value={playgroundInput}
                onChange={(e) => setPlaygroundInput(e.target.value)}
                placeholder="Write something in any language..."
              />
            </div>

            {/* Translation Output Box */}
            <div className="playground-box" style={{ background: "rgba(124, 58, 237, 0.08)", borderColor: "var(--border-glow)" }}>
              <div className="playground-box-header">
                <span style={{ color: "var(--primary-light)" }}>RECIPIENT'S TRANSLATED VIEW</span>
                <select
                  value={playgroundTargetLang}
                  onChange={(e) => setPlaygroundTargetLang(e.target.value)}
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-medium)",
                    color: "var(--text-main)",
                    borderRadius: "var(--radius-xs)",
                    fontSize: 11,
                    padding: "3px 6px",
                  }}
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} style={{ background: "#171624" }}>
                      Translate to: {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="playground-result-text">
                {getPlaygroundTranslation()}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                <span>✓ Original wording preserved</span>
                <button
                  onClick={onSignup}
                  style={{ color: "var(--accent-cyan)", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}
                >
                  <span>Chat in real-time</span>
                  <ArrowRight size={11} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="features-section" id="features">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="section-eyebrow">Architecture & Capabilities</div>
          <h2 className="section-title">Built for authentic communication</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: "rgba(124, 58, 237, 0.15)", color: "var(--primary-light)" }}>
              <Globe2 size={26} />
            </div>
            <h3 className="feature-title">Native Script Nuance</h3>
            <p className="feature-description">
              Optimized for regional idioms, Romanized Hindi (Hinglish), Devanagari,
              Dravidian, and Eastern scripts without awkward machine-literal phrases.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: "rgba(6, 182, 212, 0.15)", color: "var(--accent-cyan)" }}>
              <Repeat size={26} />
            </div>
            <h3 className="feature-title">Original Always Preserved</h3>
            <p className="feature-description">
              Translations complement the original rather than replacing it. Recipients can
              reveal, copy, and cross-reference the sender's exact original words anytime.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--accent-emerald)" }}>
              <Zap size={26} />
            </div>
            <h3 className="feature-title">Instant WebSocket Delivery</h3>
            <p className="feature-description">
              Messages dispatch immediately to the conversation room with zero delay, while
              neural translation nodes process translations asynchronously.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--accent-amber)" }}>
              <Layers size={26} />
            </div>
            <h3 className="feature-title">Per-User Language Preferences</h3>
            <p className="feature-description">
              Every participant chooses their own preferred language. A Hindi speaker and a
              Tamil speaker converse simultaneously with zero friction.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
              <Shield size={26} />
            </div>
            <h3 className="feature-title">Private & Secure</h3>
            <p className="feature-description">
              Isolated user authentication with JWT security. Your personal messages and
              translation history remain strictly confidential.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: "rgba(236, 72, 153, 0.15)", color: "#f472b6" }}>
              <MessageSquare size={26} />
            </div>
            <h3 className="feature-title">Rich Multimedia & Files</h3>
            <p className="feature-description">
              Share images, files, documents, and emojis alongside cross-lingual messages
              within a responsive dark-themed workspace.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="landing-cta-banner" id="security">
        <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
          Break language barriers in your next conversation
        </h2>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 600 }}>
          Join Polyglot Chat today. Connect with colleagues, friends, and family across
          India and the world in the language you speak best.
        </p>

        <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn-hero-primary" onClick={onSignup}>
            <span>Create Free Account</span>
            <ArrowRight size={18} />
          </button>
          <button className="btn-hero-secondary" onClick={onLogin}>
            <span>Sign In to Existing Account</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="landing-brand-logo" style={{ width: 28, height: 28, fontSize: 14 }}>P</div>
          <span style={{ fontWeight: 700, color: "#fff" }}>polyglot.</span>
          <span>© 2026 Polyglot Chat Inc. All rights reserved.</span>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          <a href="#features" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Features</a>
          <a href="#languages" style={{ color: "var(--text-muted)", textDecoration: "none" }}>11 Languages</a>
          <button onClick={onLogin} style={{ color: "var(--primary-light)", fontSize: 13 }}>
            Log in ↗
          </button>
        </div>
      </footer>
    </div>
  );
}
