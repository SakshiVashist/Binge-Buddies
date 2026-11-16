// if no active genre, no logs in watch log, use onboaring genres 
export function getActiveGenre(topGenre: string, onboardingGenresJson: string | null): string {
  if (topGenre && topGenre !== "None") return topGenre;

  if (onboardingGenresJson) {
    try {
      const parsed = JSON.parse(onboardingGenresJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
    } catch (e) {
      console.error("Failed to parse onboarding genres from sessionStorage", e); 
      return "None";
    }
  }
  return "None";
}