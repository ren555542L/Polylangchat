import { SUPPORTED_LANGUAGES } from "../../constants/languages";
import { Globe } from "lucide-react";

export default function LanguageSelector({
  value,
  onChange,
  label = "Language",
  compact = false,
  className = "",
}) {
  return (
    <div className={`language-selector-wrapper ${className}`} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && !compact && (
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Globe size={14} color="var(--primary-light)" />
          {label}
        </label>
      )}

      <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label || "Select language"}
          style={{
            width: "100%",
            padding: compact ? "6px 28px 6px 10px" : "10px 32px 10px 14px",
            background: "var(--bg-input)",
            border: "1px solid var(--border-medium)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text-main)",
            fontSize: compact ? 12 : 14,
            fontWeight: 500,
            appearance: "none",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
          }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} style={{ background: "#171624", color: "#f3f4f6" }}>
              {lang.flag} {lang.name} ({lang.nativeName})
            </option>
          ))}
        </select>

        <span
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: "var(--text-muted)",
            fontSize: 10,
          }}
        >
          ▼
        </span>
      </div>
    </div>
  );
}
