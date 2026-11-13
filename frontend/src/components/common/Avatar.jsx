export default function Avatar({
  src,
  name = "User",
  size = 40,
  online = false,
  className = "",
  showOnlineDot = true,
}) {
  const getInitials = (str) => {
    if (!str) return "U";
    const parts = str.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const getGradient = (str) => {
    const gradients = [
      "linear-gradient(135deg, #6366f1, #a855f7)",
      "linear-gradient(135deg, #ec4899, #8b5cf6)",
      "linear-gradient(135deg, #3b82f6, #06b6d4)",
      "linear-gradient(135deg, #10b981, #3b82f6)",
      "linear-gradient(135deg, #f59e0b, #ef4444)",
      "linear-gradient(135deg, #8b5cf6, #d946ef)",
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <div
      className={`avatar-container ${className}`}
      style={{
        width: size,
        height: size,
        position: "relative",
        flexShrink: 0,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
            border: "1.5px solid rgba(255, 255, 255, 0.1)",
          }}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}

      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          display: src ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          background: getGradient(name),
          color: "#ffffff",
          fontWeight: 700,
          fontSize: Math.max(11, Math.floor(size * 0.38)),
          userSelect: "none",
          border: "1.5px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {getInitials(name)}
      </div>

      {showOnlineDot && online && (
        <span
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: Math.max(10, Math.floor(size * 0.28)),
            height: Math.max(10, Math.floor(size * 0.28)),
            borderRadius: "50%",
            backgroundColor: "#10b981",
            border: "2px solid #13121d",
            boxShadow: "0 0 6px rgba(16, 185, 129, 0.7)",
          }}
        />
      )}
    </div>
  );
}
