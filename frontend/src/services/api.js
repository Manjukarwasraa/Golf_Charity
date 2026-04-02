const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && payload.msg
        ? payload.msg
        : "Something went wrong while talking to the server.";

    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export const signup = (data) =>
  request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const login = (data) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getCurrentUser = (token) =>
  request("/auth/me", {
    token,
  });

export const getScores = (token) =>
  request("/scores", {
    token,
  });

export const addScore = (score, token) =>
  request("/scores/add", {
    method: "POST",
    token,
    body: JSON.stringify({ score }),
  });

export const getCharities = () => request("/charity");

export const selectCharity = (charity, token) =>
  request("/charity/select", {
    method: "POST",
    token,
    body: JSON.stringify({ charity }),
  });

export const runDraw = (token) =>
  request("/draw/run", {
    token,
  });
