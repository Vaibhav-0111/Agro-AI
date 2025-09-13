# 🌱 AI-Powered Crop Health & Pest Risk Monitoring Platform

## 🚀 Overview

A cutting-edge dashboard for real-time monitoring of crop health, soil condition, and pest risks using multispectral/hyperspectral imaging and sensor data. Built for farmers, researchers, and agronomists, this platform fuses satellite imagery and environmental sensors with advanced AI models to deliver actionable insights and alerts.

---

## 🧩 Problem Statement


AI-powered monitoring of crop health, soil condition, and pest risks using multispectral/hyperspectral imaging and sensor data.

- **Theme:** Agriculture, FoodTech & Rural Development  
- **Sponsor:** MathWorks India Pvt. Ltd.  
- **Keywords:** Hyperspectral imaging, CNN, LSTM, image processing, soil sensors, crop stress prediction, spectral indices, dashboard

---

## 🎯 Key Features

- **Remote Sensing Data Ingestion:** Supports hyperspectral/multispectral images (Sentinel, Indian Pines, Landsat)
- **Vegetation & Soil Indices Extraction:** NDVI, SAVI, EVI, GNDVI, etc.
- **AI/ML Predictions:** Crop stress, pest risk zones, temporal anomalies (CNN + LSTM)
- **Sensor Data Fusion:** Soil moisture, air temperature, humidity, leaf wetness
- **Zone-Specific Alerts:** Real-time notifications and risk mapping
- **Interactive Dashboard:** 3D field visualization, health overlays, trend plots, and mobile-friendly UI

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, shadcn-ui, Vite
- **AI/ML:** Python/MATLAB (TensorFlow, Keras, Deep Learning Toolbox)
- **Image Processing:** scikit-image, OpenCV, Spectral Python (SPy)
- **Sensor Data:** Simulated or real (ThingSpeak, OpenWeatherMap API)
- **Visualization:** 3D field maps, charts, overlays

---

## 🗺️ Architecture

```
+--------------------+        +-----------------------------+
|  Satellite Images  | ---->  | Image Preprocessing Module  |
+--------------------+        +-----------------------------+
                                     |
                          +----------v-----------+
                          |   Spectral Index Calc|
                          +----------+-----------+
                                     |
         +---------------------------v-------------------------+
         |    ML Model (CNN + LSTM) for prediction             |
         |    - Crop stress detection                          |
         |    - Pest outbreak prediction                       |
         +---------------------------+-------------------------+
                                     |
             +-----------------------v-------------------+
             | Fuse sensor data (humidity, temp, etc.)   |
             +-----------------------+-------------------+
                                     |
                           +---------v---------+
                           |   Dashboard + App |
                           +-------------------+
```

---

## 📊 Dashboard Highlights

- **3D Field Visualization:** Immersive, interactive crop health maps
- **No-Button UI:** Intuitive navigation and controls for seamless experience
- **Health & Risk Overlays:** Visualize stress zones, pest alerts, and sensor trends
- **Reports & Notifications:** Downloadable insights and mobile alerts

---

## 🏆 Why This Project Stands Out

| Feature                | Why It Matters                                      |
|------------------------|-----------------------------------------------------|
| Highly Technical       | Strong AI + image processing focus                  |
| Novel Use Case         | Combines remote sensing + sensor fusion             |
| Real-World Impact      | Directly benefits agriculture stakeholders          |
| Sponsored by MathWorks | MATLAB stack preferred, lower competition           |
| Data Availability      | Uses public datasets (Sentinel, Indian Pines, etc.) |
| Evaluation Potential   | Clear deliverables: maps, alerts, predictions       |

---

## 📦 Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

---



---

## 💡 Tips for Success

- Use real datasets for demo (Sentinel-2, Indian Pines)
- Focus on fusion of image + sensor data + ML prediction
- Keep UI clean and intuitive (“Farmer Mode” recommended)
- Simulate sensor data if hardware is unavailable

---

## 📚 Resources

- [Sentinel-2 Data](https://sentinel.esa.int/web/sentinel/sentinel-data-access)
- [Indian Pines Dataset](https://www.ehu.eus/ccwintco/index.php/Hyperspectral_Remote_Sensing_Scenes)
- [Spectral Python (SPy)](https://github.com/spectralpython/spectral)
- [ThingSpeak](https://thingspeak.com/)
- [MATLAB Deep Learning Toolbox](https://www.mathworks.com/products/deep-learning.html)

---

## 📞 Contact & Support

For questions or contributions, open an issue or contact the team via [Gmail](vaibhavtripathi724@gmail.com).

---

**Let’s revolutionize agriculture with AI-powered insights!**
