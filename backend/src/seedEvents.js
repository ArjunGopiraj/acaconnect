require("dotenv").config();
const connectDB = require("./config/db");
const Event = require("./models/Events");
const User = require("./models/User");
const Role = require("./models/Role");
const path = require("path");
const fs = require("fs");

const seedEvents = async () => {
  try {
    await connectDB();
    
    // Get Event Team user
    const eventTeamRole = await Role.findOne({ name: "EVENT_TEAM" });
    const eventTeamUser = await User.findOne({ role_id: eventTeamRole._id });
    
    if (!eventTeamUser) {
      console.error("Event Team user not found. Please run seedUsers.js first.");
      process.exit(1);
    }

    // Copy cover images to uploads/events directory
    const sourceDir = path.join(__dirname, "../../../frontend/coverimages");
    const targetDir = path.join(__dirname, "../uploads/events");
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const copyImage = (filename) => {
      const sourcePath = path.join(sourceDir, filename);
      const targetPath = path.join(targetDir, filename);
      if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied ${filename} to uploads/events/`);
      }
      return `uploads/events/${filename}`;
    };

    const events = [
      {
        title: "SQL WAR",
        type: "Technical",
        description: "Show your skills in SQL. Test your database querying abilities and compete with fellow developers.",
        cover_photo: copyImage("sql.jpg"),
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
        cover_photo: copyImage("dsa.jpg"),
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
        cover_photo: copyImage("technical.jpg"),
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
        cover_photo: copyImage("uiux.jpg"),
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
        cover_photo: copyImage("pitch.jpg"),
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
        cover_photo: copyImage("treasure.jpg"),
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
        cover_photo: copyImage("quiz.jpg"),
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
        cover_photo: copyImage("ipl.jpg"),
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
        cover_photo: copyImage("adzap.jpg"),
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
        cover_photo: copyImage("photo.jpg"),
        tags: ["Photography & Media", "Creative & Marketing"],
        date: new Date("2026-03-10"),
        time: "8:00 AM",
        duration_hours: 6,
        expected_participants: 40,
        prize_pool: 18000,
        prize_pool_required: true
      }
    ];

    // Create events with full workflow completion
    for (const eventData of events) {
      // Calculate prize distribution (50-30-20)
      const prizeDistribution = {
        first: Math.round(eventData.prize_pool * 0.5),
        second: Math.round(eventData.prize_pool * 0.3),
        third: Math.round(eventData.prize_pool * 0.2)
      };

      // Set requirements based on event type
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

      const event = await Event.create({
        ...eventData,
        prize_distribution: prizeDistribution,
        total_budget: eventData.prize_pool + 5000, // Add operational costs
        requirements,
        status: "PUBLISHED",
        statusHistory: [
          {
            from: "DRAFT",
            to: "SUBMITTED",
            changedBy: eventTeamUser._id.toString(),
            comment: "Event submitted for approval",
            timestamp: new Date()
          },
          {
            from: "SUBMITTED", 
            to: "TREASURER_APPROVED",
            changedBy: "system",
            comment: "Auto-approved by system seeding",
            timestamp: new Date()
          },
          {
            from: "TREASURER_APPROVED",
            to: "GENSEC_APPROVED", 
            changedBy: "system",
            comment: "Auto-approved by system seeding",
            timestamp: new Date()
          },
          {
            from: "GENSEC_APPROVED",
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

      console.log(`✅ Created and published event: ${event.title}`);
    }

    console.log(`\n🎉 Successfully created and published ${events.length} events!`);
    console.log("\nAll events are now visible on the published events pages.");
    process.exit(0);
    
  } catch (error) {
    console.error("Event seeding failed:", error);
    process.exit(1);
  }
};

seedEvents();