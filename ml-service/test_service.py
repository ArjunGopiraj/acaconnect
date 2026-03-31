import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from model.knn_model import create_student_vector, recommend_events

print("=" * 50)
print("Testing ML Recommendation System")
print("=" * 50)

# Test with sample interests
test_interests = [
    "Programming_Coding",
    "Competitive_Coding",
    "DSA_Problem_Solving"
]

print(f"\nTest Interests: {test_interests}")
print("\nCreating student vector...")
student_vector = create_student_vector(test_interests)
print(f"Vector shape: {student_vector.shape}")
print(f"Non-zero elements: {sum(student_vector > 0)}")

print("\nGetting recommendations...")
recommendations = recommend_events(student_vector, top_k=5)

print(f"\nTop 5 Recommended Events:")
print("-" * 50)
for i, rec in enumerate(recommendations, 1):
    print(f"{i}. Event ID: {rec['event_id']}")
    print(f"   Similarity: {rec['similarity']:.4f}")
    print()

print("=" * 50)
print("✅ ML Service Test Complete!")
print("=" * 50)
