// Shared client-side validators. Mirrors the backend's checks so the user gets
// instant feedback before a round-trip (backend remains the source of truth).

// Reasonable email shape: local@domain.tld, no consecutive dots in the domain,
// no leading/trailing hyphen on the domain. Matches the spirit of the server regex.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (email) => {
  const value = (email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(value)) return false;
  const domain = value.split("@")[1] || "";
  if (domain.includes("..") || domain.startsWith("-") || domain.endsWith("-")) return false;
  return true;
};

// Password rules. The backend only enforces length >= 8, but we surface the
// rest as encouragement toward a strong password.
export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper",  label: "One uppercase letter",  test: (p) => /[A-Z]/.test(p) },
  { id: "lower",  label: "One lowercase letter",  test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "One number",            test: (p) => /\d/.test(p) },
  { id: "symbol", label: "One symbol (!@#$…)",     test: (p) => /[^A-Za-z0-9]/.test(p) },
];

// Returns { passed: [ids], score: 0..5, meetsMinimum: bool }
export const evaluatePassword = (password) => {
  const pw = password || "";
  const passed = PASSWORD_RULES.filter((r) => r.test(pw)).map((r) => r.id);
  return {
    passed,
    score: passed.length,
    meetsMinimum: pw.length >= 8, // backend requirement
  };
};

export const STRENGTH_LABELS = ["Too short", "Weak", "Fair", "Good", "Strong", "Excellent"];
export const STRENGTH_COLORS = ["#dc2626", "#dc2626", "#c0552a", "#d97706", "#0e9384", "#0e9384"];
