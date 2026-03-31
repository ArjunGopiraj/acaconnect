const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Technical', 'Non-Technical', 'Hackathon', 'Seminar', 'Workshop']
  },
  description: {
    type: String,
    required: true
  },
  cover_photo: {
    type: String, // File path or URL
    default: null
  },
  tags: [{
    type: String,
    enum: [
      // Technical Domains
      'Programming & Coding',
      'Competitive Coding',
      'Database & SQL',
      'DSA & Problem Solving',
      'Debugging & Logic',
      'Cyber Security',
      'Web Development',
      'UI/UX Design',
      'Project & Presentation',
      'Technical Quiz',
      // Non-Technical Domains
      'General Quiz',
      'Management & Strategy',
      'Creative & Marketing',
      'Photography & Media',
      'Fun & Engagement',
      'Communication & Voice'
    ]
  }],
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration_hours: {
    type: Number,
    required: true
  },
  venue: String,
  expected_participants: {
    type: Number,
    required: true
  },
  prize_pool: {
    type: Number,
    default: 0
  },
  registration_fee: {
    type: Number,
    default: 0,
    min: 0
  },
  registration_fee_required: {
    type: Boolean,
    default: false
  },
  prize_pool_required: {
    type: Boolean,
    default: false
  },
  total_budget: {
    type: Number,
    default: 0
  },
  prize_distribution: {
    first: Number,
    second: Number,
    third: Number
  },
  requirements: {
    volunteers_needed: {
      type: Number,
      default: 0
    },
    rooms_needed: {
      type: Number,
      default: 0
    },
    refreshments_needed: {
      type: Boolean,
      default: false
    },
    refreshment_items: [{
      item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RefreshmentItem"
      },
      item_name: String,
      quantity: {
        type: Number,
        default: 1
      }
    }],
    stationary_needed: {
      type: Boolean,
      default: false
    },
    stationary_items: [{
      item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stationery"
      },
      item_name: String,
      quantity: {
        type: Number,
        default: 1
      }
    }],
    technical_needed: {
      type: Boolean,
      default: false
    },
    technical_items: [{
      item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TechnicalItem"
      },
      item_name: String,
      quantity: {
        type: Number,
        default: 1
      }
    }],
    goodies_needed: {
      type: Boolean,
      default: false
    },
    physical_certificate: {
      type: Boolean,
      default: false
    },
    trophies_needed: {
      type: Boolean,
      default: false
    }
  },
  registration_status: {
    type: String,
    enum: ['OPEN', 'CLOSED', 'PAUSED'],
    default: 'OPEN'
  },
  event_finished: {
    type: Boolean,
    default: false
  },
  finished_at: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    default: "DRAFT"
  },
  statusHistory: [{
    from: String,
    to: String,
    changedBy: String,
    comment: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  treasurer_comments: String,
  gen_sec_comments: String,
  chairperson_comments: String,
  logistics: {
    requirements_acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledged_at: Date,
    acknowledged_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    total_expense: {
      type: Number,
      default: 0
    },
    expense_submitted: {
      type: Boolean,
      default: false
    },
    expense_submitted_at: Date,
    bill_attachment: String,
    expense_breakdown: {
      refreshments: { type: Number, default: 0 },
      stationery: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
      certificates: { type: Number, default: 0 },
      goodies: { type: Number, default: 0 },
      trophies: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    gst_number: {
      type: String,
      default: ''
    },
    gst_verified: {
      type: Boolean,
      default: false
    },
    no_gst_reason: {
      type: String,
      default: ''
    }
  },
  hospitality: {
    requirements_acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledged_at: Date,
    acknowledged_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    allocated_rooms: [{
      room_number: String,
      room_name: String
    }],
    lab_allocated: {
      type: String,
      default: null
    },
    venue_details: {
      type: String,
      default: null
    },
    venue_allocated: {
      type: Boolean,
      default: false
    },
    venue_allocated_at: Date
  },
  hr: {
    requirements_acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledged_at: Date,
    acknowledged_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    allocated_volunteers: [{
      volunteer_name: String,
      volunteer_contact: String,
      volunteer_role: String,
      volunteer_department: String
    }],
    allocated_judges: [{
      judge_name: String,
      judge_contact: String,
      judge_expertise: String,
      judge_designation: String
    }],
    volunteers_allocated: {
      type: Boolean,
      default: false
    },
    volunteers_allocated_at: Date
  },
  scheduling: {
    priority_score: {
      type: Number,
      default: 0
    },
    suggested_venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue'
    },
    assigned_venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue'
    },
    conflicts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }],
    is_auto_assigned: {
      type: Boolean,
      default: false
    },
    override_reason: String,
    assigned_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assigned_at: Date,
    hospitality_approved: {
      type: Boolean,
      default: false
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
