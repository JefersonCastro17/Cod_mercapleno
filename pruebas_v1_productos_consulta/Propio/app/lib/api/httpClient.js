import { API_URL, INTERNAL_API_KEY } from "../config/env";
import { decryptToken } from "../encryption";

function normalizePath(path = "") {
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
}

function extractErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload || fallback;

  return (
    payload.message ||
    payload.error ||
    payload.details ||
    fallback
  );
}

function getDecodedToken() {
  try {
    const encryptedToken = localStorage.getItem("token");
    if (!encryptedToken) return null;
    return decryptToken(encryptedToken);
  } catch (error) {
    console.error("Error al descifrar token:", error);
    localStorage.removeItem("token");
    return null;
  }
}

export function buildApiUrl(path = "") {
  return `${API_URL}${normalizePath(path)}`;
}

function requiresInternalApiKey(path = "") {
  const normalizedPath = normalizePath(path);

  return (
    normalizedPath.startsWith("/api/admin/users") ||
    normalizedPath.startsWith("/api/sales/reports")
  );
}

export async function httpRequest(path, options = {}) {
  const {
    method = "GET",
    data,
    headers = {},
    auth = false,
    token,
    responseType = "json"
  } = options;

  const normalizedMethod = method.toUpperCase();
  const normalizedPath = normalizePath(path);
  const allowBody = normalizedMethod !== "GET" && normalizedMethod !== "HEAD";
  const requestHeaders = { ...headers };
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const hasPayload = allowBody && data !== undefined && data !== null;

  if (auth) {
    const authToken = token || getDecodedToken();
    if (authToken) {
      requestHeaders.Authorization = `Bearer ${authToken}`;
    }
  }

  if (requiresInternalApiKey(normalizedPath) && INTERNAL_API_KEY) {
    requestHeaders["x-api-key"] = INTERNAL_API_KEY;
  }

  if (hasPayload && !isFormData && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(buildApiUrl(normalizedPath), {
    method: normalizedMethod,
    headers: requestHeaders,
    body: hasPayload ? (isFormData ? data : JSON.stringify(data)) : undefined
  });

  if (responseType === "blob") {
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return response.blob();
  }

  const contentType = response.headers.get("content-type") || "";
  const text = response.status === 204 ? "" : await response.text();

  let payload = null;
  if (text) {
    if (contentType.includes("application/json")) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = null;
      }
    } else {
      payload = text;
    }
  }

  if (!response.ok) {
    const error = new Error(extractErrorMessage(payload, `HTTP ${response.status}`));
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload;
}
