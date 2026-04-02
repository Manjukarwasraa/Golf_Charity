const isLocalDev =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const configuredApiUrl =
  process.env.REACT_APP_API_URL ||
  process.env.VITE_API_URL ||
  "";

const baseApiUrl = isLocalDev
  ? "http://localhost:5000"
  : configuredApiUrl || window.location.origin;

const API_BASE_URL = `${baseApiUrl.replace(/\/+$/, "")}/api`;

async function request(path, options = {}) {
  const {
    token,
    headers = {},
    method = "GET",
    ...restOptions
  } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null
        ? payload.msg || payload.message || payload.error
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

export const login = async ({ email, password }) => {
  try {
    return await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    const message =
      error.status === 405
        ? "Login endpoint rejected the request method. Check that the backend accepts POST on /api/auth/login."
        : error.message;

    const loginError = new Error(message);
    loginError.status = error.status;
    loginError.payload = error.payload;
    throw loginError;
  }
};

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
