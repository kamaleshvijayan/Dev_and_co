#Dev&co

⛏ Mining Labour Safety Dashboard

A web-based safety monitoring system for mining sites that integrates drone crack detection, sensor frequency analysis, and real-time risk mapping to ensure worker safety.

📖 Project Overview

Mining is a high-risk industry, and timely detection of structural cracks, vibrations, or abnormal frequencies is critical for labour safety.
This project provides a dashboard interface to:

<img width="1182" height="801" alt="Screenshot 2025-09-16 112231" src="https://github.com/user-attachments/assets/5dd939a6-001b-4911-8fe7-508bfc719a23" />
<img width="1899" height="886" alt="Screenshot 2025-09-16 112309" src="https://github.com/user-attachments/assets/fe50c8b1-087f-4ef5-aca6-ba3a9b876802" />



Monitor sensor frequencies in real time (safe, warning, critical zones).

Generate a Risk Map with blinking zones (🟢 Safe, 🟡 Warning, 🔴 Critical) powered by sensor inputs.

Provide alerts, activity logs, and environmental factor predictions to guide mine operations.




🚀 Features

✅ Login Dashboard – Simple entry point for accessing modules.
✅ Drone Image Detect – Upload or simulate drone images to detect crack severity.
✅ Frequency Detect – Monitor vibration/sensor data trends with graphs.
✅ Risk Map – Animated map that visually represents danger zones with blinking indicators.
✅ Alerts & Activity Log – Automatic event logging with severity alerts.
✅ Live Simulation – Auto-refreshing sensors to simulate real-time mining conditions.

📊 Dataset

Drone Crack Detection

Images/Videos of rock surface cracks (collected from drone or open datasets).
![3](https://github.com/user-attachments/assets/457b6814-e212-482b-b15b-f17e19080230)![1](https://github.com/user-attachments/assets/b087bdc0-c590-4add-9685-b01b6fd5fb40)


Categories: No crack, Minor, Medium, Severe, Critical.

Sensor Frequency Data

Simulated vibration & frequency sensor values (30Hz–100Hz range).

Safe Zone ≤ 50Hz, Warning 50–80Hz, Critical ≥ 80Hz.

⚙ Tech Stack

Frontend: HTML5, TailwindCSS, Chart.js, Vanilla JS

Backend (optional ML integration): Python (Streamlit / FastAPI)

Machine Learning (future scope): YOLOv8 / IsolationForest (for crack anomaly detection)

Visualization: Chart.js for line graphs, custom animated Risk Map

📂 Project Structure

📁 SIH-Mining-Safety
 ┣ 📂 src/                # ML/Backend scripts (training, frequency analysis)
 ┣ 📂 static/             # Demo drone images / sensor mock data
 ┣ 📄 app.py              # Streamlit or FastAPI backend entry
 ┣ 📄 index.html          # Main frontend dashboard
 ┣ 📄 README.md           # Documentation
 ┗ 📄 requirements.txt    # Python dependencies

🔔 Usage

Drone Module → Upload drone images or use demo (Small Crack, Deep Crack, No Crack).

Frequency Module → View live sensor data, apply safe/critical thresholds, and analyze risk zones.

Risk Map → Watch dynamic blinking zones update based on sensors.

Alerts → Get instant warning/critical messages in dashboard & activity log.

📌 Future Enhancements

🔹 Integration with real IoT sensors instead of simulation.
🔹 Deployable on Raspberry Pi / Edge devices.
🔹 Drone video feed + YOLOv8 real-time crack detection.
🔹 Advanced anomaly detection using ML models (Isolation Forest, CNN).
🔹 Cloud storage of logs & analytics dashboard.

🤝 Contributors

KAMALESH V  (Project Lead) 

VIVYN R R (BACKEND DEVELOPER)

SHANJAY DEV B (FRONTEND DEVELOPER)

ABDUL AHAD FAEZ M (MACHINE LEARNING ENGINEER)

ANISHA S (RESEARCH & DOCUMENTATION)

DAKSHITA S (PREPROCESSING OF DATASETS)


📜 License

This project is licensed under the MIT License – free to use and modify.







