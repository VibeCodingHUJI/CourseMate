import requests
from bs4 import BeautifulSoup
import json
import time

def scrape_huji_shnaton(faculty_code="07", chug_code="52", year_of_study="2", academic_year="2024"):
    """
    Scrapes course data from the HUJI Shnaton.
    Target: Business Administration (Faculty 07, Department 52), Year 2.
    Note: The user mentioned "Faculty 52", which in HUJI is often the Department code 
    for Business Administration under the Faculty of Social Sciences (07).
    """
    
    # The URL for the search results in the classic Shnaton structure
    url = "https://shnaton.huji.ac.il/index.php/Search/results"
    
    # Headers to mimic a browser and handle the session
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Referer": "https://shnaton.huji.ac.il/",
        "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7"
    }
    
    # POST parameters for the search
    payload = {
        "data[Search][year]": academic_year,
        "data[Search][fac]": faculty_code,   # Faculty code (e.g., 07 for Social Sciences)
        "data[Search][chug]": chug_code,    # Department code (e.g., 52 for Business Admin)
        "data[Search][shana]": year_of_study, # Year of study (e.g., 2)
        "data[Search][search]": "Show List"
    }
    
    print(f"Requesting data for Faculty {faculty_code}, Department {chug_code}, Year {year_of_study}...")
    
    try:
        # Use a session to handle cookies if necessary
        session = requests.Session()
        response = session.post(url, data=payload, headers=headers)
        response.raise_for_status()
        
        # HUJI uses UTF-8 for the modern Shnaton
        response.encoding = 'utf-8'
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Logic for parsing the results table
        # In the Shnaton, courses are typically listed in a table with class 'shnaton_table'
        # or in divs with specific classes.
        
        courses = []
        
        # 1. Try finding the classic results table
        results_table = soup.find('table', class_='shnaton_table')
        
        if results_table:
            # Iterate through rows, skipping the header
            rows = results_table.find_all('tr')
            for row in rows:
                cols = row.find_all('td')
                # A valid course row usually has at least 5 columns
                if len(cols) >= 5:
                    course_id = cols[0].get_text(strip=True)
                    # Course ID should be numeric and usually 5 digits
                    if not course_id.isdigit():
                        continue
                        
                    course_name = cols[1].get_text(strip=True)
                    credits_val = cols[2].get_text(strip=True)
                    semester = cols[3].get_text(strip=True)
                    teacher = cols[4].get_text(strip=True)
                    
                    courses.append({
                        "Course ID": course_id,
                        "Course Name": course_name,
                        "Credits": credits_val,
                        "Semester": semester,
                        "Teacher": teacher
                    })
        
        # 2. Alternative structure (if the table is not found directly)
        if not courses:
            # Some views use nested divs or different table IDs
            course_items = soup.find_all('div', class_='course_item')
            for item in course_items:
                try:
                    cid = item.find('span', class_='course_number').text.strip()
                    name = item.find('h3', class_='course_title').text.strip()
                    # Credits, Semester, Teacher might be in a details list
                    details = item.find_all('li')
                    # This depends on the specific layout
                    courses.append({
                        "Course ID": cid,
                        "Course Name": name,
                        "Credits": "TBD",
                        "Semester": "TBD",
                        "Teacher": "TBD"
                    })
                except:
                    continue

        # If no courses found, the Shnaton might be using the new 'Orbit' React app
        if not courses:
            print("Notice: No courses found in the HTML. The Shnaton may have moved to a React-based system (Orbit).")
            print("Returning empty list. Please verify the URL/API if this is for the new system.")

        # Save to courses.json with UTF-8 encoding
        with open('courses.json', 'w', encoding='utf-8') as f:
            json.dump(courses, f, ensure_ascii=False, indent=4)
        
        print(f"Done! Extracted {len(courses)} courses.")
        return courses

    except Exception as e:
        print(f"Error: {e}")
        return []

if __name__ == "__main__":
    # Based on user request for "Business Administration (Faculty 52), Year 2"
    # We use faculty_code=52 as specifically requested.
    scrape_huji_shnaton(faculty_code="52", chug_code="52", year_of_study="2")
