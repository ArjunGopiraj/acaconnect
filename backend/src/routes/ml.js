const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');
const auth = require('../middleware/auth.middleware');


router.post('/recommend', auth, mlController.getRecommendations);
router.post('/recommend-knn', auth, mlController.getKNNRecommendations);
router.post('/recommend-cf', auth, mlController.getCFRecommendations);
router.post('/recommend-hybrid-cf', auth, mlController.getHybridCFRecommendations);

module.exports = router;
