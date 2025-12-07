from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

with open('rf_model.pkl', 'rb') as file:
    model = joblib.load(file)

AGE_MAPPING = {
    '18-24': 0, '25-29': 1, '30-34': 2, '35-39': 3, '40-44': 4,
    '45-49': 5, '50-54': 6, '55-59': 7, '60-64': 8, '65-69': 9,
    '70-74': 10, '75-79': 11, '80 or older': 12
}

SEX_MAPPING = {'Male': 1, 'Female': 0}

GENHEALTH_MAPPING = {0: 5, 1: 4, 2: 3, 3: 2, 4: 1}

DIABETIC_MAPPING = {
    '0': 0,
    '1': 1,
    '2': 2
}

YES_NO_MAPPING = {'Yes': 1, 'No': 0}

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        input_data = {
            'Age': AGE_MAPPING.get(data['Age'], 0),
            'Sex': SEX_MAPPING.get(data['Sex'], 0),
            'HighBP': YES_NO_MAPPING.get(data['HighBP'], 0),
            'HighChol': YES_NO_MAPPING.get(data['HighChol'], 0),
            'BMI': float(data['BMI']),
            'Diabetes': DIABETIC_MAPPING.get(data['Diabetes'], 0),
            'Stroke': YES_NO_MAPPING.get(data['Stroke'], 0),
            'GenHlth': GENHEALTH_MAPPING.get(int(data['GenHealth']), 0),
            'Smoker': YES_NO_MAPPING.get(data['Smoker'], 0),
            'HvyAlcoholConsump': YES_NO_MAPPING.get(data['HvyAlcoholConsump'], 0),
            'PhysActivity': YES_NO_MAPPING.get(data['PhysActivity'], 0),
        }
        
        df = pd.DataFrame([input_data])
        
        prediction = model.predict(df)[0]
        prediction_proba = model.predict_proba(df)[0]
        
        risk_probability = prediction_proba[1] * 100
        
        if risk_probability < 20:
            risk_level = 'Rendah'
            risk_color = '#10b981'
        elif risk_probability < 50:
            risk_level = 'Sedang'
            risk_color = '#f59e0b'
        elif risk_probability < 75:
            risk_level = 'Tinggi'
            risk_color = '#ef4444'
        else:
            risk_level = 'Sangat Tinggi'
            risk_color = '#dc2626'
        
        response = {
            'success': True,
            'prediction': int(prediction),
            'risk_probability': round(risk_probability, 2),
            'risk_level': risk_level,
            'risk_color': risk_color,
            'recommendation': get_recommendation(risk_level, input_data)
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

def get_recommendation(risk_level, data):
    recommendations = []
    
    if risk_level in ['Tinggi', 'Sangat Tinggi']:
        recommendations.append('Segera konsultasikan dengan dokter!')
    elif risk_level == 'Sedang':
        recommendations.append('Pertimbangkan untuk berkonsultasi dengan dokter')
    else:
        recommendations.append('Pertahankan gaya hidup sehat Anda')
    
    if data['Smoker'] == 1:
        recommendations.append('Berhenti merokok - faktor risiko utama penyakit jantung')
    
    if data['HvyAlcoholConsump'] == 1:
        recommendations.append('Kurangi konsumsi alkohol')
    
    if data['PhysActivity'] == 0:
        recommendations.append('Tingkatkan aktivitas fisik (minimal 150 menit/minggu)')
    
    if data['BMI'] > 25:
        recommendations.append('Pertahankan berat badan ideal dengan diet seimbang')
    
    if data['Diabetes'] in [0, 1, 2]:
        recommendations.append('Kontrol kadar kolesterol, gula darah, dan tekanan darah secara teratur')
    
    recommendations.append('Konsumsi makanan bergizi, rendah gula, rendah lemak, dan rendah garam')
    recommendations.append('Tidur cukup (7-8 jam per hari)')
    recommendations.append('Kelola stres dengan baik')
    
    return recommendations

if __name__ == '__main__':
    app.run(debug=True, port=5000)
