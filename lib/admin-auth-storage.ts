export const REMEMBER_ME_KEY = "glamd-admin-remember-me";
export const REMEMBER_EMAIL_KEY = "glamd-admin-remember-email";

export function loadRememberedLogin(): { rememberMe: boolean; email: string } {
  if (typeof window === "undefined") {
    return { rememberMe: true, email: "" };
  }
  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) !== "0";
  const email = rememberMe ? (localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "") : "";
  return { rememberMe, email };
}

export function saveRememberedLogin(rememberMe: boolean, email: string) {
  if (typeof window === "undefined") return;
  if (rememberMe) {
    localStorage.setItem(REMEMBER_ME_KEY, "1");
    localStorage.setItem(REMEMBER_EMAIL_KEY, email);
  } else {
    localStorage.setItem(REMEMBER_ME_KEY, "0");
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
  }
}
