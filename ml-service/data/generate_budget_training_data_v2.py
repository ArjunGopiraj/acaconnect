"""
Improved Budget Training Data Generator
Template-based item selection tied to event type/size/duration
Reduces randomness for better model learning
"""

import pandas as pd
import numpy as np
import random

random.seed(42)
np.random.seed(42)

NUM_EVENTS = 5000

EVENT_TYPES = ['Non-Technical', 'Technical', 'Hackathon', 'Seminar', 'Workshop']

# ── Item prices from item_prices_complete.csv ──
REFRESHMENT_PRICES = {
    'Water bottles': (10, 15, True),
    'Tea': (10, 10, True),
    'Coffee': (10, 15, True),
    'Biscuits': (5, 10, True),
    'Samosa / Puff / Cutlet': (10, 20, True),
    'Chips': (10, 20, True),
    'Cake': (600, 900, False),
    'Fruit plates': (30, 50, True),
    'Juice packets': (10, 20, True),
    'Packed snacks': (20, 40, True),
    'Soft drinks': (20, 40, True),
    'Mineral water bottles': (15, 20, True),
    'Paper cups': (60, 100, False),
    'Disposable glasses': (80, 120, False),
    'Plates': (80, 150, False),
    'Tissues / Napkins': (60, 120, False),
    'Trash bags': (100, 200, False),
}

STATIONERY_PRICES = {
    'A4 sheets': (2, 2, True),
    'Pens': (5, 10, True),
    'Pencils': (3, 5, True),
    'Erasers': (3, 5, True),
    'Notepads': (20, 50, True),
    'Name slips / ID labels': (2, 5, True),
    'Chart papers': (15, 25, False),
    'Sticky notes': (30, 80, False),
    'Highlighters': (20, 50, False),
    'Sketch pens': (60, 120, False),
    'Permanent markers': (30, 60, False),
    'Whiteboard markers': (40, 80, False),
    'Folders / Files': (20, 50, False),
    'Attendance sheets': (2, 3, False),
    'Evaluation sheets': (2, 3, False),
    'Stapler': (80, 150, False),
    'Cellophane tape': (20, 40, False),
}

OTHER_PRICES = {
    'banner': (800, 1200),
    'decoration': (500, 1000),
    'poster': (10, 20),
    'standee': (800, 1500),
    'backdrop_small': (1500, 3000),
    'backdrop_large': (3000, 6000),
    'cake_inaug': (600, 900),
    'ribbon': (30, 100),
    'name_plate': (30, 100),
    'petrol_trip': (200, 300),
    'local_transport': (1500, 3000),
    'id_lanyard': (25, 40),
    'certificate_color': (8, 15),
    'goodie_kit': (40, 80),
    'chocolate': (10, 20),
    'dry_fruit_guest': (100, 150),
    'trophy_1st': (500, 700),
    'trophy_2nd': (300, 500),
    'trophy_3rd': (200, 300),
    'medal': (250, 350),
    'momento_guest': (250, 300),
    'meal_per_person': (80, 150),
    'snacks_meal': (40, 80),
}


# ── Templates: what items each event size/type needs ──

def get_refreshment_items(participants, duration, event_type):
    """Deterministic item selection based on event profile"""
    items = []

    # Base: every event with refreshments gets water + tea/coffee + biscuits
    items.append('Water bottles')
    items.append(random.choice(['Tea', 'Coffee']))
    items.append('Biscuits')

    # Medium events (50+): add a snack
    if participants >= 50:
        items.append(random.choice(['Samosa / Puff / Cutlet', 'Chips']))
        items.append('Paper cups')
        items.append('Tissues / Napkins')

    # Large events (100+): add drinks + more variety
    if participants >= 100:
        items.append('Juice packets')
        items.append(random.choice(['Soft drinks', 'Mineral water bottles']))
        items.append('Disposable glasses')
        items.append('Trash bags')

    # Very large (200+): add fruits + packed snacks
    if participants >= 200:
        items.append('Packed snacks')
        items.append('Fruit plates')

    # Long events: plates needed for meals
    if duration >= 4:
        items.append('Plates')

    # Hackathons/Workshops always get more
    if event_type in ['Hackathon', 'Workshop'] and 'Packed snacks' not in items:
        items.append('Packed snacks')

    return list(set(items))  # deduplicate


def get_stationery_items(participants, event_type):
    """Deterministic stationery selection"""
    items = []

    # Base: every event with stationery
    items.extend(['A4 sheets', 'Pens', 'Attendance sheets'])

    # Technical/Hackathon: more writing materials
    if event_type in ['Technical', 'Hackathon']:
        items.extend(['Notepads', 'Pencils', 'Erasers'])
        items.append('Evaluation sheets')

    # Workshop: presentation materials
    if event_type == 'Workshop':
        items.extend(['Chart papers', 'Sketch pens', 'Sticky notes', 'Highlighters'])
        items.append('Notepads')

    # Seminar: minimal
    if event_type == 'Seminar':
        items.append('Name slips / ID labels')
        items.append('Folders / Files')

    # Large events: markers for boards
    if participants >= 100:
        items.append('Whiteboard markers')
        items.append('Permanent markers')

    # All events with stationery get tape
    if participants >= 50:
        items.append('Cellophane tape')

    return list(set(items))


def calc_refreshment_cost(items, participants, duration):
    """Calculate refreshment cost with tight variance"""
    cost = 0
    for item in items:
        lo, hi, per_p = REFRESHMENT_PRICES[item]
        price = random.uniform(lo, hi)

        if per_p:
            # 85-95% of participants (tight range)
            fraction = random.uniform(0.85, 0.95)
            cost += price * int(participants * fraction)
        else:
            if item == 'Cake':
                cost += price * 1
            elif item in ('Paper cups', 'Disposable glasses', 'Plates'):
                packs = max(1, participants // 50 + 1)
                cost += price * packs
            elif item == 'Tissues / Napkins':
                packs = max(1, participants // 100 + 1)
                cost += price * packs
            elif item == 'Trash bags':
                packs = max(1, participants // 100 + 1)
                cost += price * packs

    # Long events: add meal costs
    if duration >= 6:
        cost += participants * random.uniform(*OTHER_PRICES['meal_per_person'])
    elif duration >= 4:
        cost += participants * random.uniform(*OTHER_PRICES['snacks_meal'])

    return cost


def calc_stationery_cost(items, participants):
    """Calculate stationery cost with tight variance"""
    cost = 0
    for item in items:
        lo, hi, per_p = STATIONERY_PRICES[item]
        price = random.uniform(lo, hi)

        if per_p:
            cost += price * participants
        else:
            if item in ('Chart papers', 'Highlighters', 'Permanent markers', 'Whiteboard markers'):
                qty = random.randint(3, 8)
            elif item == 'Sketch pens':
                qty = random.randint(2, 4)
            elif item in ('Stapler',):
                qty = random.randint(1, 2)
            elif item in ('Attendance sheets', 'Evaluation sheets'):
                qty = max(1, participants // 30 + 1)
            elif item == 'Folders / Files':
                qty = random.randint(3, 8)
            elif item == 'Sticky notes':
                qty = random.randint(2, 5)
            else:
                qty = random.randint(1, 3)
            cost += price * qty

    return cost


def calc_certificate_cost(participants):
    """Certificate cost scales linearly with participants"""
    return participants * random.uniform(*OTHER_PRICES['certificate_color'])


def calc_goodies_cost(participants):
    """Goodies: kit for large events, chocolate for small"""
    if participants >= 80:
        return participants * random.uniform(*OTHER_PRICES['goodie_kit'])
    else:
        return participants * random.uniform(*OTHER_PRICES['chocolate'])


def calc_trophy_cost(prize_pool):
    """Trophy cost scales with prize pool tier"""
    cost = 0
    cost += random.uniform(*OTHER_PRICES['trophy_1st'])
    cost += random.uniform(*OTHER_PRICES['trophy_2nd'])
    cost += random.uniform(*OTHER_PRICES['trophy_3rd'])

    # Higher prize pool = more medals/momentos
    if prize_pool >= 10000:
        cost += random.randint(5, 8) * random.uniform(*OTHER_PRICES['medal'])
        cost += random.randint(2, 4) * random.uniform(*OTHER_PRICES['momento_guest'])
    elif prize_pool >= 5000:
        cost += random.randint(3, 5) * random.uniform(*OTHER_PRICES['medal'])
        cost += random.randint(1, 2) * random.uniform(*OTHER_PRICES['momento_guest'])
    else:
        cost += random.randint(1, 3) * random.uniform(*OTHER_PRICES['momento_guest'])

    return cost


def calc_other_cost(participants, volunteers, event_type):
    """Other costs tied to event size and type"""
    cost = 0

    # Banners: scales with event size
    if participants >= 150:
        num_banners = random.randint(3, 5)
    elif participants >= 80:
        num_banners = random.randint(2, 4)
    else:
        num_banners = random.randint(1, 3)
    cost += num_banners * random.uniform(*OTHER_PRICES['banner'])

    # Decoration: all events
    cost += random.uniform(*OTHER_PRICES['decoration'])

    # Posters: scales with participants
    num_posters = max(5, participants // 10)
    cost += num_posters * random.uniform(*OTHER_PRICES['poster'])

    # Backdrop: large events only
    if participants >= 150:
        cost += random.uniform(*OTHER_PRICES['backdrop_large'])
    elif participants >= 80:
        cost += random.uniform(*OTHER_PRICES['backdrop_small'])

    # Standee: medium+ events
    if participants >= 100:
        cost += random.uniform(*OTHER_PRICES['standee'])

    # ID lanyards for volunteers
    cost += volunteers * random.uniform(*OTHER_PRICES['id_lanyard'])

    # Transport: scales with volunteers
    trips = max(1, volunteers // 5)
    cost += trips * random.uniform(*OTHER_PRICES['petrol_trip'])

    # Hackathon/Seminar: inauguration setup
    if event_type in ['Hackathon', 'Seminar']:
        cost += random.uniform(*OTHER_PRICES['cake_inaug'])
        cost += random.uniform(*OTHER_PRICES['ribbon'])
        cost += random.randint(3, 6) * random.uniform(*OTHER_PRICES['name_plate'])

    return cost


def generate_event():
    event_type = random.choice(EVENT_TYPES)

    if event_type == 'Hackathon':
        participants = random.randint(30, 200)
        duration = random.choice([4, 5, 6, 7, 8])
    elif event_type == 'Seminar':
        participants = random.randint(50, 300)
        duration = random.choice([1, 2, 3])
    elif event_type == 'Workshop':
        participants = random.randint(20, 100)
        duration = random.choice([2, 3, 4, 5])
    elif event_type == 'Technical':
        participants = random.randint(15, 200)
        duration = random.choice([1, 2, 3, 4])
    else:  # Non-Technical
        participants = random.randint(20, 250)
        duration = random.choice([1, 2, 3, 4])

    # Prize pool: tied to event type
    prize_pool = 0
    if event_type in ['Technical', 'Non-Technical', 'Hackathon']:
        if random.random() < 0.7:
            prize_pool = random.choice([0, 1000, 2000, 3000, 5000, 7000, 10000, 15000, 20000])

    # Needs flags: tied to event type (not fully random)
    refreshments_needed = True if event_type in ['Hackathon', 'Workshop', 'Seminar'] else random.random() < 0.85
    stationary_needed = True if event_type in ['Technical', 'Hackathon', 'Workshop'] else random.random() < 0.4
    goodies_needed = True if (participants >= 100 and random.random() < 0.5) else random.random() < 0.25
    physical_certificate = True if event_type in ['Hackathon', 'Workshop', 'Seminar'] else random.random() < 0.6
    trophies_needed = (prize_pool > 0) and (random.random() < 0.85)

    volunteers_needed = max(2, participants // random.randint(10, 20))
    rooms_needed = max(1, participants // random.randint(30, 60))

    # Get items based on templates
    refreshment_items = get_refreshment_items(participants, duration, event_type) if refreshments_needed else []
    stationery_items = get_stationery_items(participants, event_type) if stationary_needed else []

    refreshment_item_count = len(refreshment_items)
    stationery_item_count = len(stationery_items)

    # Calculate expenses
    expense_refreshments = round(calc_refreshment_cost(refreshment_items, participants, duration)) if refreshments_needed else 0
    expense_stationery = round(calc_stationery_cost(stationery_items, participants)) if stationary_needed else 0
    expense_certificates = round(calc_certificate_cost(participants)) if physical_certificate else 0
    expense_goodies = round(calc_goodies_cost(participants)) if goodies_needed else 0
    expense_trophies = round(calc_trophy_cost(prize_pool)) if trophies_needed else 0
    expense_other = round(calc_other_cost(participants, volunteers_needed, event_type))

    total_expense = (expense_refreshments + expense_stationery + expense_certificates +
                     expense_goodies + expense_trophies + expense_other)

    return {
        'event_type': EVENT_TYPES.index(event_type),
        'expected_participants': participants,
        'duration_hours': duration,
        'prize_pool': prize_pool,
        'refreshments_needed': int(refreshments_needed),
        'stationary_needed': int(stationary_needed),
        'goodies_needed': int(goodies_needed),
        'physical_certificate': int(physical_certificate),
        'trophies_needed': int(trophies_needed),
        'volunteers_needed': volunteers_needed,
        'rooms_needed': rooms_needed,
        'refreshment_item_count': refreshment_item_count,
        'stationery_item_count': stationery_item_count,
        'expense_refreshments': expense_refreshments,
        'expense_stationery': expense_stationery,
        'expense_certificates': expense_certificates,
        'expense_goodies': expense_goodies,
        'expense_trophies': expense_trophies,
        'expense_other': expense_other,
        'total_expense': total_expense,
    }


events = [generate_event() for _ in range(NUM_EVENTS)]
df = pd.DataFrame(events)
df.to_csv('data/budget_training_dataset_v2.csv', index=False)

print(f"Generated {NUM_EVENTS} events")
print(f"Columns: {list(df.columns)}")
print(f"\n--- Stats ---")
print(df[['total_expense', 'expense_refreshments', 'expense_stationery',
          'expense_certificates', 'expense_goodies', 'expense_trophies',
          'expense_other']].describe().round(0).to_string())
print(f"\nMin: Rs.{df['total_expense'].min()}")
print(f"Max: Rs.{df['total_expense'].max()}")
print(f"Avg: Rs.{df['total_expense'].mean():.0f}")
