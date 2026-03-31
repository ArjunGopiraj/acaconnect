require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./src/models/Events');
const Stationery = require('./src/models/Stationery');
const TechnicalItem = require('./src/models/TechnicalItem');

async function updateEventsWithItems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all items from database
    const stationeryItems = await Stationery.find({ isActive: true });
    const technicalItems = await TechnicalItem.find({ isActive: true });
    
    console.log(`Found ${stationeryItems.length} stationery items and ${technicalItems.length} technical items`);

    const events = await Event.find({});
    console.log(`Found ${events.length} events to update`);

    for (let event of events) {
      const updates = {};
      
      // Add stationery items for events that need stationery
      if (event.requirements?.stationary_needed) {
        const selectedStationery = [];
        
        // Common items for all events
        const commonItems = ['A4 sheets', 'Pens', 'Attendance sheets', 'Name slips / ID labels'];
        
        // Event-specific items based on type and tags
        let specificItems = [];
        
        if (event.type === 'Technical') {
          if (event.tags?.includes('Programming & Coding')) {
            specificItems = ['Chart papers', 'Sticky notes', 'Whiteboard markers', 'Clipboards'];
          } else if (event.tags?.includes('UI/UX Design')) {
            specificItems = ['Chart papers', 'Sketch pens', 'Permanent markers', 'Folders / Files'];
          } else if (event.tags?.includes('Project & Presentation')) {
            specificItems = ['Chart papers', 'Permanent markers', 'Folders / Files', 'Clipboards'];
          } else {
            specificItems = ['Chart papers', 'Whiteboard markers', 'Sticky notes'];
          }
        } else if (event.type === 'Non-Technical') {
          if (event.tags?.includes('Creative & Marketing')) {
            specificItems = ['Chart papers', 'Sketch pens', 'Permanent markers', 'Glue sticks'];
          } else {
            specificItems = ['Chart papers', 'Pens', 'Sticky notes'];
          }
        } else {
          specificItems = ['Chart papers', 'Pens', 'Folders / Files'];
        }

        // Combine and add items with quantities
        const allNeededItems = [...commonItems, ...specificItems];
        
        for (let itemName of allNeededItems) {
          const stationeryItem = stationeryItems.find(s => s.name === itemName);
          if (stationeryItem) {
            let quantity = 1;
            
            // Set quantities based on item type and event size
            if (itemName === 'A4 sheets') {
              quantity = Math.ceil(event.expected_participants / 2);
            } else if (itemName === 'Pens') {
              quantity = Math.ceil(event.expected_participants / 3);
            } else if (itemName === 'Attendance sheets') {
              quantity = Math.ceil(event.expected_participants / 50) + 1;
            } else if (itemName === 'Name slips / ID labels') {
              quantity = event.expected_participants + 10;
            } else if (itemName === 'Chart papers') {
              quantity = 10;
            } else if (itemName === 'Sticky notes') {
              quantity = 5;
            } else if (itemName === 'Whiteboard markers' || itemName === 'Permanent markers') {
              quantity = 6;
            } else if (itemName === 'Sketch pens') {
              quantity = 3;
            } else {
              quantity = Math.max(1, Math.ceil(event.expected_participants / 20));
            }
            
            selectedStationery.push({
              item_id: stationeryItem._id,
              item_name: stationeryItem.name,
              quantity: quantity
            });
          }
        }
        
        updates['requirements.stationary_items'] = selectedStationery;
      }

      // Add technical items for events that need them
      const needsTechnical = event.type === 'Technical' || event.type === 'Seminar' || event.type === 'Workshop' || 
                           event.tags?.includes('Project & Presentation');
      
      if (needsTechnical) {
        updates['requirements.technical_needed'] = true;
        
        const selectedTechnical = [];
        
        // Common technical items for most events
        const commonTechItems = ['Projector', 'Speakers', 'HDMI / VGA cables', 'Extension boards'];
        
        // Event-specific technical items
        let specificTechItems = [];
        
        if (event.expected_participants > 50) {
          specificTechItems = ['2 Cordless Microphones', 'Power backup (UPS / Inverter)'];
        } else {
          specificTechItems = ['2 Cordless Microphones'];
        }
        
        if (event.tags?.includes('Programming & Coding') || event.tags?.includes('UI/UX Design')) {
          specificTechItems.push('Laptop');
        }
        
        const allTechItems = [...commonTechItems, ...specificTechItems];
        
        for (let itemName of allTechItems) {
          const techItem = technicalItems.find(t => t.name === itemName);
          if (techItem) {
            let quantity = 1;
            
            // Set quantities based on item type and event needs
            if (itemName === 'Extension boards') {
              quantity = Math.ceil(event.expected_participants / 30);
            } else if (itemName === 'HDMI / VGA cables') {
              quantity = 2;
            } else if (itemName === 'Laptop' && event.expected_participants > 30) {
              quantity = 2;
            }
            
            selectedTechnical.push({
              item_id: techItem._id,
              item_name: techItem.name,
              quantity: quantity
            });
          }
        }
        
        updates['requirements.technical_items'] = selectedTechnical;
      } else {
        updates['requirements.technical_needed'] = false;
        updates['requirements.technical_items'] = [];
      }

      // Update the event
      if (Object.keys(updates).length > 0) {
        await Event.findByIdAndUpdate(event._id, updates);
        console.log(`Updated ${event.title}:`);
        
        if (updates['requirements.stationary_items']) {
          console.log(`  - Stationery Items: ${updates['requirements.stationary_items'].length} items`);
          updates['requirements.stationary_items'].forEach(item => {
            console.log(`    * ${item.item_name}: ${item.quantity}`);
          });
        }
        
        if (updates['requirements.technical_items']) {
          console.log(`  - Technical Items: ${updates['requirements.technical_items'].length} items`);
          updates['requirements.technical_items'].forEach(item => {
            console.log(`    * ${item.item_name}: ${item.quantity}`);
          });
        }
        
        console.log('---');
      }
    }

    console.log('All events updated with proper items and quantities!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating events:', error);
    process.exit(1);
  }
}

updateEventsWithItems();