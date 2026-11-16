export const buildContactLink = (
  type: string | null,
  value: string | null
): { label: string; href: string | null } | null => {
  if (!value) return null;
  const handle = value.trim().replace(/^@/, "");
  switch (type) {
    case "instagram":
      return { label: `@${handle} on Instagram`, href: `https://instagram.com/${handle}` };
    case "telegram":
      return { label: `@${handle} on Telegram`, href: `https://t.me/${handle}` };
    case "email":
      return { label: value.trim(), href: `mailto:${value.trim()}` };
    case "discord":
      return { label: `${value.trim()} on Discord`, href: null };
    default:
      return { label: value.trim(), href: null };
  }
};
