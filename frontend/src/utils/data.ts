import axios from 'axios';
import { Diagnostic, DiagnosticStats, Symptome } from '@/types';

const API_BASE_URL = 'http://localhost:8000/api';

// Liste statique de symptômes (à remplacer par un appel API si nécessaire)
export const symptomes: Symptome[] = [
  { en: 'itching', fr: 'Démangeaisons', severity: 3 / 8 },
  { en: 'skin_rash', fr: 'Éruption cutanée', severity: 4 / 8 },
  { en: 'nodal_skin_eruptions', fr: 'Éruptions cutanées nodulaires', severity: 5 / 8 },
  { en: 'continuous_sneezing', fr: 'Éternuements continus', severity: 2 / 8 },
  { en: 'shivering', fr: 'Frissons', severity: 3 / 8 },
  { en: 'chills', fr: 'Frissons', severity: 3 / 8 },
  { en: 'joint_pain', fr: 'Douleurs articulaires', severity: 5 / 8 },
  { en: 'stomach_pain', fr: 'Douleurs abdominales', severity: 5 / 8 },
  { en: 'acidity', fr: 'Acidité', severity: 3 / 8 },
  { en: 'ulcers_on_tongue', fr: 'Ulcères sur la langue', severity: 4 / 8 },
  { en: 'muscle_wasting', fr: 'Fonte musculaire', severity: 6 / 8 },
  { en: 'vomiting', fr: 'Vomissements', severity: 5 / 8 },
  { en: 'burning_micturition', fr: 'Brûlure à la miction', severity: 4 / 8 },
  { en: 'spotting_urination', fr: 'Urines tachetées', severity: 4 / 8 },
  { en: 'fatigue', fr: 'Fatigue', severity: 4 / 8 },
  { en: 'weight_gain', fr: 'Prise de poids', severity: 3 / 8 },
  { en: 'anxiety', fr: 'Anxiété', severity: 4 / 8 },
  { en: 'cold_hands_and_feets', fr: 'Mains et pieds froids', severity: 3 / 8 },
  { en: 'mood_swings', fr: 'Sautes d’humeur', severity: 4 / 8 },
  { en: 'weight_loss', fr: 'Perte de poids', severity: 5 / 8 },
  { en: 'restlessness', fr: 'Agitation', severity: 4 / 8 },
  { en: 'lethargy', fr: 'Léthargie', severity: 4 / 8 },
  { en: 'patches_in_throat', fr: 'Plaques dans la gorge', severity: 4 / 8 },
  { en: 'irregular_sugar_level', fr: 'Niveau de sucre irrégulier', severity: 5 / 8 },
  { en: 'cough', fr: 'Toux', severity: 3 / 8 },
  { en: 'high_fever', fr: 'Fièvre élevée', severity: 6 / 8 },
  { en: 'sunken_eyes', fr: 'Yeux enfoncés', severity: 5 / 8 },
  { en: 'breathlessness', fr: 'Essoufflement', severity: 6 / 8 },
  { en: 'sweating', fr: 'Transpiration', severity: 3 / 8 },
  { en: 'dehydration', fr: 'Déshydratation', severity: 6 / 8 },
  { en: 'indigestion', fr: 'Indigestion', severity: 3 / 8 },
  { en: 'headache', fr: 'Maux de tête', severity: 4 / 8 },
  { en: 'yellowish_skin', fr: 'Peau jaunâtre', severity: 6 / 8 },
  { en: 'dark_urine', fr: 'Urine foncée', severity: 5 / 8 },
  { en: 'nausea', fr: 'Nausées', severity: 4 / 8 },
  { en: 'loss_of_appetite', fr: 'Perte d’appétit', severity: 5 / 8 },
  { en: 'pain_behind_the_eyes', fr: 'Douleur derrière les yeux', severity: 5 / 8 },
  { en: 'back_pain', fr: 'Douleurs dorsales', severity: 5 / 8 },
  { en: 'constipation', fr: 'Constipation', severity: 3 / 8 },
  { en: 'abdominal_pain', fr: 'Douleurs abdominales', severity: 5 / 8 },
  { en: 'diarrhoea', fr: 'Diarrhée', severity: 5 / 8 },
  { en: 'mild_fever', fr: 'Fièvre légère', severity: 4 / 8 },
  { en: 'yellow_urine', fr: 'Urine jaune', severity: 4 / 8 },
  { en: 'yellowing_of_eyes', fr: 'Jaunissement des yeux', severity: 6 / 8 },
  { en: 'acute_liver_failure', fr: 'Insuffisance hépatique aiguë', severity: 8 / 8 },
  { en: 'fluid_overload', fr: 'Surcharge liquidienne', severity: 6 / 8 },
  { en: 'swelling_of_stomach', fr: 'Gonflement de l’estomac', severity: 6 / 8 },
  { en: 'swelled_lymph_nodes', fr: 'Ganglions lymphatiques enflés', severity: 5 / 8 },
  { en: 'malaise', fr: 'Malaise', severity: 4 / 8 },
  { en: 'blurred_and_distorted_vision', fr: 'Vision floue et déformée', severity: 6 / 8 },
  { en: 'phlegm', fr: 'Mucosités', severity: 4 / 8 },
  { en: 'throat_irritation', fr: 'Irritation de la gorge', severity: 3 / 8 },
  { en: 'redness_of_eyes', fr: 'Rougeur des yeux', severity: 4 / 8 },
  { en: 'sinus_pressure', fr: 'Pression sinusale', severity: 4 / 8 },
  { en: 'runny_nose', fr: 'Nez qui coule', severity: 3 / 8 },
  { en: 'congestion', fr: 'Congestion', severity: 4 / 8 },
  { en: 'chest_pain', fr: 'Douleur thoracique', severity: 7 / 8 },
  { en: 'weakness_in_limbs', fr: 'Faiblesse des membres', severity: 6 / 8 },
  { en: 'fast_heart_rate', fr: 'Fréquence cardiaque rapide', severity: 6 / 8 },
  { en: 'pain_during_bowel_movements', fr: 'Douleur pendant les selles', severity: 5 / 8 },
  { en: 'pain_in_anal_region', fr: 'Douleur dans la région anale', severity: 5 / 8 },
  { en: 'bloody_stool', fr: 'Selles sanguinolentes', severity: 6 / 8 },
  { en: 'irritation_in_anus', fr: 'Irritation anale', severity: 4 / 8 },
  { en: 'neck_pain', fr: 'Douleurs cervicales', severity: 5 / 8 },
  { en: 'dizziness', fr: 'Vertiges', severity: 5 / 8 },
  { en: 'cramps', fr: 'Crampes', severity: 4 / 8 },
  { en: 'bruising', fr: 'Ecchymoses', severity: 4 / 8 },
  { en: 'obesity', fr: 'Obésité', severity: 5 / 8 },
  { en: 'swollen_legs', fr: 'Jambes enflées', severity: 5 / 8 },
  { en: 'swollen_blood_vessels', fr: 'Vaisseaux sanguins enflés', severity: 5 / 8 },
  { en: 'puffy_face_and_eyes', fr: 'Visage et yeux bouffis', severity: 5 / 8 },
  { en: 'enlarged_thyroid', fr: 'Thyroïde élargie', severity: 6 / 8 },
  { en: 'brittle_nails', fr: 'Ongles cassants', severity: 4 / 8 },
  { en: 'swollen_extremeties', fr: 'Extrémités enflées', severity: 5 / 8 },
  { en: 'excessive_hunger', fr: 'Faim excessive', severity: 4 / 8 },
  { en: 'extra_marital_contacts', fr: 'Contacts extraconjugaux', severity: 3 / 8 },
  { en: 'drying_and_tingling_lips', fr: 'Lèvres sèches et picotements', severity: 3 / 8 },
  { en: 'slurred_speech', fr: 'Élocution brouillée', severity: 6 / 8 },
  { en: 'knee_pain', fr: 'Douleurs aux genoux', severity: 5 / 8 },
  { en: 'hip_joint_pain', fr: 'Douleurs aux hanches', severity: 5 / 8 },
  { en: 'muscle_weakness', fr: 'Faiblesse musculaire', severity: 6 / 8 },
  { en: 'stiff_neck', fr: 'Cou raide', severity: 5 / 8 },
  { en: 'swelling_joints', fr: 'Articulations enflées', severity: 5 / 8 },
  { en: 'movement_stiffness', fr: 'Raideur des mouvements', severity: 5 / 8 },
  { en: 'spinning_movements', fr: 'Mouvements giratoires', severity: 6 / 8 },
  { en: 'loss_of_balance', fr: 'Perte d’équilibre', severity: 6 / 8 },
  { en: 'unsteadiness', fr: 'Instabilité', severity: 5 / 8 },
  { en: 'weakness_of_one_body_side', fr: 'Faiblesse d’un côté du corps', severity: 7 / 8 },
  { en: 'loss_of_smell', fr: 'Perte d’odorat', severity: 5 / 8 },
  { en: 'bladder_discomfort', fr: 'Inconfort vésical', severity: 4 / 8 },
  { en: 'foul_smell_of urine', fr: 'Odeur nauséabonde de l’urine', severity: 4 / 8 },
  { en: 'continuous_feel_of_urine', fr: 'Sensation continue d’uriner', severity: 4 / 8 },
  { en: 'passage_of_gases', fr: 'Passage de gaz', severity: 3 / 8 },
  { en: 'internal_itching', fr: 'Démangeaisons internes', severity: 4 / 8 },
  { en: 'toxic_look_(typhos)', fr: 'Aspect toxique (typhus)', severity: 6 / 8 },
  { en: 'depression', fr: 'Dépression', severity: 5 / 8 },
  { en: 'irritability', fr: 'Irritabilité', severity: 4 / 8 },
  { en: 'muscle_pain', fr: 'Douleurs musculaires', severity: 5 / 8 },
  { en: 'altered_sensorium', fr: 'Sensorium altéré', severity: 7 / 8 },
  { en: 'red_spots_over_body', fr: 'Taches rouges sur le corps', severity: 5 / 8 },
  { en: 'belly_pain', fr: 'Douleurs abdominales', severity: 5 / 8 },
    { en: 'abnormal_menstruation', fr: 'Menstruations anormales', severity: 5 / 8 },
  { en: 'dischromic_patches', fr: 'Taches décolorées', severity: 4 / 8 },
  { en: 'watering_from_eyes', fr: 'Larmoiements', severity: 3 / 8 },
  { en: 'increased_appetite', fr: 'Appétit accru', severity: 4 / 8 },
  { en: 'polyuria', fr: 'Polyurie', severity: 5 / 8 },
  { en: 'family_history', fr: 'Antécédents familiaux', severity: 3 / 8 },
  { en: 'mucoid_sputum', fr: 'Expectoration muqueuse', severity: 4 / 8 },
  { en: 'rusty_sputum', fr: 'Expectoration rouillée', severity: 5 / 8 },
  { en: 'lack_of_concentration', fr: 'Manque de concentration', severity: 4 / 8 },
  { en: 'visual_disturbances', fr: 'Troubles visuels', severity: 6 / 8 },
  { en: 'receiving_blood_transfusion', fr: 'Transfusion sanguine', severity: 5 / 8 },
  { en: 'receiving_unsterile_injections', fr: 'Injections non stériles', severity: 5 / 8 },
  { en: 'coma', fr: 'Coma', severity: 8 / 8 },
  { en: 'stomach_bleeding', fr: 'Saignement gastrique', severity: 7 / 8 },
  { en: 'distention_of_abdomen', fr: 'Distension abdominale', severity: 6 / 8 },
  { en: 'history_of_alcohol_consumption', fr: 'Antécédents de consommation d’alcool', severity: 4 / 8 },
  { en: 'fluid_overload.1', fr: 'Surcharge liquidienne', severity: 6 / 8 },
  { en: 'blood_in_sputum', fr: 'Sang dans les expectorations', severity: 6 / 8 },
  { en: 'prominent_veins_on_calf', fr: 'Veines proéminentes sur le mollet', severity: 5 / 8 },
  { en: 'palpitations', fr: 'Palpitations', severity: 5 / 8 },
  { en: 'painful_walking', fr: 'Marche douloureuse', severity: 5 / 8 },
  { en: 'pus_filled_pimples', fr: 'Boutons remplis de pus', severity: 4 / 8 },
  { en: 'blackheads', fr: 'Points noirs', severity: 3 / 8 },
  { en: 'scurring', fr: 'Croûtes', severity: 4 / 8 },
  { en: 'skin_peeling', fr: 'Peau qui pèle', severity: 4 / 8 },
  { en: 'silver_like_dusting', fr: 'Poussière argentée', severity: 4 / 8 },
  { en: 'small_dents_in_nails', fr: 'Petites bosses dans les ongles', severity: 4 / 8 },
  { en: 'inflammatory_nails', fr: 'Ongles inflammatoires', severity: 4 / 8 },
  { en: 'blister', fr: 'Cloques', severity: 4 / 8 },
  { en: 'red_sore_around_nose', fr: 'Plaies rouges autour du nez', severity: 4 / 8 },
  { en: 'yellow_crust_ooze', fr: 'Croûtes jaunes suintantes', severity: 4 / 8 }
];

// ✅ Ajouter un symptôme
export const addSymptome = async (symptome: Symptome, token: string): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/symptoms/add/`, symptome, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du symptôme:", error);
    throw error;
  }
};
// ✅ Supprimer un symptôme
export const removeSymptome = async (symptomeEn: string, token: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/symptoms/remove/${symptomeEn}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du symptôme:", error);
    throw error;
  }
};

// ✅ Récupération des statistiques (corrigé)
export const getDiagnosticStats = async (token: string): Promise<DiagnosticStats[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/diagnostics/stats/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Assurer cohérence des champs (certains backends peuvent renvoyer null)
    return response.data.map((stat: any) => ({
      disease: stat.disease || 'Inconnu',
      sex: stat.sex || '',
      age: stat.age ?? null,
      count: stat.count ?? 0,
      averageSeverity: stat.averageSeverity ?? undefined,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return [];
  }
};
// ✅ Récupération de tous les diagnostics
export const getDiagnostics = async (token: string): Promise<Diagnostic[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/diagnostics/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.map((d: any) => ({
      id: d.id,
      patientId: d.patient?.id,
      patientName: d.patient?.full_name || 'Inconnu',
      age: d.patient?.date_of_birth ? calculateAge(d.patient.date_of_birth) : 0,
      symptomes: d.symptoms?.join(', ') || '',
      diagnostic: d.disease || 'Non défini',
      date: d.date,
      severityScore: (d.probability || 0) * 100,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des diagnostics:', error);
    return [];
  }
};

// ✅ Sauvegarde d’un diagnostic
export const saveDiagnostic = async (diagnostic: Diagnostic, token: string): Promise<void> => {
  try {
    await axios.post(
      `${API_BASE_URL}/symptoms/`,
      {
        patient_id: diagnostic.patientId,
        symptoms: diagnostic.symptomes,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du diagnostic:", error);
    throw error;
  }
};

// ✅ Historique d’un patient
export const getPatientHistory = async (patientName: string, token: string): Promise<Diagnostic[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/patients/history/?full_name=${patientName}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.map((d: any) => ({
      id: d.id,
      patientId: d.patient?.id,
      patientName: patientName,
      age: d.patient?.date_of_birth ? calculateAge(d.patient.date_of_birth) : 0,
      symptomes: d.symptoms?.join(', ') || '',
      diagnostic: d.disease || 'Non défini',
      date: d.date,
      severityScore: (d.probability || 0) * 100,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    return [];
  }
};

// ✅ Recherche par symptôme
export const searchBySymptome = async (symptome: string, token: string): Promise<Diagnostic[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/patients/search/?symptome=${symptome}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.map((d: any) => ({
      id: d.id,
      patientId: d.patient?.id,
      patientName: d.patient?.full_name || 'Inconnu',
      age: d.patient?.date_of_birth ? calculateAge(d.patient.date_of_birth) : 0,
      symptomes: d.symptoms?.join(', ') || '',
      diagnostic: d.disease || 'Non défini',
      date: d.date,
      severityScore: (d.probability || 0) * 100,
    }));
  } catch (error) {
    console.error('Erreur lors de la recherche par symptôme:', error);
    return [];
  }
};

// ✅ Recherche par date
export const searchByDate = async (date: string, token: string): Promise<Diagnostic[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/patients/search/?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.map((d: any) => ({
      id: d.id,
      patientId: d.patient?.id,
      patientName: d.patient?.full_name || 'Inconnu',
      age: d.patient?.date_of_birth ? calculateAge(d.patient.date_of_birth) : 0,
      symptomes: d.symptoms?.join(', ') || '',
      diagnostic: d.disease || 'Non défini',
      date: d.date,
      severityScore: (d.probability || 0) * 100,
    }));
  } catch (error) {
    console.error('Erreur lors de la recherche par date:', error);
    return [];
  }
};

// ✅ Calcul automatique de l’âge à partir de la date de naissance
const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};
