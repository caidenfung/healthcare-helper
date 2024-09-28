from flask import Flask, jsonify, request, send_from_directory, redirect, url_for, session
from flask_oauthlib.client import OAuth
import sqlite3
import os
from secrets import GOOGLE_SECRET, GOOGLE_CLIENT_ID

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
app.secret_key = GOOGLE_SECRET
oauth = OAuth(app)


google = oauth.remote_app(
    'google',
    consumer_key=GOOGLE_CLIENT_ID,
    consumer_secret=GOOGLE_SECRET,
    request_token_params={
        'scope': 'email',
    },
    base_url='https://www.googleapis.com/oauth2/v1/',
    request_token_url=None,
    access_token_method='POST',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
)

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/login')
def login():
    return google.authorize(callback=url_for('authorized', _external=True))


@app.route('/login/callback')
def authorized():
    response = google.authorized_response()
    if response is None or response.get('access_token') is None:
        return 'Access denied: reason={} error={}'.format(
            request.args['error_reason'],
            request.args['error_description']
        )

    session['google_token'] = (response['access_token'], '')
    user_info = google.get('userinfo')
    session['user'] = user_info.data
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    session.pop('google_token')
    session.pop('user')
    return redirect(url_for('index'))

@app.route('/')
def index():
    if 'user' in session:
        return send_from_directory(app.static_folder, 'index.html')
    return redirect(url_for('login'))

@app.route('/api/users', methods=['GET'])
def get_users():
    if 'user' not in session:
        return redirect(url_for('login'))
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users')
    users = cursor.fetchall()
    conn.close()
    return jsonify(users)

@app.route('/api/users', methods=['POST'])
def add_user():
    if 'user' not in session:
        return redirect(url_for('login'))
    new_user = request.json
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('INSERT INTO users (name) VALUES (?)', (new_user['name'],))
    conn.commit()
    conn.close()
    return jsonify(new_user), 201

@app.route('/')
def serve():
    if 'user' in session:
        return send_from_directory(app.static_folder, 'index.html')
    return redirect(url_for('login'))

@google.tokengetter
def get_google_oauth_token():
    return session.get('google_token')

if __name__ == '__main__':
    with app.app_context():
        init_db()
    app.run(debug=True)