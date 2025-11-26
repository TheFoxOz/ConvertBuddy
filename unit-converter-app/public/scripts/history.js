export function saveHistory(entry) {
  const history = JSON.parse(localStorage.getItem("history") || "[]");
  history.unshift(entry); // add newest first
  localStorage.setItem("history", JSON.stringify(history));
}

export function getHistory() {
  return JSON.parse(localStorage.getItem("history") || "[]");
}

export function clearHistory() {
  localStorage.removeItem("history");
}
