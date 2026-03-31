require("dotenv").config();
const connectDB = require("./config/db");
const Event = require("./models/Events");

const cleanupAndUpdateEvents = async () => {
  try {
    await connectDB();
    
    // Delete all existing events to avoid duplicates
    await Event.deleteMany({});
    console.log("✅ Cleaned up all existing events");
    
    // Get Event Team user
    const User = require("./models/User");
    const Role = require("./models/Role");
    const eventTeamRole = await Role.findOne({ name: "EVENT_TEAM" });
    const eventTeamUser = await User.findOne({ role_id: eventTeamRole._id });

    const eventMappings = [
      { title: "SQL WAR", cover: "sql.jpg", tags: ["Database & SQL", "Programming & Coding"] },
      { title: "DEBUGGING WITH DSA", cover: "dsa.jpg", tags: ["Debugging & Logic", "DSA & Problem Solving", "Programming & Coding"] },
      { title: "TECHNICAL CONNECTIONS", cover: "technical.jpg", tags: ["Technical Quiz", "Programming & Coding"] },
      { title: "UI/UX DEVELOPMENT", cover: "uiux.jpg", tags: ["UI/UX Design", "Web Development", "Creative & Marketing"] },
      { title: "PITCH YOUR PROJECT CUM PRESENTATION", cover: "pitch.jpg", tags: ["Project & Presentation", "Communication & Voice", "Creative & Marketing"] },
      { title: "TREASURE HUNT", cover: "treasure.jpg", tags: ["Fun & Engagement", "Management & Strategy"] },
      { title: "ANIME / CINEMA QUIZ", cover: "quiz.jpg", tags: ["General Quiz", "Fun & Engagement"] },
      { title: "IPL AUCTION", cover: "ipl.jpg", tags: ["Management & Strategy", "Fun & Engagement"] },
      { title: "ADZAP", cover: "adzap.jpg", tags: ["Creative & Marketing", "Communication & Voice", "Fun & Engagement"] },
      { title: "PHOTOGRAPHY CONTEST", cover: "photo.jpg", tags: ["Photography & Media", "Creative & Marketing"] }
    ];

    const events = [
      {
        title: "SQL WAR",
        type: "Technical",
        description: "Show your skills in SQL. Test your database querying abilities and compete with fellow developers.",
        cover_photo: "uploads/events/sql.jpg",
        tags: ["Database & SQL", "Programming & Coding"],
        date: new Date("2026-02-15"),
        time: "10:00 AM",
        duration_hours: 2,
        expected_participants: 80,
        prize_pool: 15000,
        prize_pool_required: true
      },
      {
        title: "DEBUGGING WITH DSA",
        type: "Technical", 
        description: "Any masters of DSA? Challenge your debugging skills and data structure problem-solving abilities.",
        cover_photo: "uploads/events/dsa.jpg",
        tags: ["Debugging & Logic", "DSA & Problem Solving", "Programming & Coding"],
        date: new Date("2026-02-18"),
        time: "2:00 PM",
        duration_hours: 3,
        expected_participants: 100,
        prize_pool: 20000,
        prize_pool_required: true
      },
      {
        title: "TECHNICAL CONNECTIONS",
        type: "Technical",
        description: "Technical knowledge and concept linking test. Connect the dots between different programming concepts.",
        cover_photo: "uploads/events/technical.jpg",
        tags: ["Technical Quiz", "Programming & Coding"],
        date: new Date("2026-02-20"),
        time: "11:00 AM", 
        duration_hours: 1.5,
        expected_participants: 60,
        prize_pool: 10000,
        prize_pool_required: true
      },
      {
        title: "UI/UX DEVELOPMENT",
        type: "Technical",
        description: "Design thinking, UI creation, and creativity. Showcase your user interface and experience design skills.",
        cover_photo: "uploads/events/uiux.jpg",
        tags: ["UI/UX Design", "Web Development", "Creative & Marketing"],
        date: new Date("2026-02-22"),
        time: "9:00 AM",
        duration_hours: 4,
        expected_participants: 70,
        prize_pool: 25000,
        prize_pool_required: true
      },
      {
        title: "PITCH YOUR PROJECT CUM PRESENTATION",
        type: "Technical",
        description: "Any Future CEOs? Present your innovative projects and pitch your ideas to industry experts.",
        cover_photo: "uploads/events/pitch.jpg",
        tags: ["Project & Presentation", "Communication & Voice", "Creative & Marketing"],
        date: new Date("2026-02-25"),
        time: "3:00 PM",
        duration_hours: 3,
        expected_participants: 50,
        prize_pool: 30000,
        prize_pool_required: true
      },
      {
        title: "TREASURE HUNT",
        type: "Non-Technical",
        description: "Show off your teamwork, problem-solving, planning, and active participation in this exciting adventure.",
        cover_photo: "uploads/events/treasure.jpg",
        tags: ["Fun & Engagement", "Management & Strategy"],
        date: new Date("2026-02-28"),
        time: "1:00 PM",
        duration_hours: 2.5,
        expected_participants: 120,
        prize_pool: 12000,
        prize_pool_required: true
      },
      {
        title: "ANIME / CINEMA QUIZ",
        type: "Non-Technical",
        description: "Test your pop culture knowledge in an engaging and fun format. From anime to blockbuster movies!",
        cover_photo: "uploads/events/quiz.jpg",
        tags: ["General Quiz", "Fun & Engagement"],
        date: new Date("2026-03-02"),
        time: "4:00 PM",
        duration_hours: 1.5,
        expected_participants: 90,
        prize_pool: 8000,
        prize_pool_required: true
      },
      {
        title: "IPL AUCTION",
        type: "Non-Technical",
        description: "Display your strategic decision-making, budgeting, and team management skills in this cricket auction simulation.",
        cover_photo: "uploads/events/ipl.jpg",
        tags: ["Management & Strategy", "Fun & Engagement"],
        date: new Date("2026-03-05"),
        time: "6:00 PM",
        duration_hours: 2,
        expected_participants: 80,
        prize_pool: 15000,
        prize_pool_required: true
      },
      {
        title: "ADZAP",
        type: "Non-Technical",
        description: "Let's focus on creativity, persuasion, and presentation skills. Create compelling advertisements that captivate audiences.",
        cover_photo: "uploads/events/adzap.jpg",
        tags: ["Creative & Marketing", "Communication & Voice", "Fun & Engagement"],
        date: new Date("2026-03-08"),
        time: "10:30 AM",
        duration_hours: 2,
        expected_participants: 60,
        prize_pool: 12000,
        prize_pool_required: true
      },
      {
        title: "PHOTOGRAPHY CONTEST",
        type: "Non-Technical",
        description: "Are you a master in visual creativity and media skills? Capture the perfect moment and showcase your photography talent.",
        cover_photo: "uploads/events/photo.jpg",
        tags: ["Photography & Media", "Creative & Marketing"],
        date: new Date("2026-03-10"),
        time: "8:00 AM",
        duration_hours: 6,
        expected_participants: 40,
        prize_pool: 18000,
        prize_pool_required: true
      }
    ];

    // Create fresh events with proper cover photos
    for (const eventData of events) {
      const prizeDistribution = {
        first: Math.round(eventData.prize_pool * 0.5),
        second: Math.round(eventData.prize_pool * 0.3),
        third: Math.round(eventData.prize_pool * 0.2)
      };

      let requirements = {};
      if (eventData.type === "Technical") {
        requirements = {
          volunteers_needed: 5,
          rooms_needed: 2,
          refreshments_needed: true,
          stationary_needed: true,
          goodies_needed: true,
          physical_certificate: true,
          trophies_needed: true
        };
      } else {
        requirements = {
          volunteers_needed: 3,
          rooms_needed: 1,
          refreshments_needed: true,
          stationary_needed: true,
          goodies_needed: true,
          physical_certificate: true,
          trophies_needed: true
        };
      }

      await Event.create({
        ...eventData,
        prize_distribution: prizeDistribution,
        total_budget: eventData.prize_pool + 5000,
        requirements,
        status: "PUBLISHED",
        statusHistory: [
          {
            from: "DRAFT",
            to: "PUBLISHED",
            changedBy: "system",
            comment: "Auto-published by system seeding",
            timestamp: new Date()
          }
        ],
        created_by: eventTeamUser._id,
        treasurer_comments: "Budget approved - well planned event",
        gen_sec_comments: "Event details verified and approved",
        chairperson_comments: "Excellent event proposal - approved for publication"
      });

      console.log(`✅ Created: ${eventData.title} with cover: ${eventData.cover_photo}`);
    }

    console.log(`\n🎉 Successfully created ${events.length} events with cover photos!`);
    process.exit(0);
    
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  }
};

cleanupAndUpdateEvents();