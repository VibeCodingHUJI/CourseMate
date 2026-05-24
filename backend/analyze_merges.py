import psycopg2
import os
import re
from dotenv import load_dotenv

# Load DATABASE_URL from .env
load_dotenv(dotenv_path='backend/.env')
DATABASE_URL = os.getenv('DATABASE_URL')

def analyze_combinations():
    if not DATABASE_URL:
        print("Error: DATABASE_URL not found in .env")
        return

    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM combinations")
    rows = cursor.fetchall()
    
    def normalize(name):
        # Remove common Hebrew prefixes/suffixes for matching
        name = name.replace('דו-חוגי', '').replace('חד-חוגי', '').replace(',', '').strip()
        # Split by 'בשילוב' or 'ו'
        parts = re.split(r'בשילוב| ו(?=מדעי|כלכלה|מנהל|חשבונאות|משפטים|פסיכולוגיה)', name)
        parts = [p.strip() for p in parts if p.strip()]
        return sorted(parts)

    norm_map = {}
    for cid, name in rows:
        norm = tuple(normalize(name))
        if len(norm) > 1:
            if norm not in norm_map:
                norm_map[norm] = []
            norm_map[norm].append((cid, name))
            
    print("Potential Merges Found:")
    for norm, matches in norm_map.items():
        if len(matches) > 1:
            print(f"Norm: {' + '.join(norm)}")
            for cid, name in matches:
                print(f"  [{cid}] {name}")
            print("-" * 10)

    conn.close()

if __name__ == '__main__':
    analyze_combinations()
