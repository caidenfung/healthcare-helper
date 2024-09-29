import flask
import sqlite3
import os
import requests
import json

app = flask.Flask(__name__, static_folder='../frontend/build', template_folder='../frontend/build')
app.secret_key = os.urandom(24)

def get_db():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            is_doctor BOOL NOT NULL,
            name TEXT,
            email TEXT,
            password TEXT,
            age INTEGER,
            sex TEXT,
            city TEXT,
            residence_status TEXT,
            employment_status TEXT,
            allergies TEXT, 
            medications TEXT,
            vaccination_history TEXT,
            medical_history TEXT,
            smoker TEXT,
            drinker TEXT,
            surgeries TEXT,
            exercise_frequency TEXT,
            outside_the_country TEXT,
            if_outside_country_where TEXT
        )
    ''')
    conn.commit()
    conn.close()

def report_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            report_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    conn.commit()
    conn.close()
    

def get_user_from_id(connection, user_id):
    """Fetch all user info from email."""
    cur = connection.execute(
        """
        SELECT *
        FROM users
        WHERE id = ?
        """,
        (user_id,),
    )
    return cur.fetchone()

def get_user_info(connection, email):
    """Fetch all user info from email."""
    cur = connection.execute(
        """
        SELECT *
        FROM users
        WHERE email = ?
        """,
        (email,),
    )
    return cur.fetchone()

@app.route('/api/register', methods=["POST"])
def register():
    """Handle user registration."""
    data = flask.request.json
    is_doctor = data.get('is_doctor')
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    age = data.get('age')
    sex = data.get('sex')
    city = data.get('city')
    residence_status = data.get('residence_status')
    employment_status = data.get('employment_status')
    allergies = data.get('allergies')
    medications = data.get('medications')
    vaccination_history = data.get('vaccination_history')
    medical_history = data.get('medical_history')
    smoker = data.get('smoker')
    drinker = data.get('drinker')
    surgeries = data.get('surgeries')
    exercise_frequency = data.get('exercise_frequency')
    outside_the_country = data.get('outside_the_country')
    if_outside_country_where = data.get('if_outside_country_where')
    print("Is Doctor: ", is_doctor)
    print("Name: ", name)
    print("Email: ", email)
    print("Password: ", password)
    print("Age: ", age)
    print("Sex: ", sex)
    print("City: ", city)
    print("Residence Status: ", residence_status)
    print("Employment Status: ", employment_status)
    print("Allergies: ", allergies)
    print("Medications: ", medications)
    print("Vaccination History: ", vaccination_history)
    print("Medical History: ", medical_history)
    print("Smoker: ", smoker)
    print("Drinker: ", drinker)
    print("Surgeries: ", surgeries)
    print("Exercise Frequency: ", exercise_frequency)
    print("Outside the country: ", outside_the_country)
    print("If outside country where: ", if_outside_country_where)

    connection = get_db()
    user = get_user_info(connection, email)
    if user:
        return flask.jsonify({'message': 'User already exists'}), 409

    connection.execute(
        """
        INSERT INTO users (
            is_doctor, name, email, password, age, sex, city, residence_status, 
            employment_status, allergies, medications, vaccination_history, 
            medical_history, smoker, drinker, surgeries, exercise_frequency, 
            outside_the_country, if_outside_country_where
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            is_doctor, name, email, password, age, sex, city, residence_status, 
            employment_status, allergies, medications, vaccination_history, 
            medical_history, smoker,drinker, surgeries, exercise_frequency, 
            outside_the_country, if_outside_country_where
        ),
    )
    connection.commit()
    flask.session['email'] = email
    flask.session['id'] = get_user_info(connection, email)['id']
    # return if is doctor as well
    return flask.jsonify({'message': 'User created', 'is_doctor': is_doctor}), 201
    #return flask.jsonify({'message': 'User created'}), 201


@app.route('/logout/', methods=['POST'])
def logout():
    """Health logout."""
    flask.session.clear()
    return flask.redirect(flask.url_for('show_login'))

@app.route('/register/', methods=["GET"])
def show_register():
    """Health register."""
    if 'email' in flask.session:
        return flask.redirect(flask.url_for('show_index'))
    return flask.send_from_directory(app.template_folder, 'index.html')

@app.route('/api/login', methods=["POST"])
def login():
    """Handle user login."""
    data = flask.request.json
    email = data.get('email')
    password = data.get('password')
    connection = get_db()
    user = get_user_info(connection, email)
    if user and user['password'] == password:
        flask.session['email'] = email
        flask.session['id'] = user['id']
        # also return whether the user is a doctor or not
        return flask.jsonify({'message': 'Login successful', 'is_doctor': user['is_doctor']}), 200
    return flask.jsonify({'message': 'Invalid credentials'}), 401



@app.route('/api/chat/<int:report_id>', methods=["GET"])
def get_chat(report_id):
    """Fetch chat."""
    # check if report with report_id actually exists:
    if 'email' not in flask.session:
        return flask.redirect(flask.url_for('show_login'))
    connection = get_db()
    cur = connection.execute(
        """
        SELECT *
        FROM reports
        WHERE report_id = ?
        """,
        (report_id,),
    )
    if not cur.fetchone():
        return flask.jsonify({'message': 'Chat not found'}), 404
    email = flask.session.get('email')
    uinf = get_user_info(connection, email)
    # get user_id from report_id
    cur = connection.execute(
        """
        SELECT user_id
        FROM reports
        WHERE report_id = ?
        """,
        (report_id,),
    )
    user_id = cur.fetchone()['user_id']
    if not uinf['is_doctor'] and user_id != uinf['id']:
        return flask.jsonify({'message': 'Unauthorized'}), 401
    cur = connection.execute(
        """
        SELECT content
        FROM reports
        WHERE report_id = ?
        """,
        (report_id,),
    )
    row = cur.fetchone()

    if row:
        content = dict(row)
    
        sections = {
            "chat": [],
            "summary": [],
            "diagnoses": [],
            "investigations": []
        }
        print(content['content'])
        # Split the input string by sections
        chat = content['content'].split("CHAT_BEGIN")[1].split("CHAT_END")[0].strip().split("~~")
        summary = content['content'].split("SUMMARY_BEGIN")[1].split("SUMMARY_END")[0].strip().split("~~")
        diagnoses = content['content'].split("POTENTIAL_DIAGNOSES_BEGIN")[1].split("POTENTIAL_DIAGNOSES_END")[0].strip().split("~~")
        investigations = content['content'].split("FURTHER_INVESTIGATIONS_BEGIN")[1].split("FURTHER_INVESTIGATIONS_END")[0].strip().split("~~")
        
        # Assign the lists to corresponding keys
        sections["chat"] = [line.strip() for line in chat if line.strip()]
        sections["chat"].append('Healthcare Helper: Answers received, a doctor will be with you shortly!')
        sections["summary"] = [line.strip() for line in summary if line.strip()]
        sections["diagnoses"] = [line.strip() for line in diagnoses if line.strip()]
        sections["investigations"] = [line.strip() for line in investigations if line.strip()]
        

        return flask.jsonify(sections)
    else:
        return flask.jsonify({'message': 'Chat not found'}), 404

@app.route('/chat/<int:report_id>', methods=["GET"])
def show_chat(report_id):
    """Health chat."""
    print("loading site?")
    if 'email' not in flask.session:
        return flask.redirect(flask.url_for('show_login'))
    print('loading chat part 9')
    connection = get_db()
    print('loading chat part 8')
    cur = connection.execute(
        """
        SELECT *
        FROM reports
        WHERE report_id = ?
        """,
        (report_id,),
    )
    print('loading chat part 1')
    if not cur.fetchone():
        return flask.jsonify({'message': 'Chat not found'}), 404
    email = flask.session.get('email')
    uinf = get_user_info(connection, email)
    # get user_id from report_id
    cur = connection.execute(
        """
        SELECT user_id
        FROM reports
        WHERE report_id = ?
        """,
        (report_id,),
    )
    user_id = cur.fetchone()['user_id']
    if not uinf['is_doctor'] and user_id != uinf['id']:
        return flask.jsonify({'message': 'Unauthorized'}), 401
    print("loading chat")
    return flask.send_from_directory(app.template_folder, 'index.html')
    

@app.route('/login/', methods=["GET"])
def show_login():
    """Health login."""
    if 'email' in flask.session:
        return flask.redirect(flask.url_for('show_index'))
    return flask.send_from_directory(app.template_folder, 'index.html')




@app.route('/api/helper_api/', methods=["POST"])
def helper():
    """Health helper."""
    if 'email' not in flask.session:
        return flask.redirect(flask.url_for('show_login'))
    
    email = flask.session.get('email')
    connection = get_db()
    uinf = get_user_info(connection, email)

    data = flask.request.get_json()  # Get the JSON data from the request
    # Process the data
    input = data.get('message')
    next = data.get('next')
    report_id = data.get('report_id')

    print(input, next)
    
    # Do something with the data (e.g., save to database)
    url = "https://breadboard-community.wl.r.appspot.com/boards/@AdorableDog/hana-librarian-test.bgl.api/run"
    headers = {
        'Content-Type': 'application/json'
    }
    key = "bb-433j5l5x4e63546e0496fa423t66m10534hg52513x426u3bx4"
    

    if next == '':
        # get patient data from the database
        # get all patient data from the database
        cur = connection.execute(
            """
            SELECT *
            FROM users
            WHERE email = ?
            """,
            (email,),
        )
        patient_data = cur.fetchone()
        patient_data = f'''
        Name: {patient_data['name']}
        Age: {patient_data['age']}
        Sex: {patient_data['sex']}
        City of Residence: {patient_data['city']}
        Residence Status: {patient_data['residence_status']}
        Employment Status: {patient_data['employment_status']}
        Allergies: {patient_data['allergies']}
        Medications: {patient_data['medications']}
        Vaccination History: {patient_data['vaccination_history']}
        Personal Medical History: {patient_data['medical_history']}
        Surgeries: {patient_data['surgeries']}
        Tobacco Usage: {patient_data['smoker']}
        Alcohol Usage: {patient_data['drinker']}
        Exercise: {patient_data['exercise_frequency']}
        Have you been outside the country in the last 30 days: {patient_data['outside_the_country']}
        If so, where: {patient_data['if_outside_country_where']}
        '''

        # Format it into a string like the one below
        print(patient_data)

        '''patient_data = Name: John Smith
                            Age: 19
                            City of Residence: Boston
                            Residence Status: Living Alone
                            Employment Status: Student
                            Reason for Visit: Check Up
                            Allergies: Peanuts
                            Medications: Insulin
                            Vaccination History: Last Flu shot - Dec 12 2022
                            Personal Medical History:
                            Asthma-Current
                            Alcoholism/Drug abuse-No history
                            Diabetes-Current
                            Surgeries:Elbow surgery 2006
                            Tobacco Use: Never used
                            Exercise: A couple times a week
                            Have you been outside the country in the last 30 days: yes
                            If so, where: Kenya
                            '''
        payload = {
            "$key": key,
            "text": {
                "role": "user",
                "parts": [{ "text": patient_data + '\nReason for visit: ' + input }]
            }
        }
    else:
        payload = {
            "$key": key,
            "$next": next,
            "text": {
                "role": "user",
                "parts": [{ "text": input }]
            }
        }

    json_payload = json.dumps(payload)
    
    # do the request to breadboard api
    response = requests.post(url, headers=headers, data=json_payload)

    response_stream_events = response.text.split('\n\n')
    output_response_list = json.loads(response_stream_events[0].lstrip('data: '))
    print("test12")
    # the helper is done!
    if len(response_stream_events) == 2:
        model_text = output_response_list[1]['outputs']['context'][-1]['parts'][0]['text']
        if model_text is None:
            model_text = 'Answers received, a doctor will be with you shortly!'
        #store model_text in database

        


        user_id = flask.session.get('id')
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        cursor.execute(
        "UPDATE reports SET content = ? WHERE report_id = ?",
        (model_text, report_id)
        )
        conn.commit()
        conn.close()

        end = True
        new_next = ''
        model_text = 'Answers received, a doctor will be with you shortly!'
    else:
        input_response_list = json.loads(response_stream_events[1].lstrip('data: '))
        model_out = output_response_list[1]['outputs']['output']
        model_text = model_out[-1]['parts'][0]['text'].strip()
        new_next = input_response_list[2]
        end = False

    print(model_text)
    
    response = {
        'model_response': model_text,
        'end': end,
        'next': new_next
    }
    print("test1")
    return flask.jsonify(response), 201  # 201 Created status code


@app.route('/helper_chat/<int:report_id>', methods=["GET"])
def show_helper_chat(report_id):
    """Health helper chat."""
    if 'email' not in flask.session:
        return flask.redirect(flask.url_for('show_login'))
    email = flask.session.get('email')
    connection = get_db()
    uinf = get_user_info(connection, email)
    if uinf['is_doctor']:
        return flask.redirect(flask.url_for('show_doctor'))
    # get user_id from report_id
    cur = connection.execute(
        """
        SELECT user_id
        FROM reports
        WHERE report_id = ?
        """,
        (report_id,),
    )
    user_id = cur.fetchone()['user_id']
    if user_id != uinf['id']:
        return flask.jsonify({'message': 'Unauthorized'}), 401
    
    return flask.send_from_directory(app.template_folder, 'index.html')

@app.route('/api/new_report', methods=["POST"])
def new_report():
    """Health new report."""
    if 'email' not in flask.session:
        return flask.redirect(flask.url_for('show_login'))
    email = flask.session.get('email')
    connection = get_db()
    uinf = get_user_info(connection, email)
    if uinf['is_doctor']:
        return flask.redirect(flask.url_for('show_doctor'))
    
    # get user_id from email
    cur = connection.execute(
        """
        SELECT id
        FROM users
        WHERE email = ?
        """,
        (email,),
    )
    user_id = cur.fetchone()['id']
    content = ""
    connection.execute(
        """
        INSERT INTO reports (user_id, content)
        VALUES (?, ?)
        """,
        (user_id, content),
    )
    connection.commit()
    # return the report_id
    cur = connection.execute(
        """
        SELECT report_id
        FROM reports
        WHERE user_id = ?
        AND content = ?
        """,
        (user_id, content),
    )
    report_id = cur.fetchone()['report_id']
    #print("test", report_id)
    return flask.jsonify({'report_id': report_id}), 201

@app.route('/patient/', methods=["GET"])
def show_patient():
    """Health patient."""
    if 'email' not in flask.session:
        return flask.redirect(flask.url_for('show_login'))
    email = flask.session.get('email')
    connection = get_db()
    uinf = get_user_info(connection, email)
    if uinf['is_doctor']:
        return flask.redirect(flask.url_for('show_doctor'))
    return flask.send_from_directory(app.template_folder, 'index.html')



@app.route('/api/chats', methods=["GET"])
def get_chats_api():
    # fetch all chats
    if 'email' not in flask.session:
        return flask.redirect(flask.url_for('show_login'))
    email = flask.session.get('email')
    connection = get_db()
    uinf = get_user_info(connection, email)
    if uinf['is_doctor'] == False:
        return flask.jsonify({'message': 'Unauthorized'}), 401
    # get all chats, as json show the name of the person, the chat_id, and the link
    cur = connection.execute(
        """
        SELECT report_id, user_id
        FROM reports
        """
    )
    
    chats = cur.fetchall()
    # get link and full name 
    #rint("made it here!")
    chat_list = []
    for chat in chats:  
        chat_dict = {
        'link': f"/chat/{chat['report_id']}",
        'user_id': chat['user_id'],
        'name': get_user_from_id(connection, chat['user_id'])['name'],
        'report_id': chat['report_id']
        }
        chat_list.append(chat_dict)
    #print("Chats:", chat_list)
    return flask.jsonify(chat_list), 200


@app.route('/doctor/', methods=["GET"])
def show_doctor():
    """Health doctor."""
    email = flask.session.get('email')
    if 'email' not in flask.session:
        return flask.redirect(flask.url_for('show_login'))
    connection = get_db()
    uinf = get_user_info(connection, email)
    if uinf['is_doctor'] == False:
        return flask.redirect(flask.url_for('show_patient'))
    return flask.send_from_directory(app.template_folder, 'index.html')

@app.route('/')
def show_index():
    """Health Index Page!."""
    email = flask.session.get('email')
    print(email)
    if 'email' not in flask.session:
        return flask.redirect(flask.url_for('show_login'))
    # bug fixing
    connection = get_db()
    uinf = get_user_info(connection, email)
    if uinf is None:
        flask.session.clear()
        return flask.redirect(flask.url_for('show_login'))
    if uinf['is_doctor']:
        return flask.redirect(flask.url_for('show_doctor'))
    else:
        return flask.redirect(flask.url_for('show_patient'))
    context = {"email": email}
    return flask.send_from_directory(app.template_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files."""
    return flask.send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    init_db()
    report_db()


    app.run(debug=True)