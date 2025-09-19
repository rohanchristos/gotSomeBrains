# 🧠 GotSomeBrains - Mental Health Assessment Platform

A comprehensive mental health assessment application powered by **TensorFlow.js neural networks** and built with **React + TypeScript**. This platform provides standardized psychological assessments with AI-driven analysis and real-time machine learning capabilities.

## 🌟 Features

### 🔬 **Standardized Psychological Assessments**
- **PHQ-9** (Patient Health Questionnaire-9) - Depression screening
- **GAD-7** (Generalized Anxiety Disorder-7) - Anxiety assessment  
- **PSS-10** (Perceived Stress Scale-10) - Stress evaluation
- **Custom ML Assessment** - AI-powered personalized evaluation

### 🤖 **Advanced AI & Machine Learning**
- **TensorFlow.js Neural Network** - 4-layer architecture (16→12→8→1 neurons)
- **Real-time Model Training** - Automatic training with synthetic data
- **Contextual Analysis** - Age, institution type, and demographic considerations
- **Risk Assessment** - Intelligent severity classification and recommendations
- **MongoDB Integration** - Persistent storage of assessment results

### 💻 **Modern Tech Stack**
- **Frontend**: React 19+ with TypeScript, Vite build system
- **Backend**: Node.js + Express + TensorFlow.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.IO for live updates
- **UI/UX**: Modern responsive design with accessibility features

### 🛡️ **Privacy & Security**
- Comprehensive privacy notices and disclaimers
- Secure user context collection
- Anonymous assessment options
- HIPAA-compliant data handling practices

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rohanchristos/gotSomeBrains.git
   cd gotSomeBrains
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the `backend` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/mental-health-db
   PORT=5000
   NODE_ENV=development
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The backend will run on `http://localhost:5000`

3. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

4. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## 📊 Data Formats & API

### Standardized Assessment Data Format
```json
{
  "assessment_type": "PHQ9",
  "responses": [1, 2, 0, 1, 2, 3, 1, 0, 1],
  "user_context": {
    "age_group": "18-25",
    "institution_type": "university",
    "gender": "prefer_not_to_say",
    "previous_treatment": false
  }
}
```

### ML Response Format
```json
{
  "risk_level": "moderate",
  "confidence": 0.85,
  "recommendations": ["sleep_hygiene", "stress_management"],
  "crisis_flag": false,
  "next_assessment_days": 7,
  "neural_network_score": 0.73,
  "assessment_id": "unique-uuid-here"
}
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/customML` | POST | Process assessment with TensorFlow.js ML model |
| `/model/status` | GET | Check neural network model status |
| `/assessment/:userId` | GET | Retrieve user's assessment history |
| `/health` | GET | Server health check |

## 🏗️ Project Structure

```
gotSomeBrains/
├── src/
│   ├── components/
│   │   ├── assessments/          # Assessment components (PHQ9, GAD7, PSS10)
│   │   ├── chat/                 # Real-time chat functionality
│   │   ├── AdminDashboard.tsx    # Admin interface
│   │   ├── Landing.tsx           # Landing page
│   │   ├── MentalHealthAssessment.tsx
│   │   ├── ResultsDisplay.tsx    # Assessment results with ML analysis
│   │   └── UserContextForm.tsx   # User demographic collection
│   ├── services/
│   │   ├── BackendService.ts     # API communication layer
│   │   └── MLService.ts          # Machine learning service
│   └── types/                    # TypeScript type definitions
├── backend/
│   ├── server.js                 # Express server with TensorFlow.js
│   ├── ml/                       # Machine learning models and utilities
│   └── models/                   # MongoDB schemas
└── public/                       # Static assets
```

## 🎯 How to Use

### 1. **Assessment Selection**
- Choose from standardized assessments (PHQ-9, GAD-7, PSS-10)
- Or try the Custom ML Assessment for AI-powered evaluation

### 2. **User Context Collection**
- Provide demographic information (optional but improves accuracy)
- Age group, institution type, gender, treatment history

### 3. **Complete Assessment**
- Answer questions honestly using the provided scales
- Questions are based on validated psychological instruments

### 4. **AI Analysis**
- Real-time processing with TensorFlow.js neural network
- Contextual analysis considering demographic factors
- Risk level assessment and personalized recommendations

### 5. **Results & Recommendations**
- Detailed severity interpretation
- AI-generated recommendations
- Crisis intervention resources if needed
- Follow-up assessment scheduling

## 🧪 Neural Network Architecture

The TensorFlow.js model uses a sequential neural network:

```
Input Layer (16 neurons) → ReLU Activation
Hidden Layer 1 (12 neurons) → ReLU Activation  
Hidden Layer 2 (8 neurons) → ReLU Activation
Output Layer (1 neuron) → Sigmoid Activation
```

- **Training Data**: 1000+ synthetic assessment responses
- **Optimizer**: Adam optimizer with learning rate 0.001
- **Loss Function**: Binary crossentropy
- **Metrics**: Accuracy and precision tracking

## 🔧 Development

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend Development
```bash
npm start            # Start production server
npm run dev          # Start development server
```

### Building for Production
```bash
# Frontend
npm run build

# Backend
cd backend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Important Disclaimers

- **Not a Substitute for Professional Care**: This tool is for screening purposes only
- **Crisis Situations**: If you're experiencing a mental health crisis, contact emergency services
- **Privacy**: All data is handled according to privacy best practices
- **Accuracy**: AI recommendations should be validated by healthcare professionals

## 📞 Support & Resources

- **Crisis Hotline**: 988 (Suicide & Crisis Lifeline)
- **Emergency**: 911
- **Documentation**: [Project Wiki](https://github.com/rohanchristos/gotSomeBrains/wiki)
- **Issues**: [GitHub Issues](https://github.com/rohanchristos/gotSomeBrains/issues)

---

**Built with ❤️ for mental health awareness and AI-powered healthcare solutions**
