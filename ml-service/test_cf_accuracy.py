import sys
import os

# Suppress CF debug output
class SuppressOutput:
    def __enter__(self):
        self._original_stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stdout = self._original_stdout

sys.path.insert(0, os.path.dirname(__file__))

from model.cf_model import item_based_cf, load_real_interactions
import numpy as np

def calculate_cf_accuracy(sample_size=50):
    """
    Calculate CF accuracy by testing if recommendations match user's actual registrations
    """
    data = load_real_interactions()
    events_pool = data['events']
    interactions = data['interactions']
    
    print(f"Evaluating CF recommendation accuracy on {len(interactions)} users...\n")
    
    correct_predictions = 0
    total_predictions = 0
    relevance_scores = []
    
    for idx, interaction in enumerate(interactions):
        user_events = interaction['events']
        
        if len(user_events) < 2:
            continue
        
        # Get user interests from their registered events
        user_interests = set()
        for event_id in user_events:
            event = next((e for e in events_pool if e['id'] == event_id), None)
            if event:
                user_interests.update(event.get('tags', []))
        
        user_interests = list(user_interests)
        
        if not user_interests:
            continue
        
        try:
            # Get CF recommendations (suppress debug output)
            with SuppressOutput():
                recommendations = item_based_cf(user_interests, events_pool, top_k=5)
            
            recommended_ids = [r['event_id'] for r in recommendations]
            
            # Check if any recommendation matches user's actual registrations
            matches = sum(1 for rec_id in recommended_ids if rec_id in user_events)
            
            if matches > 0:
                correct_predictions += 1
            
            # Calculate relevance (how many recommendations match user interests)
            relevance = matches / len(recommended_ids) if recommended_ids else 0
            relevance_scores.append(relevance)
            
            total_predictions += 1
            
            if idx % 5 == 0:
                print(f"Processed {idx}/{len(interactions)} users")
        
        except Exception as e:
            print(f"Error processing user {idx}: {e}")
            continue
    
    accuracy = (correct_predictions / total_predictions * 100) if total_predictions > 0 else 0
    avg_relevance = (np.mean(relevance_scores) * 100) if relevance_scores else 0
    
    return accuracy, avg_relevance, correct_predictions, total_predictions

if __name__ == "__main__":
    print("="*60)
    print("COLLABORATIVE FILTERING ACCURACY TEST")
    print("="*60)
    
    accuracy, relevance, correct, total = calculate_cf_accuracy()
    
    print(f"\n{'='*60}")
    print("RESULTS:")
    print(f"{'='*60}")
    print(f"CF Accuracy (Hit Rate):        {accuracy:.2f}%")
    print(f"Average Relevance:             {relevance:.2f}%")
    print(f"Correct Predictions:           {correct}/{total}")
    print(f"{'='*60}\n")
    
    print("Interpretation:")
    print(f"- {accuracy:.2f}% of users received at least 1 relevant recommendation")
    print(f"- On average, {relevance:.2f}% of recommendations matched user interests")
