require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./src/models/Events');
const RefreshmentItem = require('./src/models/RefreshmentItem');

async function updateEventsWithRefreshments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const refreshmentItems = await RefreshmentItem.find({ isActive: true });
    console.log(`Found ${refreshmentItems.length} refreshment items`);

    const events = await Event.find({});
    console.log(`Found ${events.length} events to update`);

    for (let event of events) {
      const updates = {};
      
      // Add refreshment items for events that need refreshments
      if (event.requirements?.refreshments_needed) {
        const selectedRefreshments = [];
        
        // Common refreshment items for all events
        const commonItems = ['Water bottles', 'Tea', 'Coffee', 'Biscuits'];
        
        // Event-specific items based on duration and type
        let specificItems = [];
        
        if (event.duration_hours >= 4) {
          // Long events need more substantial refreshments
          specificItems = ['Samosa / Puff / Cutlet', 'Fruit plates', 'Juice packets'];
        } else if (event.duration_hours >= 2) {
          // Medium duration events
          specificItems = ['Chips', 'Banana / Apple / Orange'];
        } else {
          // Short events - just basic items
          specificItems = ['Packed snacks'];
        }
        
        // Special events get cake
        if (event.prize_pool > 15000 || event.expected_participants > 80) {
          specificItems.push('Cake');
        }
        
        // Add disposables for all events
        const disposables = ['Paper cups', 'Plates', 'Tissues / Napkins'];
        
        const allNeededItems = [...commonItems, ...specificItems, ...disposables];
        
        for (let itemName of allNeededItems) {
          const refreshmentItem = refreshmentItems.find(r => r.name === itemName);
          if (refreshmentItem) {
            let quantity = 1;
            
            // Set quantities based on item type and event size
            const participants = event.expected_participants;
            
            if (itemName === 'Water bottles') {
              quantity = participants + Math.ceil(participants * 0.2); // 20% extra
            } else if (itemName === 'Tea' || itemName === 'Coffee') {
              quantity = Math.ceil(participants * 0.6); // 60% of participants
            } else if (itemName === 'Biscuits') {
              quantity = Math.ceil(participants / 10); // 1 packet per 10 people
            } else if (itemName === 'Samosa / Puff / Cutlet') {
              quantity = Math.ceil(participants * 1.2); // 1.2 per person
            } else if (itemName === 'Chips' || itemName === 'Packed snacks') {
              quantity = Math.ceil(participants / 8); // 1 packet per 8 people
            } else if (itemName === 'Cake') {
              quantity = Math.ceil(participants / 20); // 1 cake per 20 people
            } else if (itemName === 'Fruit plates') {
              quantity = Math.ceil(participants / 4); // 1 plate per 4 people
            } else if (itemName === 'Banana / Apple / Orange') {
              quantity = Math.ceil(participants * 0.8); // 0.8 per person
            } else if (itemName === 'Juice packets') {
              quantity = Math.ceil(participants / 2); // 1 packet per 2 people
            } else if (itemName === 'Paper cups') {
              quantity = participants + 20; // Extra cups
            } else if (itemName === 'Plates') {
              quantity = Math.ceil(participants / 2); // 1 plate per 2 people
            } else if (itemName === 'Tissues / Napkins') {
              quantity = Math.ceil(participants / 15); // 1 packet per 15 people
            }
            
            selectedRefreshments.push({
              item_id: refreshmentItem._id,
              item_name: refreshmentItem.name,
              quantity: quantity
            });
          }
        }
        
        updates['requirements.refreshment_items'] = selectedRefreshments;
      } else {
        // Ensure refreshment_items is empty array for events that don't need refreshments
        updates['requirements.refreshment_items'] = [];
      }

      // Update the event
      if (Object.keys(updates).length > 0) {
        await Event.findByIdAndUpdate(event._id, updates);
        console.log(`Updated ${event.title}:`);
        
        if (updates['requirements.refreshment_items'] && updates['requirements.refreshment_items'].length > 0) {
          console.log(`  - Refreshment Items: ${updates['requirements.refreshment_items'].length} items`);
          updates['requirements.refreshment_items'].forEach(item => {
            console.log(`    * ${item.item_name}: ${item.quantity}`);
          });
        } else {
          console.log(`  - No refreshments needed`);
        }
        
        console.log('---');
      }
    }

    console.log('All events updated with refreshment items and quantities!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating events:', error);
    process.exit(1);
  }
}

updateEventsWithRefreshments();