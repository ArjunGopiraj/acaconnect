const jwt = require('jsonwebtoken');
const Participant = require('../models/Participant');

const participantAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is a participant
    if (decoded.role !== 'PARTICIPANT') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Participants only.'
      });
    }

    const participant = await Participant.findById(decoded.id);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    req.user = {
      id: participant._id,
      name: participant.name,
      email: participant.email,
      role: 'PARTICIPANT'
    };

    next();
  } catch (error) {
    console.error('Participant auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

module.exports = participantAuthMiddleware;