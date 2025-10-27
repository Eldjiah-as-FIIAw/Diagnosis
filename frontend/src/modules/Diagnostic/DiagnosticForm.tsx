import React, { useState } from "react";
import { postDiagnostic, createPatient } from "@/services/api";
import { Symptome, Diagnostic, WebResult } from "@/types";
import { symptomes } from "@/utils/data";
import "./DiagnosticForm.css";

interface DiagnosticFormProps {
  token: string | null;
}

const DiagnosticForm: React.FC<DiagnosticFormProps> = ({ token }) => {
  const [patientName, setPatientName] = useState("");
  const [patientBirthDate, setPatientBirthDate] = useState("");
  const [patientSex, setPatientSex] = useState<"male" | "female">("male");
  const [symptomesInput, setSymptomesInput] = useState("");
  const [selectedSymptomes, setSelectedSymptomes] = useState<Symptome[]>([]);
  const [generatedDiagnostic, setGeneratedDiagnostic] = useState<
    Diagnostic | Diagnostic[] | string
  >("");
  const [webResults, setWebResults] = useState<WebResult[] | WebResult[][]>([]);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const filteredSymptomes = symptomes.filter(
    (s) =>
      s.fr.toLowerCase().includes(symptomesInput.toLowerCase()) ||
      s.en.toLowerCase().includes(symptomesInput.toLowerCase())
  );

  const toggleSymptome = (symptome: Symptome) => {
    if (selectedSymptomes.some((s) => s.en === symptome.en)) {
      setSelectedSymptomes(
        selectedSymptomes.filter((s) => s.en !== symptome.en)
      );
    } else {
      setSelectedSymptomes([...selectedSymptomes, symptome]);
    }
  };

  const calculateAge = (birthDateStr: string) => {
    const birth = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const generateDiagnostic = async () => {
    if (!selectedSymptomes.length || !patientName || !patientBirthDate) {
      alert(
        "Veuillez remplir le nom, la date de naissance et sélectionner au moins un symptôme."
      );
      return;
    }

    if (!token) {
      alert("Token manquant. Veuillez vous connecter.");
      return;
    }

    setIsLoading(true);
    setGeneratedDiagnostic("");
    setWebResults([]);

    try {
      const patient = await createPatient(patientName, patientBirthDate);
      setPatientId(Number(patient.id));
      const age = calculateAge(patientBirthDate);

      const response = await postDiagnostic(
        {
          patientId: Number(patient.id),
          patientName,
          age,
          sex: patientSex,
          symptomes: selectedSymptomes.map((s) => s.en),
        },
        token!
      );

      setGeneratedDiagnostic(response.diagnostic);
      setWebResults(response.web_results ?? []);
    } catch (err) {
      console.error("Erreur génération diagnostic :", err);
      setGeneratedDiagnostic("Erreur lors de la génération du diagnostic");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!generatedDiagnostic || !patientId) {
      alert("Veuillez générer le diagnostic avant de l’enregistrer.");
      return;
    }

    if (!token) {
      alert("Token manquant. Veuillez vous connecter.");
      return;
    }

    setIsSaving(true);

    try {
      const age = calculateAge(patientBirthDate);
      await postDiagnostic(
        {
          patientId,
          patientName,
          age,
          sex: patientSex,
          symptomes: selectedSymptomes.map((s) => s.en),
        },
        token!
      );

      alert("Diagnostic enregistré avec succès !");
      setPatientName("");
      setPatientBirthDate("");
      setPatientSex("male");
      setSymptomesInput("");
      setSelectedSymptomes([]);
      setGeneratedDiagnostic("");
      setWebResults([]);
      setPatientId(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l’enregistrement du diagnostic.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderWebResults = (results: WebResult[] | undefined) => {
    if (!results || !results.length) return null;
    return (
      <div className="web-results fade-in">
        <h5>Résultats Web :</h5>
        {results.map((res, idx) => (
          <div key={idx} className="web-result-item">
            <a href={res.url} target="_blank" rel="noopener noreferrer">
              {res.title}
            </a>
            <p>{res.snippet}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="diagnostic-form">
      <h3>Ajouter un Diagnostic</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom du patient</label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Nom complet"
            required
          />
        </div>

        <div className="form-group">
          <label>Date de naissance</label>
          <input
            type="date"
            value={patientBirthDate}
            onChange={(e) => setPatientBirthDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Sexe du patient</label>
          <select
            value={patientSex}
            onChange={(e) => setPatientSex(e.target.value as "male" | "female")}
            required
          >
            <option value="male">Homme</option>
            <option value="female">Femme</option>
          </select>
        </div>

        <div className="form-group">
          <label>Symptômes</label>
          <input
            type="text"
            value={symptomesInput}
            onChange={(e) => setSymptomesInput(e.target.value)}
            placeholder="Rechercher un symptôme"
          />
          {symptomesInput && filteredSymptomes.length > 0 && (
            <div className="suggestions">
              {filteredSymptomes.map((s) => (
                <div key={s.en} className="suggestion-item">
                  <input
                    type="checkbox"
                    checked={selectedSymptomes.some((sel) => sel.en === s.en)}
                    onChange={() => toggleSymptome(s)}
                  />
                  <span>
                    {s.fr} ({s.en})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedSymptomes.length > 0 && (
          <div className="selected-symptomes fade-in">
            <h4>Symptômes sélectionnés :</h4>
            {selectedSymptomes.map((s) => (
              <div key={s.en}>
                {s.fr} ({s.en})
              </div>
            ))}
          </div>
        )}

        <div className="containsave">
          <button
            type="button"
            className="generate-btn"
            onClick={generateDiagnostic}
            disabled={isLoading}
          >
            {isLoading ? <span className="loader"></span> : "GENERER"}
          </button>

          {generatedDiagnostic && !isLoading && (
            <div className="diagnostic-card fade-in">
              <h4>Diagnostic généré :</h4>
              <div className="diagnostic-json">
                {typeof generatedDiagnostic === "string" ? (
                  <p>{generatedDiagnostic}</p>
                ) : (
                  <pre>{JSON.stringify(generatedDiagnostic, null, 2)}</pre>
                )}
              </div>

              {/* Garde aussi les résultats web */}
              {renderWebResults(webResults as WebResult[])}
            </div>
          )}

          <button type="submit" className="save-btn" disabled={isSaving}>
            {isSaving ? <span className="loader"></span> : "ENREGISTRER"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DiagnosticForm;
