"""
Generate synthetic budget prediction dataset for NIRAL college events.
Based on real event schema from ACA Connect MongoDB models.
"""
import pandas as pd
import numpy as np
import random

random.seed(42)
np.random.seed(42)

# Real NIRAL event types and tags
EVENT_TYPES = ['Technical', 'Non-Technical']
TAGS = [
    'Programming & Coding', 'Competitive Coding', 'Database & SQL',
    'DSA & Problem Solving', 'Debugging & Logic', 'Cyber Security',
    'Web Development', 'UI/UX Design', 'Project & Presentation',
    'Technical Quiz', 'General Quiz', 'Management & Strategy',
    'Creative & Marketing', 'Photography & Media', 'Fun & Engagement',
    'Communication & Voice'
]

# Real NIRAL-like event templates with realistic cost patterns
EVENT_TEMPLATES = [
    {"name": "Hackathon", "type": "Technical", "tags": ["Programming & Coding", "Competitive Coding", "Web Development"], "base_participants": 80, "duration": 6, "prize_range": (15000, 30000), "fee_range": (100, 200)},
    {"name": "SQL Challenge", "type": "Technical", "tags": ["Database & SQL", "Programming & Coding"], "base_participants": 40, "duration": 2, "prize_range": (5000, 15000), "fee_range": (50, 100)},
    {"name": "DSA Contest", "type": "Technical", "tags": ["DSA & Problem Solving", "Debugging & Logic", "Programming & Coding"], "base_participants": 50, "duration": 3, "prize_range": (8000, 20000), "fee_range": (50, 150)},
    {"name": "Debugging Challenge", "type": "Technical", "tags": ["Debugging & Logic", "DSA & Problem Solving"], "base_participants": 35, "duration": 2, "prize_range": (5000, 12000), "fee_range": (50, 100)},
    {"name": "CTF Security", "type": "Technical", "tags": ["Cyber Security", "Programming & Coding"], "base_participants": 30, "duration": 4, "prize_range": (10000, 25000), "fee_range": (100, 200)},
    {"name": "UI/UX Design", "type": "Technical", "tags": ["UI/UX Design", "Web Development", "Creative & Marketing"], "base_participants": 35, "duration": 3, "prize_range": (8000, 18000), "fee_range": (50, 150)},
    {"name": "Project Presentation", "type": "Technical", "tags": ["Project & Presentation", "Communication & Voice"], "base_participants": 25, "duration": 4, "prize_range": (10000, 20000), "fee_range": (100, 200)},
    {"name": "Tech Quiz", "type": "Technical", "tags": ["Technical Quiz", "Programming & Coding"], "base_participants": 60, "duration": 2, "prize_range": (5000, 15000), "fee_range": (0, 50)},
    {"name": "General Quiz", "type": "Non-Technical", "tags": ["General Quiz", "Fun & Engagement"], "base_participants": 50, "duration": 2, "prize_range": (5000, 12000), "fee_range": (0, 50)},
    {"name": "IPL Auction", "type": "Non-Technical", "tags": ["Management & Strategy", "Fun & Engagement"], "base_participants": 40, "duration": 3, "prize_range": (5000, 15000), "fee_range": (50, 100)},
    {"name": "Ad Making", "type": "Non-Technical", "tags": ["Creative & Marketing", "Communication & Voice", "Fun & Engagement"], "base_participants": 30, "duration": 2, "prize_range": (5000, 10000), "fee_range": (50, 100)},
    {"name": "Photography Contest", "type": "Non-Technical", "tags": ["Photography & Media", "Creative & Marketing"], "base_participants": 40, "duration": 3, "prize_range": (5000, 15000), "fee_range": (50, 100)},
    {"name": "Treasure Hunt", "type": "Non-Technical", "tags": ["Fun & Engagement", "Management & Strategy"], "base_participants": 60, "duration": 3, "prize_range": (8000, 18000), "fee_range": (50, 100)},
    {"name": "Dance Night", "type": "Non-Technical", "tags": ["Fun & Engagement", "Communication & Voice", "Photography & Media"], "base_participants": 100, "duration": 4, "prize_range": (10000, 25000), "fee_range": (100, 200)},
    {"name": "Debate", "type": "Non-Technical", "tags": ["Communication & Voice", "Management & Strategy"], "base_participants": 25, "duration": 2, "prize_range": (3000, 8000), "fee_range": (0, 50)},
    {"name": "Connections Game", "type": "Technical", "tags": ["Technical Quiz", "Programming & Coding"], "base_participants": 45, "duration": 2, "prize_range": (5000, 12000), "fee_range": (0, 50)},
]

# Cost factors (realistic Indian college fest pricing in INR)
REFRESHMENT_COST_PER_PERSON = (30, 80)  # Tea/coffee/snacks per person
STATIONERY_COST_PER_PERSON = (10, 30)   # Pens, paper, etc.
TECHNICAL_COST_BASE = (500, 5000)        # Projectors, laptops, etc.
CERTIFICATE_COST_PER_PERSON = (15, 40)   # Printing certificates
GOODIES_COST_PER_PERSON = (50, 150)      # T-shirts, bags, etc.
TROPHY_COST = (500, 2000)                # Per trophy
OTHER_COST_RANGE = (200, 2000)           # Miscellaneous

records = []

for i in range(2000):
    template = random.choice(EVENT_TEMPLATES)
    
    # Vary participants around base
    expected_participants = max(10, int(template["base_participants"] * np.random.uniform(0.5, 2.0)))
    duration_hours = max(1, template["duration"] + random.choice([-1, 0, 0, 1]))
    prize_pool = random.randint(*template["prize_range"])
    registration_fee = random.randint(*template["fee_range"])
    
    # Requirements (boolean flags)
    volunteers_needed = max(2, expected_participants // random.randint(8, 15))
    rooms_needed = max(1, expected_participants // random.randint(25, 50))
    refreshments_needed = random.random() < 0.7
    stationary_needed = random.random() < 0.5
    technical_needed = template["type"] == "Technical" or random.random() < 0.3
    goodies_needed = random.random() < 0.25
    physical_certificate = random.random() < 0.6
    trophies_needed = random.random() < 0.4
    
    # Item counts
    refreshment_item_count = random.randint(1, 4) if refreshments_needed else 0
    stationery_item_count = random.randint(1, 3) if stationary_needed else 0
    technical_item_count = random.randint(1, 5) if technical_needed else 0
    
    # One-hot encode tags
    tag_features = {f"tag_{tag.replace(' ', '_').replace('&', 'and').replace('/', '_')}": 
                    1 if tag in template["tags"] else 0 for tag in TAGS}
    
    # Calculate realistic expense breakdown
    refreshment_expense = int(expected_participants * np.random.uniform(*REFRESHMENT_COST_PER_PERSON) * refreshment_item_count * 0.3) if refreshments_needed else 0
    stationery_expense = int(expected_participants * np.random.uniform(*STATIONERY_COST_PER_PERSON) * 0.5) if stationary_needed else 0
    technical_expense = int(np.random.uniform(*TECHNICAL_COST_BASE) * technical_item_count * 0.4) if technical_needed else 0
    certificate_expense = int(expected_participants * np.random.uniform(*CERTIFICATE_COST_PER_PERSON)) if physical_certificate else 0
    goodies_expense = int(expected_participants * np.random.uniform(*GOODIES_COST_PER_PERSON) * 0.3) if goodies_needed else 0
    trophy_expense = int(np.random.uniform(*TROPHY_COST) * random.randint(1, 3)) if trophies_needed else 0
    other_expense = int(np.random.uniform(*OTHER_COST_RANGE))
    
    total_expense = (refreshment_expense + stationery_expense + technical_expense + 
                     certificate_expense + goodies_expense + trophy_expense + other_expense)
    
    # Add noise (±15%) to simulate real-world variance
    total_expense = int(total_expense * np.random.uniform(0.85, 1.15))
    total_expense = max(500, total_expense)  # Minimum expense
    
    record = {
        "event_type": 1 if template["type"] == "Technical" else 0,
        "expected_participants": expected_participants,
        "duration_hours": duration_hours,
        "prize_pool": prize_pool,
        "registration_fee": registration_fee,
        "volunteers_needed": volunteers_needed,
        "rooms_needed": rooms_needed,
        "refreshments_needed": int(refreshments_needed),
        "stationary_needed": int(stationary_needed),
        "technical_needed": int(technical_needed),
        "goodies_needed": int(goodies_needed),
        "physical_certificate": int(physical_certificate),
        "trophies_needed": int(trophies_needed),
        "refreshment_item_count": refreshment_item_count,
        "stationery_item_count": stationery_item_count,
        "technical_item_count": technical_item_count,
        **tag_features,
        # Target variables
        "expense_refreshments": refreshment_expense,
        "expense_stationery": stationery_expense,
        "expense_technical": technical_expense,
        "expense_certificates": certificate_expense,
        "expense_goodies": goodies_expense,
        "expense_trophies": trophy_expense,
        "expense_other": other_expense,
        "total_expense": total_expense
    }
    records.append(record)

df = pd.DataFrame(records)
df.to_csv("budget_prediction_dataset_2k.csv", index=False)

print(f"Generated {len(df)} records")
print(f"Columns: {list(df.columns)}")
print(f"\nTotal expense stats:")
print(df["total_expense"].describe())
print(f"\nSample record:")
print(df.iloc[0].to_dict())
