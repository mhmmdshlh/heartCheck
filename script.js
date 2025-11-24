window.addEventListener('load', () => {
    const splash = document.getElementById('splash-screen');

    setTimeout(() => {
        splash.classList.add('hidden');
    }, 3000);
});

const heightInput = document.getElementById('height');
const weightInput = document.getElementById('weight');
const bmiInput = document.getElementById('bmi');
const bmiCategory = document.getElementById('bmiCategory');

function calculateBMI() {
    const height = parseFloat(heightInput.value);
    const weight = parseFloat(weightInput.value);

    if (height > 0 && weight > 0) {
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);

        bmiInput.value = bmi;

        let category = '';
        let categoryClass = '';

        if (bmi < 18.5) {
            category = 'Kekurangan berat badan';
            categoryClass = 'underweight';
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal';
            categoryClass = 'normal';
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Kelebihan berat badan';
            categoryClass = 'overweight';
        } else {
            category = 'Obesitas';
            categoryClass = 'obese';
        }

        bmiCategory.textContent = `Kategori: ${category}`;
        bmiCategory.className = `bmi-category ${categoryClass}`;
    } else {
        bmiInput.value = '';
        bmiCategory.textContent = '';
    }
}

heightInput.addEventListener('input', calculateBMI);
weightInput.addEventListener('input', calculateBMI);

const genHealthSlider = document.getElementById('genHealth');
const genHealthValue = document.getElementById('genHealthValue');

genHealthSlider.addEventListener('input', function () {
    genHealthValue.textContent = this.value;
});

const predictionForm = document.getElementById('predictionForm');
const resultSection = document.getElementById('resultSection');
const resultContent = document.getElementById('resultContent');

predictionForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = {
        AgeCategory: document.getElementById('ageCategory').value,
        Sex: document.getElementById('sex').value,
        BMI: parseFloat(document.getElementById('bmi').value),
        GenHealth: parseInt(document.getElementById('genHealth').value),
        Smoking: document.querySelector('input[name="smoking"]:checked').value,
        AlcoholDrinking: document.querySelector('input[name="alcoholDrinking"]:checked').value,
        PhysicalActivity: document.querySelector('input[name="physicalActivity"]:checked').value,
        Diabetic: document.getElementById('diabetic').value,
        Asthma: document.querySelector('input[name="asthma"]:checked').value,
        KidneyDisease: document.querySelector('input[name="kidneyDisease"]:checked').value,
        SkinCancer: document.querySelector('input[name="skinCancer"]:checked').value,
        Stroke: document.querySelector('input[name="stroke"]:checked').value,
        DiffWalking: document.querySelector('input[name="diffWalking"]:checked').value
    };

    resultSection.classList.remove('hidden');
    resultContent.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div class="loading-spinner"></div>
            <p style="color: var(--text-muted); margin-top: 20px;">Menganalisis data kesehatan Anda...</p>
        </div>
    `;

    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    fetch('https://mshlh.pythonanywhere.com/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayPredictionResult(data);
            } else {
                displayError(data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            displayError('Gagal terhubung ke server. Pastikan server backend sudah berjalan.');
        });
});

function displayPredictionResult(data) {
    const riskPercentage = data.risk_probability;
    const riskLevel = data.risk_level;
    const riskColor = data.risk_color;
    const recommendations = data.recommendation;

    resultContent.innerHTML = `
        <div class="result-card">
            <div class="result-header">
                <h3>Hasil Prediksi Risiko Penyakit Jantung</h3>
            </div>
            
            <div class="risk-meter">
                <div class="risk-circle" style="border-color: ${riskColor};">
                    <div class="risk-percentage" style="color: ${riskColor};">
                        ${riskPercentage}%
                    </div>
                    <div class="risk-label" style="color: ${riskColor};">
                        ${riskLevel}
                    </div>
                </div>
            </div>

            <div class="risk-bar-container">
                <div class="risk-bar">
                    <div class="risk-bar-fill" style="width: ${riskPercentage}%; background: ${riskColor};"></div>
                </div>
                <div class="risk-bar-labels">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                </div>
            </div>

            <div class="recommendations">
                <h4>Rekomendasi Kesehatan:</h4>
                <ul class="recommendation-list">
                    ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>

            <div class="result-disclaimer">
                <p><strong>Disclaimer:</strong> Hasil ini adalah prediksi berbasis AI dan tidak menggantikan diagnosis medis profesional. 
                Selalu konsultasikan dengan dokter untuk evaluasi kesehatan yang akurat.</p>
            </div>

            <button onclick="resetForm()" class="btn-reset">Cek Ulang</button>
        </div>
    `;
}

function displayError(errorMessage) {
    resultContent.innerHTML = `
        <div class="error-card">
            <div style="font-size: 3rem; margin-bottom: 10px;">❌</div>
            <h3 style="color: #ef4444; margin-bottom: 10px;">Terjadi Kesalahan</h3>
            <p style="color: var(--text-muted);">${errorMessage}</p>
            <button onclick="resetForm()" class="btn-reset" style="margin-top: 20px;">Coba Lagi</button>
        </div>
    `;
}

function resetForm() {
    predictionForm.reset();
    resultSection.classList.add('hidden');
    bmiInput.value = '';
    bmiCategory.textContent = '';
    document.getElementById('predictionForm').scrollIntoView({ behavior: 'smooth' });
}

document.querySelector('.btn-start').addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    target.scrollIntoView({ behavior: 'smooth' });
});
