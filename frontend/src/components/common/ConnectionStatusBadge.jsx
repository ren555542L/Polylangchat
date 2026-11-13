import { Wifi, Sparkles, AlertCircle } from "lucide-react";

export default function ConnectionStatusBadge({ status = "connected", onClick }) {
  const getBadgeConfig = () => {
    switch (status) {
      case "connected":
        return {
          label: "Live Connected",
          icon: <Wifi size={12} />,
          className: "connection-pill connected",
        };
      case "mock":
        return {
          label: "Mock Demo Mode",
          icon: <Sparkles size={12} />,
          className: "connection-pill mock",
        };
      case "reconnecting":
        return {
          label: "Reconnecting…",
          icon: <AlertCircle size={12} />,
          className: "connection-pill offline",
        };
      case "offline":
      default:
        return {
          label: "Offline",
          icon: <AlertCircle size={12} />,
          className: "connection-pill offline",
        };
    }
  };

  const { label, icon, className } = getBadgeConfig();

  return (
    <button
      onClick={onClick}
      className={className}
      title="Click to toggle between Mock Demo Mode and Live Backend"
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
