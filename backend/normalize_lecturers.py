import psycopg2
import os
from dotenv import load_dotenv

# Load DATABASE_URL from .env
load_dotenv(dotenv_path='backend/.env')
DATABASE_URL = os.getenv('DATABASE_URL')

def normalize_lecturers():
    if not DATABASE_URL:
        print("Error: DATABASE_URL not found in .env")
        return

    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    # 1. Create new tables
    print("Creating lecturers and course_lecturers tables...")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS lecturers (
            id SERIAL PRIMARY KEY,
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
        
        for name in names:
            if name not in lecturer_map:
                # Postgres INSERT ... ON CONFLICT RETURNING id
                cursor.execute("INSERT INTO lecturers (name) VALUES (%s) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id", (name,))
                lecturer_id = cursor.fetchone()[0]
                lecturer_map[name] = lecturer_id
            else:
                lecturer_id = lecturer_map[name]

            # Link to course
            cursor.execute("INSERT INTO course_lecturers (course_id, lecturer_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (course_id, lecturer_id))

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
