// src/modules/Scanner/Scanner.tsx
import React, { useState, useRef } from "react";
import "./Scanner.css";

interface Diagnostic {
  diagnostic?: {
    disease: string;
    probability: number;
    probabilities?: Record<string, number>;
  };
  patient?: {
    full_name: string;
    age?: number;
  };
  error?: string;
}

interface HistoryItem {
  fileName: string;
  result: string;
}

const Scanner: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [patientName, setPatientName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");

  const videoRef = useRef<HTMLVideoElement>(null);

  // ─── Gestion du fichier ───
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setDiagnostic(null);
      const reader = new FileReader();
      reader.onload = (event) => setPreview(event.target?.result as string);
      reader.readAsDataURL(f);
    }
  };

  // ─── Caméra ───
  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia)
      return alert("Caméra non supportée");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      alert("Erreur accès caméra");
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    setPreview(dataUrl);
    setFile(dataURLtoFile(dataUrl, "camera_capture.png"));
  };

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  // ─── Analyse IA ───
  const analyzeAI = async () => {
    if (!file) return alert("Aucun fichier sélectionné");
    if (!patientName || !dateOfBirth)
      return alert("Nom et date de naissance du patient requis");

    setLoading(true);
    setDiagnostic(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("patientName", patientName);
      formData.append("date_of_birth", dateOfBirth);
      formData.append("sex", sex);

      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Utilisateur non authentifié. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/image/ai-diagnosis/",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur serveur");

      setDiagnostic({
        diagnostic: {
          disease: data.result,
          probability: data.probability,
          probabilities: data.probabilities,
        },
        patient: { full_name: patientName },
      });

      setHistory([{ fileName: file.name, result: data.result }, ...history]);
    } catch (err: any) {
      console.error("Erreur analyse IA:", err);
      setDiagnostic({ error: "❌ Échec analyse IA" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Badge couleur selon probabilité ───
  const getProbabilityBadge = (prob: number) => {
    if (prob < 50) return "prob-low";
    if (prob < 75) return "prob-medium";
    return "prob-high";
  };

  return (
    <div className="scanner">
      <h2>Scanner Professionnel (Image / Caméra)</h2>

      <div className="scanner-inputs">
        <input
          type="text"
          placeholder="Nom du patient"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
        />
        <input
          type="date"
          placeholder="Date de naissance"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />
        <select value={sex} onChange={(e) => setSex(e.target.value as "male" | "female")}>
          <option value="male">Homme</option>
          <option value="female">Femme</option>
        </select>
      </div>

      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={startCamera}>📷 Activer Caméra</button>

      <video ref={videoRef} autoPlay className="scanner-video"></video>
      <button onClick={captureFrame}>📸 Capturer Image</button>

      {preview && (
        <div className="scanner-preview">
          <img src={preview} alt="Preview" />
        </div>
      )}

      <div className="scanner-actions">
        <button onClick={analyzeAI} disabled={loading || !file}>
          {loading ? "Analyse en cours..." : "Analyser avec IA"}
        </button>
      </div>

      {diagnostic && (
        <div className="scanner-result">
          {diagnostic.error ? (
            <span className="scanner-error">{diagnostic.error}</span>
          ) : (
            <>
              <p>
                🤖 Résultat IA : <strong>{diagnostic.diagnostic?.disease}</strong>{" "}
                <span className={`badge-prob ${getProbabilityBadge(diagnostic.diagnostic?.probability || 0)}`}>
                  {diagnostic.diagnostic?.probability.toFixed(2)}%
                </span>
              </p>

              {diagnostic.diagnostic?.probabilities && (
                <div className="prob-bars">
                  {Object.entries(diagnostic.diagnostic.probabilities).map(([cls, prob]) => (
                    <div className="prob-bar" key={cls}>
                      <span className="label">{cls}</span>
                      <div className="bar">
                        <div className="bar-fill" style={{ width: `${prob * 100}%` }}></div>
                      </div>
                      <span>{(prob * 100).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              )}

              <p>Patient : {diagnostic.patient?.full_name}</p>
            </>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="scanner-history">
          <h3>Historique Scans :</h3>
          <ul>
            {history.map((h, i) => (
              <li key={i}>
                <strong>{h.fileName}</strong> : {h.result}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Scanner;
