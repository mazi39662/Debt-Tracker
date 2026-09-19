const THEME_KEY = "debt_tracker_theme";

export type AppTheme = "light" | "dark";

// ! Get the saved theme.
export function getSavedTheme(): AppTheme {
  const savedTheme = localStorage.getItem(THEME_KEY);

  return savedTheme === "dark" ? "dark" : "light";
}

// ! Apply the selected theme to the document.
export function applyTheme(theme: AppTheme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");

  localStorage.setItem(THEME_KEY, theme);
}

// ! Load the saved theme when the app starts.
export function initializeTheme(): void {
  applyTheme(getSavedTheme());
}
