import axios from 'axios';

// src/services/api.ts
const API_BASE = "http://127.0.0.1:8000/api";

// ---------------- Token Storage ----------------
const getToken = () => localStorage.getItem("access_token");
const getRefreshToken = () => localStorage.getItem("refresh_token");

const setToken = (access: string, refresh?: string) => {
  localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
};

const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
};

// ---------------- Auth ----------------
export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Login échoué");
  }

  const data = await response.json();
  if (!data.access || !data.refresh) throw new Error("Réponse du serveur invalide : tokens manquants");

  setToken(data.access, data.refresh);
  return data;
};

export const refreshToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("Pas de refresh token disponible");

  const response = await fetch(`${API_BASE}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    clearTokens();
    throw new Error("Refresh token invalide");
  }

  const data = await response.json();
  setToken(data.access);
  return data.access;
};

// ---------------- Fetch with Auth ----------------
export const fetchWithAuth = async <T = any>(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<T> => {
  let token = getToken();
  if (!token) throw new Error("Pas de token disponible, connectez-vous d'abord");

  // Utiliser Headers pour éviter les problèmes TS
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);

  // ❌ Ne pas définir Content-Type si c'est FormData
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let response = await fetch(url, { ...options, headers });

  // 🔄 Rafraîchissement token si 401
  if (response.status === 401 && retry) {
    try {
      const newAccess = await refreshToken();
      headers.set('Authorization', `Bearer ${newAccess}`);
      response = await fetch(url, { ...options, headers });
    } catch {
      clearTokens();
      throw new Error("Token invalide et refresh échoué");
    }
  }

  // ✅ Gestion des erreurs
  if (!response.ok) {
    let errText: string = '';
    try {
      const errData = await response.json();
      errText = errData.detail || JSON.stringify(errData);
    } catch {
      errText = await response.text(); // cas HTML ou autre
    }
    throw new Error(`Erreur API (${response.status}): ${errText}`);
  }

  // 🔹 Retourne JSON si possible, sinon texte
  try {
    return await response.json();
  } catch {
    const text = await response.text();
    console.warn('Réponse non JSON reçue:', text);
    return text as unknown as T;
  }
};

// ---------------- Diagnostics & Patients ----------------
export interface DiagnosticPayload {
  patientId: number;
  patientName: string;
  age: number;
  sex: 'male' | 'female';
  symptomes: string[];
}

export const postDiagnostic = async (payload: DiagnosticPayload, token: string) => {
  if (!token) throw new Error("Pas de token disponible, connectez-vous d'abord");

  return fetch(`${API_BASE}/symptoms/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      patient_id: payload.patientId,
      patient_name: payload.patientName,
      age: payload.age,          // 🔹 âge envoyé
      sex: payload.sex,          // 🔹 sexe envoyé
      symptoms: payload.symptomes,
    }),
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Erreur API (${res.status}): ${err}`);
    }
    return res.json();
  });
};

export const getDiagnostics = async (token: string) => {
  const response = await fetch(`${API_BASE}/diagnostics/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const getPatientHistoryById = async (patientId: number, token: string) => {
  const res = await axios.get(`${API_BASE}/patients/${patientId}/history/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};


export const exportPatients = async () => {
  return fetchWithAuth(`${API_BASE}/patients/export/`);
};

export const createPatient = async (full_name: string, date_of_birth: string, sex?: 'male' | 'female') => {
  return fetchWithAuth(`${API_BASE}/patients/`, {
    method: "POST",
    body: JSON.stringify({ full_name, date_of_birth, sex }),
  });
};
