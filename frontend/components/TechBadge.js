export default function TechBadge({ language }) {
  // Normalize language to lowercase to match keys easily
  const langKey = language ? language.toLowerCase() : "default";

  const styles = {
    python: "bg-blue-100 text-blue-800 border-blue-200",
    javascript: "bg-yellow-100 text-yellow-800 border-yellow-300",
    typescript: "bg-blue-50 text-blue-600 border-blue-200",
    java: "bg-red-100 text-red-800 border-red-200",
    html: "bg-orange-100 text-orange-800 border-orange-200",
    css: "bg-blue-100 text-blue-600 border-blue-200",
    dart: "bg-cyan-100 text-cyan-800 border-cyan-200",
    flutter: "bg-cyan-50 text-cyan-600 border-cyan-200",
    swift: "bg-orange-100 text-orange-700 border-orange-200",
    kotlin: "bg-purple-100 text-purple-800 border-purple-200",
    go: "bg-cyan-100 text-cyan-800 border-cyan-200",
    php: "bg-indigo-100 text-indigo-800 border-indigo-200",
    c: "bg-gray-200 text-gray-800 border-gray-300",
    "c++": "bg-blue-50 text-blue-800 border-blue-200",
    "c#": "bg-green-100 text-green-800 border-green-200",
    ruby: "bg-red-50 text-red-900 border-red-200",
    rust: "bg-orange-50 text-orange-900 border-orange-200",
    default: "bg-gray-100 text-gray-600 border-gray-200"
  };

  // Pick the style, or fallback to default
  const selectedStyle = styles[langKey] || styles["default"];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${selectedStyle}`}>
      {language || "Code"}
    </span>
  );
}