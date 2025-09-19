// Use browser-compatible TensorFlow.js for better Node.js compatibility
require('@tensorflow/tfjs-backend-cpu');
const tf = require('@tensorflow/tfjs');

class CustomMLModel {
  constructor() {
    this.model = null;
    this.isModelReady = false;
    this.initializeModel();
  }

  async initializeModel() {
    try {
      // Create a neural network model
      this.model = tf.sequential({
        layers: [
          // Input layer: responses (3) + encoded user context (4) = 7 features
          tf.layers.dense({
            inputShape: [7],
            units: 16,
            activation: 'relu',
            name: 'input_layer'
          }),
          
          // Hidden layer 1: Pattern recognition
          tf.layers.dense({
            units: 12,
            activation: 'relu',
            name: 'hidden_layer_1'
          }),
          
          // Hidden layer 2: Feature interaction
          tf.layers.dense({
            units: 8,
            activation: 'relu',
            name: 'hidden_layer_2'
          }),
          
          // Output layer: risk score (0-1 normalized)
          tf.layers.dense({
            units: 1,
            activation: 'sigmoid',
            name: 'output_layer'
          })
        ]
      });

      // Compile the model
      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae']
      });

      // Train the model with synthetic data
      await this.trainModel();
      
      this.isModelReady = true;
      console.log('TensorFlow.js model initialized and trained successfully');
      
    } catch (error) {
      console.error('Error initializing TensorFlow.js model:', error);
      this.isModelReady = false;
    }
  }

  async trainModel() {
    // Generate synthetic training data for mental health assessment
    const trainingSize = 1000;
    const { inputs, outputs } = this.generateTrainingData(trainingSize);
    
    const xs = tf.tensor2d(inputs);
    const ys = tf.tensor2d(outputs, [trainingSize, 1]);
    
    try {
      // Train the model
      await this.model.fit(xs, ys, {
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2,
        verbose: 0,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 20 === 0) {
              console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, mae = ${logs.mae.toFixed(4)}`);
            }
          }
        }
      });
      
      console.log('Model training completed');
      
    } catch (error) {
      console.error('Error training model:', error);
    } finally {
      // Clean up tensors
      xs.dispose();
      ys.dispose();
    }
  }

  generateTrainingData(size) {
    const inputs = [];
    const outputs = [];
    
    for (let i = 0; i < size; i++) {
      // Generate random responses (0-4 scale)
      const responses = [
        Math.floor(Math.random() * 5),
        Math.floor(Math.random() * 5),
        Math.floor(Math.random() * 5)
      ];
      
      // Generate random user context
      const ageGroup = Math.floor(Math.random() * 4); // 0-3 for different age groups
      const institutionType = Math.floor(Math.random() * 3); // 0-2 for different institutions
      const gender = Math.floor(Math.random() * 2); // 0-1 for binary encoding
      const previousTreatment = Math.floor(Math.random() * 2); // 0-1 for boolean
      
      // Create input vector
      const input = [
        ...responses,
        ageGroup / 3, // Normalize to 0-1
        institutionType / 2, // Normalize to 0-1
        gender,
        previousTreatment
      ];
      
      // Calculate synthetic risk score based on logical rules
      let riskScore = 0;
      
      // Base risk from responses
      const responseSum = responses.reduce((sum, r) => sum + r, 0);
      riskScore += responseSum / 12; // Normalize to 0-1
      
      // Age adjustments
      if (ageGroup === 0) riskScore += 0.1; // Adolescents
      if (ageGroup === 3) riskScore -= 0.05; // Older adults
      
      // Previous treatment history
      if (previousTreatment === 1) riskScore += 0.15;
      
      // Institution stress
      if (institutionType === 0) riskScore += 0.05; // University
      if (institutionType === 1) riskScore += 0.03; // Workplace
      
      // Add some noise for realism
      riskScore += (Math.random() - 0.5) * 0.1;
      
      // Ensure within bounds
      riskScore = Math.max(0, Math.min(1, riskScore));
      
      inputs.push(input);
      outputs.push(riskScore);
    }
    
    return { inputs, outputs };
  }

  async predict(responses, userContext) {
    try {
      if (!this.isModelReady) {
        throw new Error('TensorFlow.js model is not ready yet');
      }

      // Encode user context
      const encodedContext = this.encodeUserContext(userContext);
      
      // Create input tensor
      const inputData = [...responses, ...encodedContext];
      const inputTensor = tf.tensor2d([inputData]);
      
      // Get prediction from neural network
      const prediction = this.model.predict(inputTensor);
      const predictionData = await prediction.data();
      const riskScore = predictionData[0]; // Normalized 0-1 score
      
      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();
      
      // Convert to 0-100 scale
      const scaledScore = riskScore * 100;
      
      return {
        mlScore: Math.round(scaledScore * 100) / 100, // Round to 2 decimal places
        riskLevel: this.calculateRiskLevel(scaledScore),
        recommendations: this.generateRecommendations(scaledScore, userContext),
        confidence: this.calculateConfidence(responses, userContext),
        neuralNetworkScore: riskScore // Raw neural network output
      };
    } catch (error) {
      console.error('Error in TensorFlow.js prediction:', error);
      throw new Error('ML prediction failed: ' + error.message);
    }
  }

  encodeUserContext(userContext) {
    // Encode age group
    const ageGroupMap = {
      '13-17': 0,
      '18-25': 1,
      '26-40': 2,
      '41-65': 3,
      '65+': 4
    };
    const ageEncoded = (ageGroupMap[userContext.age_group] || 1) / 4;
    
    // Encode institution type
    const institutionMap = {
      'university': 0,
      'workplace': 1,
      'healthcare': 2,
      'other': 3
    };
    const institutionEncoded = (institutionMap[userContext.institution_type] || 3) / 3;
    
    // Encode gender (binary for simplicity)
    const genderEncoded = userContext.gender === 'female' ? 1 : 0;
    
    // Encode previous treatment
    const treatmentEncoded = userContext.previous_mental_health_treatment ? 1 : 0;
    
    return [ageEncoded, institutionEncoded, genderEncoded, treatmentEncoded];
  }

  // This method is now handled by the neural network, but kept for reference
  applyContextualAdjustments(baseScore, userContext) {
    // Neural network now handles contextual adjustments automatically
    // This method is kept for backward compatibility
    return baseScore;
  }

  calculateRiskLevel(score) {
    if (score <= 25) return 'low';
    if (score <= 50) return 'moderate';
    if (score <= 75) return 'high';
    return 'severe';
  }

  generateRecommendations(score, userContext) {
    const recommendations = [];
    
    if (score > 60) {
      recommendations.push('Consider speaking with a mental health professional');
      recommendations.push('Practice stress management techniques');
    }
    
    if (score > 40) {
      recommendations.push('Maintain regular sleep schedule');
      recommendations.push('Engage in regular physical activity');
    }
    
    if (userContext.age_group === '13-17') {
      recommendations.push('Talk to a trusted adult or counselor');
      recommendations.push('Consider peer support groups');
    }
    
    if (userContext.institution_type === 'university') {
      recommendations.push('Utilize campus counseling services');
      recommendations.push('Practice time management techniques');
    }
    
    if (score <= 30) {
      recommendations.push('Continue current coping strategies');
      recommendations.push('Maintain social connections');
    }
    
    return recommendations;
  }

  calculateConfidence(responses, userContext) {
    // Enhanced confidence calculation for neural network
    const responseVariance = this.calculateVariance(responses);
    const baseConfidence = 0.90; // Higher base confidence for neural network
    
    // Lower confidence for highly variable responses
    const variancePenalty = Math.min(responseVariance * 0.08, 0.15);
    
    // Boost confidence for complete user context
    const contextBonus = this.hasCompleteContext(userContext) ? 0.05 : 0;
    
    return Math.max(0.65, Math.min(0.95, baseConfidence - variancePenalty + contextBonus));
  }

  calculateVariance(arr) {
    const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    const squaredDiffs = arr.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  hasCompleteContext(userContext) {
    return userContext.age_group && 
           userContext.institution_type && 
           userContext.gender && 
           userContext.hasOwnProperty('previous_mental_health_treatment');
  }

  // Method to check if model is ready
  isReady() {
    return this.isModelReady;
  }

  // Method to get model summary
  getModelSummary() {
    if (this.model) {
      return {
        layers: this.model.layers.length,
        parameters: this.model.countParams(),
        inputShape: [7],
        outputShape: [1],
        architecture: 'Sequential Neural Network',
        framework: 'TensorFlow.js'
      };
    }
    return null;
  }
}

module.exports = CustomMLModel;
