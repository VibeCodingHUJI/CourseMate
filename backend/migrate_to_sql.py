import json
import sqlite3
import os

JSON_PATH = 'shnaton/shnaton_scariping/huji_master_database_with_syllabus_final .json'
DB_PATH = 'backend/huji_data.db'

def migrate():
    if not os.path.exists(JSON_PATH):
        print(f"Error: {JSON_PATH} not found.")
        return

    print("Loading JSON data... (this might take a while)")
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Drop existing tables to start fresh with new schema
    print("Resetting tables...")
    cursor.execute('DROP TABLE IF EXISTS combination_courses')
    cursor.execute('DROP TABLE IF EXISTS combinations')
    cursor.execute('DROP TABLE IF EXISTS courses')

    # Create tables
    print("Creating tables with expanded schema...")
    cursor.execute('''
        CREATE TABLE combinations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roadmap_code TEXT UNIQUE,
            name TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_code TEXT UNIQUE,
            name TEXT,
            credits REAL,
            semester TEXT,
            campus TEXT,
            language TEXT,
            attendance TEXT,
            lecturers TEXT,
            description TEXT,
            goals TEXT,
            learning_outcomes TEXT,
            content TEXT,
            requirements TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE combination_courses (
            combination_id INTEGER,
            course_id INTEGER,
            category_type TEXT,
            year TEXT,
            PRIMARY KEY (combination_id, course_id),
            FOREIGN KEY (combination_id) REFERENCES combinations (id),
            FOREIGN KEY (course_id) REFERENCES courses (id)
        )
    ''')

    course_map = {}
    
    print("Processing data...")
    for item in data:
        roadmap_code = item.get('roadmap_code')
        program_name = item.get('program_full_name_he')

        if not roadmap_code:
            continue

        cursor.execute('''
            INSERT OR IGNORE INTO combinations (roadmap_code, name)
            VALUES (?, ?)
        ''', (roadmap_code, program_name))
        
        cursor.execute('SELECT id FROM combinations WHERE roadmap_code = ?', (roadmap_code,))
        combination_id = cursor.fetchone()[0]

        for category in item.get('categories', []):
            cat_type = category.get('category_type')
            year = category.get('year')
            
            for course_data in category.get('courses', []):
                course_code = course_data.get('course_id')
                if not course_code:
                    continue
                
                if course_code not in course_map:
                    syllabus = course_data.get('syllabus_content', {})
                    staff = course_data.get('staff', {})
                    more_info = course_data.get('more info', {})
                    
                    # Extract lecturers - combining "responsible lecturer" and "teachers"
                    primary_lecturer = staff.get('מרצה אחראי', '')
                    other_teachers = staff.get('מורים', '')
                    all_lecturers = f"{primary_lecturer}, {other_teachers}".strip(', ')
                    
                    cursor.execute('''
                        INSERT OR IGNORE INTO courses (
                            course_code, name, credits, semester,
                            campus, language, attendance, lecturers,
                            description, goals, learning_outcomes,
                            content, requirements
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        course_code,
                        course_data.get('name_he'),
                        course_data.get('credits'),
                        course_data.get('semester'),
                        more_info.get('קמפוס'),
                        more_info.get('שפת הוראה'),
                        more_info.get('נוכחות'),
                        all_lecturers,
                        syllabus.get('תיאור הקורס'),
                        syllabus.get('מטרות הקורס'),
                        syllabus.get('תוצרי למידה'),
                        syllabus.get('תוכן הקורס'),
                        syllabus.get('דרישות נוספות')
                    ))
                    cursor.execute('SELECT id FROM courses WHERE course_code = ?', (course_code,))
                    course_id = cursor.fetchone()[0]
                    course_map[course_code] = course_id
                else:
                    course_id = course_map[course_code]

                cursor.execute('''
                    INSERT OR IGNORE INTO combination_courses (combination_id, course_id, category_type, year)
                    VALUES (?, ?, ?, ?)
                ''', (combination_id, course_id, cat_type, year))

    conn.commit()
    conn.close()
    print("Migration completed successfully.")

if __name__ == '__main__':
    migrate()
