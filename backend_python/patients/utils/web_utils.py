import os
import requests
from bs4 import BeautifulSoup
from serpapi import GoogleSearch
import re
import unicodedata
from time import sleep

# Récupération propre de la clé API
SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")

def normalize_text(text: str) -> str:
    """Nettoie le texte pour les recherches Google."""
    text = text.replace('_', ' ')
    text = re.sub(r'[^\w\s]', '', text)
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode()
    text = text.strip()
    return text

def build_query(symptoms, disease) -> str:
    """Construit une requête normalisée et traduite en français si nécessaire."""
    clean_symptoms = [normalize_text(s).capitalize() for s in symptoms]
    clean_disease = normalize_text(disease).capitalize()
    query = f"{' '.join(clean_symptoms)} {clean_disease}"

    # Traduction automatique en français
    try:
        tr_url = f"https://api.mymemory.translated.net/get?q={query}&langpair=en|fr"
        tr_response = requests.get(tr_url, timeout=5)
        if tr_response.status_code == 200:
            data = tr_response.json()
            translated = data.get("responseData", {}).get("translatedText")
            if translated:
                query = translated
    except Exception:
        pass

    return query

def search_web_serpapi(query: str, num_results=3):
    """Recherche via SerpAPI et retourne liste de tuples (title, url)."""
    results = []
    if not SERPAPI_API_KEY:
        print("⚠️ Clé SerpAPI non trouvée dans .env !")
        return results

    try:
        params = {
            "engine": "google",
            "q": query,
            "num": num_results,
            "api_key": SERPAPI_API_KEY,
            "hl": "fr",
            "gl": "fr",
            "lr": "lang_fr"
        }
        search = GoogleSearch(params)
        data = search.get_dict()
        organic = data.get("organic_results", [])

        for item in organic[:num_results]:
            title = item.get("title", "Sans titre")
            link = item.get("link", "")
            if title and link:
                results.append((t0000itle, link))

        if not results:
            print(f"⚠️ Aucun résultat SerpAPI pour : {query}")

    except Exception as e:
        print(f"Erreur SerpAPI: {e}")

    return results

def fetch_snippet(url: str, max_paragraphs=3, max_chars=300) -> str:
    """Extrait le texte d'une page web avec fallback si erreur ou blocage."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                          'AppleWebKit/537.36 (KHTML, like Gecko) '
                          'Chrome/141.0.0.0 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        # Chercher dans <p> ou <div> pour récupérer du contenu
        paragraphs = soup.find_all(['p', 'div'])
        snippet = ' '.join(p.get_text().strip() for p in paragraphs[:max_paragraphs])[:max_chars]

        if not snippet:
            return 'Aucun extrait disponible.'

        # Traduction automatique si nécessaire
        try:
            tr_url = f"https://api.mymemory.translated.net/get?q={snippet}&langpair=en|fr"
            tr_response = requests.get(tr_url, timeout=5)
            if tr_response.status_code == 200:
                data = tr_response.json()
                translated = data.get("responseData", {}).get("translatedText", "")
                if translated:
                    return translated
        except Exception:
            pass

        return snippet

    except requests.exceptions.RequestException as e:
        print(f"Erreur HTTP pour {url}: {e}")
        return 'Aucun extrait disponible.'
    except Exception as e:
        print(f"Erreur lors de la récupération de l'extrait: {e}")
        return 'Aucun extrait disponible.'
