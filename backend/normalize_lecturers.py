import sqlite3

def normalize_lecturers():
    conn = sqlite3.connect('backend/huji_data.db')
    cursor = conn.cursor()

    # 1. Create new tables
    print("Creating lecturers and course_lecturers tables...")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS lecturers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS course_lecturers (
            course_id INTEGER,
            lecturer_id INTEGER,
            PRIMARY KEY (course_id, lecturer_id),
            FOREIGN KEY (course_id) REFERENCES courses (id),
            FOREIGN KEY (lecturer_id) REFERENCES lecturers (id)
        )
    ''')

    # 2. Extract existing lecturers from the courses table
    print("Extracting and normalizing lecturers...")
    cursor.execute("SELECT id, lecturers FROM courses WHERE lecturers IS NOT NULL AND lecturers != ''")
    rows = cursor.fetchall()

    lecturer_map = {} # name -> id

    for course_id, lecturer_str in rows:
        # Split by comma and clean up
        names = [n.strip() for n in lecturer_str.replace('\r', '').replace('\n', '').split(',') if n.strip()]
        
        # Some cleanup for titles like "פרופ", "ד"ר" etc if we want, 
        # but for now let's keep the names as provided in the string.
        
        for name in names:
            if name not in lecturer_map:
                cursor.execute("INSERT OR IGNORE INTO lecturers (name) VALUES (?)", (name,))
                cursor.execute("SELECT id FROM lecturers WHERE name = ?", (name,))
                lecturer_id = cursor.fetchone()[0]
                lecturer_map[name] = lecturer_id
            else:
                lecturer_id = lecturer_map[name]

            # Link to course
            cursor.execute("INSERT OR IGNORE INTO course_lecturers (course_id, lecturer_id) VALUES (?, ?)", (course_id, lecturer_id))

    conn.commit()
    
    # 3. Verify
    cursor.execute("SELECT COUNT(*) FROM lecturers")
    l_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM course_lecturers")
    cl_count = cursor.fetchone()[0]
    
    print(f"Normalization complete. Created {l_count} unique lecturers and {cl_count} mappings.")
    conn.close()

if __name__ == '__main__':
    normalize_lecturers()
