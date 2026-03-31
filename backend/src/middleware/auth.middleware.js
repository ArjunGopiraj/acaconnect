const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Participant = require("../models/Participant");

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's a participant
    if (decoded.role === 'PARTICIPANT') {
      const participant = await Participant.findById(decoded.id);
      if (!participant) {
        return res.status(401).json({ message: "User not found" });
      }
      
      req.user = {
        id: participant._id,
        name: participant.name,
        email: participant.email,
        role: 'PARTICIPANT'
      };
    } else {
      // Fetch user with populated role
      const user = await User.findById(decoded.id).populate('role_id', 'name');
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Set user info with role name
      req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role_id?.name
      };
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: "Invalid token" });
  }
};
