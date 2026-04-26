import requests
from bs4 import BeautifulSoup

def get_shnaton_codes():
    url = "https://shnaton.huji.ac.il/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    response = requests.get(url, headers=headers)
    response.encoding = 'utf-8'
    soup = BeautifulSoup(response.text, 'html.parser')
    
    faculties = {}
    fac_select = soup.find('select', {'id': 'faculty'})
    if fac_select:
        for option in fac_select.find_all('option'):
            faculties[option['value']] = option.text.strip()
            
    # Note: Departments (chug) are usually loaded dynamically via JS when a faculty is selected.
    # But some might be in the initial HTML or we can find the mapping.
    
    print("Faculties found:")
    for code, name in faculties.items():
        if "עסקים" in name or "Business" in name or code == "52":
            print(f"Code {code}: {name}")

if __name__ == "__main__":
    get_shnaton_codes()
