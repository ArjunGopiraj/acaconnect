require("dotenv").config();
const connectDB = require("./src/config/db");
const Registration = require("./src/models/Registration");
const Event = require("./src/models/Events");
const fs = require("fs");
const path = require("path");

const buildInteractionMatrix = async () => {
  try {
    await connectDB();
    
    console.log("\n" + "=".repeat(70));
    console.log("BUILDING INTERACTION MATRIX FROM REAL REGISTRATIONS");
    console.log("=".repeat(70));
    
    // Get all completed registrations
    const registrations = await Registration.find({ 
      payment_status: 'COMPLETED' 
    }).populate('event_id');
    
    console.log(`\n✓ Found ${registrations.length} completed registrations`);
    
    // Get all published events
    const events = await Event.find({ status: 'PUBLISHED' });
    console.log(`✓ Found ${events.length} published events`);
    
    // Build user-event interaction matrix
    const userEventMap = {};
    const eventTagsMap = {};
    
    registrations.forEach(reg => {
      if (!reg.event_id) return;
      
      const userEmail = reg.participant_email;
      const eventId = reg.event_id._id.toString();
      const eventTitle = reg.event_id.title;
      const eventTags = reg.event_id.tags || [];
      
      if (!userEventMap[userEmail]) {
        userEventMap[userEmail] = [];
      }
      
      userEventMap[userEmail].push({
        eventId,
        eventTitle,
        tags: eventTags
      });
      
      eventTagsMap[eventId] = {
        title: eventTitle,
        tags: eventTags
      };
    });
    
    console.log(`\n✓ Built interaction matrix for ${Object.keys(userEventMap).length} users`);
    
    // Analyze patterns
    console.log("\n" + "-".repeat(70));
    console.log("USER REGISTRATION PATTERNS:");
    console.log("-".repeat(70));
    
    Object.entries(userEventMap).forEach(([email, events]) => {
      console.log(`\n${email}:`);
      events.forEach(event => {
        console.log(`  - ${event.eventTitle} (${event.tags.join(', ')})`);
      });
    });
    
    // Find collaborative patterns
    console.log("\n" + "-".repeat(70));
    console.log("COLLABORATIVE FILTERING PATTERNS:");
    console.log("-".repeat(70));
    
    const eventCoOccurrence = {};
    
    Object.values(userEventMap).forEach(userEvents => {
      for (let i = 0; i < userEvents.length; i++) {
        for (let j = i + 1; j < userEvents.length; j++) {
          const event1 = userEvents[i].eventTitle;
          const event2 = userEvents[j].eventTitle;
          
          const key = [event1, event2].sort().join(' + ');
          eventCoOccurrence[key] = (eventCoOccurrence[key] || 0) + 1;
        }
      }
    });
    
    console.log("\nUsers who registered for X also registered for Y:");
    Object.entries(eventCoOccurrence)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([pair, count]) => {
        console.log(`  ${pair}: ${count} users`);
      });
    
    // Export interaction matrix for ML service
    const interactionData = {
      users: Object.keys(userEventMap),
      events: events.map(e => ({
        id: e._id.toString(),
        title: e.title,
        tags: e.tags || []
      })),
      interactions: Object.entries(userEventMap).map(([email, userEvents]) => ({
        user: email,
        events: userEvents.map(e => e.eventId)
      })),
      coOccurrence: eventCoOccurrence,
      generatedAt: new Date().toISOString()
    };
    
    const outputPath = path.join(__dirname, '../ml-service/data/interaction_matrix.json');
    fs.writeFileSync(outputPath, JSON.stringify(interactionData, null, 2));
    
    console.log("\n" + "=".repeat(70));
    console.log(`✓ Interaction matrix exported to: ${outputPath}`);
    console.log(`✓ ${Object.keys(userEventMap).length} users`);
    console.log(`✓ ${events.length} events`);
    console.log(`✓ ${registrations.length} interactions`);
    console.log("=".repeat(70));
    
    console.log("\n🎯 NEXT STEPS:");
    console.log("1. Restart ML service to load new interaction matrix");
    console.log("2. CF will now use REAL registration data");
    console.log("3. Test recommendations with Hybrid KNN+CF method");
    console.log("4. You should see CF scores > 0% now!");
    
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

buildInteractionMatrix();
