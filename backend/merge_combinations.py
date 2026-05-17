import sqlite3
import re

def merge_combinations():
    conn = sqlite3.connect('backend/huji_data.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM combinations")
    rows = cursor.fetchall()
    
    def normalize(name):
        # Remove common Hebrew prefixes/suffixes for matching
        clean_name = name.replace('דו-חוגי', '').replace('חד-חוגי', '').replace(',', '').strip()
        # Split by 'בשילוב' or 'ו' in specific contexts
        parts = re.split(r'בשילוב| ו(?=מדעי|כלכלה|מנהל|חשבונאות|משפטים|פסיכולוגיה|חינוך|סוציולוגיה|כימיה|פיסיקה|סטטיסטיקה|מתמטיקה|בלשנות)', clean_name)
        parts = [p.strip() for p in parts if p.strip()]
        return tuple(sorted(parts))

    norm_groups = {}
    for cid, name in rows:
        norm = normalize(name)
        if len(norm) > 1:
            if norm not in norm_groups:
                norm_groups[norm] = []
            norm_groups[norm].append((cid, name))
            
    print(f"Found {len(norm_groups)} dual-major groups.")
    
    merged_count = 0
    for norm, matches in norm_groups.items():
        if len(matches) > 1:
            # We take the first one as the primary combination
            primary_id, primary_name = matches[0]
            others = matches[1:]
            
            print(f"Merging into [{primary_id}] {primary_name}:")
            for other_id, other_name in others:
                print(f"  <- Moving courses from [{other_id}] {other_name}")
                
                # Move courses from the other combination to the primary
                # We use INSERT OR IGNORE to avoid duplicate entries for the same course in the same combination
                cursor.execute("""
                    INSERT OR IGNORE INTO combination_courses (combination_id, course_id, category_type, year)
                    SELECT ?, course_id, category_type, year 
                    FROM combination_courses 
                    WHERE combination_id = ?
                """, (primary_id, other_id))
                
                # Delete the redundant combination_courses entries
                cursor.execute("DELETE FROM combination_courses WHERE combination_id = ?", (other_id,))
                
                # Delete the redundant combination entry
                cursor.execute("DELETE FROM combinations WHERE id = ?", (other_id,))
                
                merged_count += 1
            
            # Optional: Rename the primary combination to reflect both majors clearly if needed
            # But usually the existing names are fine.
            print("-" * 10)

    conn.commit()
    conn.close()
    print(f"Successfully merged {merged_count} redundant combinations.")

if __name__ == '__main__':
    merge_combinations()
