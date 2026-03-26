export const MainRoutes = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Services",
    href: "/services",
  },
];

export const ProtectedRoutes = [
  {
    label: "Interviews",
    href: "/generate",
    icon: "📝",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: "📊",
  },
  {
    label: "Collab",
    href: "/collab",
    icon: "🤝",
  },
  {
    label: "Company Q",
    href: "/company-questions",
    icon: "🏢",
  },
  {
    label: "Group",
    href: "/group-practice",
    icon: "👥",
  },
  {
    label: "Video",
    href: "/video-recording",
    icon: "🎥",
  },
  {
    label: "Proctor",
    href: "/proctored-mode",
    icon: "🛡️",
  },
  {
    label: "Coach",
    href: "/ai-coach",
    icon: "🤖",
  },
  {
    label: "Schedule",
    href: "/interview-scheduling",
    icon: "📅",
  },
  {
    label: "Resume",
    href: "/resume-analysis",
    icon: "📄",
  },
  {
    label: "Builder",
    href: "/resume-builder",
    icon: "✏️",
  },
  {
    label: "Study",
    href: "/study-plans",
    icon: "📚",
  },
  {
    label: "Community",
    href: "/community",
    icon: "🌐",
  },
];

export const cleanAiResponse = (responseText: string) => {
  // Step 1: Trim any surrounding whitespace
  let cleanText = responseText.trim();

  // Step 2: Remove any occurrences of "json" or code block symbols (``` or `)
  cleanText = cleanText.replace(/(json|```|`)/g, "");

  // Step 3: Extract a JSON array by capturing text between square brackets
  const jsonArrayMatch = cleanText.match(/\[.*\]/s);
  if (jsonArrayMatch) {
    cleanText = jsonArrayMatch[0];
  } else {
    throw new Error("No JSON array found in response");
  }

  // Step 4: Parse the clean JSON text into an array of objects
  try {
    return JSON.parse(cleanText);
  } catch (error) {
    throw new Error("Invalid JSON format: " + (error as Error)?.message);
  }
};
