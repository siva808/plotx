from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import jwt, datetime, os, base64

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['SECRET_KEY'] = 'plotx-secret-key-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://plotx:plotx123@localhost/plotx_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

db = SQLAlchemy(app)
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


# ─── Models ───────────────────────────────────────────────────────────────────

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

class Poster(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.Enum('real_estate', 'construction', 'interior'), nullable=False)
    image_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Lead(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    mobile = db.Column(db.String(20), nullable=False)
    service = db.Column(db.String(100))
    source_context = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)


# ─── Auth Helpers ──────────────────────────────────────────────────────────────

def token_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'Token missing'}), 401
        try:
            jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        except:
            return jsonify({'error': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated


# ─── Public Routes ─────────────────────────────────────────────────────────────

@app.route('/api/posters', methods=['GET'])
def get_posters():
    category = request.args.get('category')
    q = Poster.query
    if category:
        q = q.filter_by(category=category)
    posters = q.order_by(Poster.created_at.desc()).all()
    return jsonify([{
        'id': p.id, 'title': p.title, 'description': p.description,
        'category': p.category, 'image_path': p.image_path,
        'created_at': p.created_at.isoformat()
    } for p in posters])

@app.route('/api/leads', methods=['POST'])
def submit_lead():
    data = request.json
    lead = Lead(
        name=data['name'], email=data['email'], mobile=data['mobile'],
        service=data.get('service'), source_context=data.get('source_context')
    )
    db.session.add(lead)
    db.session.commit()
    return jsonify({'message': 'Lead submitted successfully'}), 201


# ─── Admin Auth ────────────────────────────────────────────────────────────────

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    admin = Admin.query.filter_by(username=data.get('username')).first()
    if admin and check_password_hash(admin.password_hash, data.get('password')):
        token = jwt.encode({
            'admin_id': admin.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token})
    return jsonify({'error': 'Invalid credentials'}), 401


# ─── Admin Protected Routes ────────────────────────────────────────────────────
from flask import send_from_directory

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/admin/posters', methods=['POST'])
@token_required
def upload_poster():
    title = request.form.get('title')
    description = request.form.get('description')
    category = request.form.get('category')
    image_path = None
    if 'image' in request.files:
        f = request.files['image']
        filename = secure_filename(f.filename)
        path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        f.save(path)
        image_path = f'/uploads/{filename}'
    poster = Poster(title=title, description=description, category=category, image_path=image_path)
    db.session.add(poster)
    db.session.commit()
    return jsonify({'message': 'Poster uploaded', 'id': poster.id}), 201

@app.route('/api/admin/posters/<int:pid>', methods=['DELETE'])
@token_required
def delete_poster(pid):
    p = Poster.query.get_or_404(pid)
    db.session.delete(p)
    db.session.commit()
    return jsonify({'message': 'Deleted'})

@app.route('/api/admin/leads', methods=['GET'])
@token_required
def get_leads():
    leads = Lead.query.order_by(Lead.created_at.desc()).all()
    return jsonify([{
        'id': l.id, 'name': l.name, 'email': l.email, 'mobile': l.mobile,
        'service': l.service, 'source_context': l.source_context,
        'created_at': l.created_at.isoformat()
    } for l in leads])


# ─── Init ──────────────────────────────────────────────────────────────────────

with app.app_context():
    db.create_all()
    if not Admin.query.filter_by(username='admin').first():
        db.session.add(Admin(username='admin', password_hash=generate_password_hash('plotx2024')))
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
