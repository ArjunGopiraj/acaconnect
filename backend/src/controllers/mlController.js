const axios = require('axios');
const Event = require('../models/Events');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';


const getPublishedEvents = async () => {
  return await Event.find({ status: 'PUBLISHED' }).lean();
};


const formatEventsForML = (events) => {
  return events.map(event => ({
    id: event._id.toString(),
    title: event.title,  
    tags: event.tags || []
  }));
};


const mapRecommendationsToEvents = (recommendations, events) => {
  return recommendations.map(rec => {
    const event = events.find(e => e._id.toString() === rec.event_id);
    return event ? {
      ...event,
      similarity: rec.similarity,
      user_similarity: rec.user_similarity,
      pattern_similarity: rec.pattern_similarity,
      knn_score: rec.knn_score,
      cf_score: rec.cf_score
    } : null;
  }).filter(Boolean);
};

exports.getKNNRecommendations = async (req, res) => {
  try {
    const { interests, k = 5 } = req.body;
    
    if (!interests || interests.length === 0) {
      return res.status(400).json({ message: 'No interests provided' });
    }
    
    const publishedEvents = await getPublishedEvents();
    if (publishedEvents.length === 0) {
      return res.json({ success: true, recommendations: [], count: 0 });
    }
    
    const eventsForML = formatEventsForML(publishedEvents);
    
    const response = await axios.post(`${ML_SERVICE_URL}/recommend-knn`, {
      interests,
      events: eventsForML,
      k
    });
    
    if (response.data.success) {
      const recommendations = mapRecommendationsToEvents(response.data.recommendations, publishedEvents);
      return res.json({
        success: true,
        recommendations,
        count: recommendations.length,
        method: 'knn'
      });
    }
    
    throw new Error('KNN service failed');
  } catch (error) {
    console.error('KNN recommendation error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCFRecommendations = async (req, res) => {
  try {
    const { interests, method = 'item', k = 5 } = req.body;
    
    if (!interests || interests.length === 0) {
      return res.status(400).json({ message: 'No interests provided' });
    }
    
    const publishedEvents = await getPublishedEvents();
    if (publishedEvents.length === 0) {
      return res.json({ success: true, recommendations: [], count: 0 });
    }
    
    const eventsForML = formatEventsForML(publishedEvents);
    
    const response = await axios.post(`${ML_SERVICE_URL}/recommend-cf`, {
      interests,
      events: eventsForML,
      method,
      k
    });
    
    if (response.data.success) {
      const recommendations = mapRecommendationsToEvents(response.data.recommendations, publishedEvents);
      return res.json({
        success: true,
        recommendations,
        count: recommendations.length,
        method: 'collaborative_filtering'
      });
    }
    
    throw new Error('CF service failed');
  } catch (error) {
    console.error('CF recommendation error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getHybridCFRecommendations = async (req, res) => {
  try {
    const { interests, k = 5, knn_weight = 0.6, cf_weight = 0.4 } = req.body;
    
    if (!interests || interests.length === 0) {
      return res.status(400).json({ message: 'No interests provided' });
    }
    
    const publishedEvents = await getPublishedEvents();
    if (publishedEvents.length === 0) {
      return res.json({ success: true, recommendations: [], count: 0 });
    }
    
    const eventsForML = formatEventsForML(publishedEvents);
    
    const response = await axios.post(`${ML_SERVICE_URL}/recommend-hybrid-cf`, {
      interests,
      events: eventsForML,
      k,
      knn_weight,
      cf_weight
    });
    
    if (response.data.success) {
      const recommendations = mapRecommendationsToEvents(response.data.recommendations, publishedEvents);
      return res.json({
        success: true,
        recommendations,
        count: recommendations.length,
        method: 'hybrid_knn_cf',
        weights: { knn: knn_weight, cf: cf_weight }
      });
    }
    
    throw new Error('Hybrid CF service failed');
  } catch (error) {
    console.error('Hybrid CF recommendation error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.predictBudget = async (req, res) => {
  try {
    const { event_type, expected_participants, duration_hours, prize_pool, requirements } = req.body;

    const payload = {
      event_type: event_type || 'Technical',
      expected_participants: expected_participants || 50,
      duration_hours: duration_hours || 2,
      prize_pool: prize_pool || 0,
      refreshments_needed: requirements?.refreshments_needed || false,
      stationary_needed: requirements?.stationary_needed || false,
      goodies_needed: requirements?.goodies_needed || false,
      physical_certificate: requirements?.physical_certificate || false,
      trophies_needed: requirements?.trophies_needed || false,
      volunteers_needed: requirements?.volunteers_needed || 0,
      rooms_needed: requirements?.rooms_needed || 0,
      refreshment_item_count: requirements?.refreshment_items?.length || 0,
      stationery_item_count: requirements?.stationary_items?.length || 0
    };

    const response = await axios.post(`${ML_SERVICE_URL}/predict-budget`, payload);

    if (response.data.success) {
      return res.json(response.data);
    }
    throw new Error('Budget prediction failed');
  } catch (error) {
    console.error('Budget prediction error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { interests } = req.body;
    
    if (!interests || interests.length === 0) {
      return res.status(400).json({ message: 'No interests provided' });
    }
    
    
    const publishedEvents = await Event.find({ 
      status: 'PUBLISHED'
    }).lean();
    
    if (publishedEvents.length === 0) {
      return res.json({
        success: true,
        events: [],
        count: 0,
        message: 'No published events available'
      });
    }
    
    
    try {
      
      const eventsForKNN = publishedEvents.map(event => ({
        id: event._id.toString(),
        title: event.title,  // Add title for CF
        tags: event.tags || []
      }));
      
      
      const knnResponse = await axios.post(`${ML_SERVICE_URL}/recommend-knn`, {
        interests: interests,
        events: eventsForKNN,
        k: 5  
      });
      
      if (knnResponse.data.success) {
        
        const recommendations = knnResponse.data.recommendations.map(rec => {
          const event = publishedEvents.find(e => e._id.toString() === rec.event_id);
          return {
            ...event,
            similarity: rec.similarity,
            matchingTags: event.tags.filter(tag => interests.includes(tag)),
            ml_powered: true
          };
        }).filter(e => e._id); 
        
        return res.json({
          success: true,
          events: recommendations,
          count: recommendations.length,
          ml_powered: true,
          knn_used: true,
          message: `AI found ${recommendations.length} events using KNN (k-nearest neighbors)`
        });
      }
    } catch (mlError) {
      console.log('KNN service error:', mlError.message);
    }
    
    // Fallback to ML scoring
    try {
      const eventsWithScores = await Promise.all(
        publishedEvents.map(async (event) => {
          if (!event.tags || event.tags.length === 0) {
            return { ...event, similarity: 0, matchingTags: [], ml_powered: false };
          }
          
          try {
            
            const scoreResponse = await axios.post(`${ML_SERVICE_URL}/score-event`, {
              interests: interests,
              event_tags: event.tags
            });
            
            if (scoreResponse.data.success) {
              const matchingTags = event.tags.filter(tag => interests.includes(tag));
              return {
                ...event,
                similarity: scoreResponse.data.similarity,
                matchingTags: matchingTags,
                ml_powered: true
              };
            }
          } catch (error) {
            console.log(`ML scoring failed for event ${event._id}:`, error.message);
          }
          
         
          const matchingTags = event.tags.filter(tag => interests.includes(tag));
          const similarity = matchingTags.length / interests.length;
          return {
            ...event,
            similarity: similarity,
            matchingTags: matchingTags,
            ml_powered: false
          };
        })
      );
      
      
      eventsWithScores.sort((a, b) => b.similarity - a.similarity);
      
      
      const recommendedEvents = eventsWithScores.filter(e => e.similarity >= 0.1);
      
      const mlPowered = recommendedEvents.some(e => e.ml_powered);
      
      return res.json({
        success: true,
        events: recommendedEvents,
        count: recommendedEvents.length,
        ml_powered: mlPowered,
        message: mlPowered 
          ? `AI found ${recommendedEvents.length} events matching your interests`
          : `Found ${recommendedEvents.length} events (ML service unavailable)`
      });
      
    } catch (mlError) {
      console.log('ML service error:', mlError.message);
      
      
      const matchedEvents = publishedEvents.filter(event => {
        if (!event.tags || event.tags.length === 0) return false;
        return event.tags.some(tag => interests.includes(tag));
      });
      
      const eventsWithScores = matchedEvents.map(event => {
        const matchingTags = event.tags.filter(tag => interests.includes(tag));
        const similarity = matchingTags.length / interests.length;
        
        return {
          ...event,
          similarity: similarity,
          matchingTags: matchingTags
        };
      });
      
      eventsWithScores.sort((a, b) => b.similarity - a.similarity);
      
      res.json({
        success: true,
        events: eventsWithScores,
        count: eventsWithScores.length,
        fallback: true,
        message: `Found ${eventsWithScores.length} events (using local search)`
      });
    }
    
  } catch (error) {
    console.error('Recommendation error:', error.message);
    res.status(500).json({ 
      message: 'Recommendation failed',
      error: error.message 
    });
  }
};
