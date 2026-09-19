export type Theme = "dark" | "light";
export const THEME_STORAGE_KEY = "folio-theme";
const THEME_EVENT = "folio-theme-change";

export function resolveTheme(value: string | null): Theme {
  return value === "light" ? "light" : "dark";
}

export function getTheme(): Theme {
  return resolveTheme(document.documentElement.dataset.theme ?? null);
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    // Only this display preference is persisted. PDF data stays in memory.
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The toggle still works when browser storage is blocked or full.
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function subscribeTheme(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) {
      document.documentElement.dataset.theme = resolveTheme(event.newValue);
      onChange();
    }
  };
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

// Runs before the body paints: saved light preferences never flash dark.
// Interpolated values are constants, never user input.
export const themeInitScript = `try{document.documentElement.dataset.theme=localStorage.getItem("${THEME_STORAGE_KEY}")==="light"?"light":"dark"}catch{}`;
