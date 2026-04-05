import pandas as pd
import numpy as np
import random

random.seed(42)
np.random.seed(42)

NUM_EVENTS = 5000

EVENT_TYPES = ['Non-Technical', 'Technical', 'Hackathon', 'Seminar', 'Workshop']

# ── 19 Refreshment items with (min, max, per_participant?) ──
# per_participant items: quantity = participants (or fraction)
# event-level items: quantity is fixed (packs based on participants)
REFRESHMENT_ITEMS = {
    'Water bottles':            (10, 15, True),
    'Tea':                      (10, 10, True),
    'Coffee':                   (10, 15, True),
    'Milk':                     (15, 20, True),
    'Biscuits':                 (5, 10, True),
    'Samosa / Puff / Cutlet':   (10, 20, True),
    'Chips':                    (10, 20, True),
    'Cake':                     (600, 900, False),   # per kg, 1-2 cakes per event
    'Fruit plates':             (30, 50, True),
    'Banana / Apple / Orange':  (8, 25, True),       # avg across fruits
    'Juice packets':            (10, 20, True),
    'Packed snacks':            (20, 40, True),
    'Soft drinks':              (20, 40, True),
    'Mineral water bottles':    (15, 20, True),
    'Paper cups':               (60, 100, False),    # pack of 50
    'Disposable glasses':       (80, 120, False),    # pack of 50
    'Plates':                   (80, 150, False),    # pack of 50
    'Tissues / Napkins':        (60, 120, False),    # pack of 100
    'Trash bags':               (100, 200, False),   # per pack
}

# ── 27 Stationery items ──
STATIONERY_ITEMS = {
    'A4 sheets':              (2, 2, True),
    'Chart papers':           (15, 25, False),
    'Sticky notes':           (30, 80, False),
    'Pens':                   (5, 10, True),
    'Pencils':                (3, 5, True),
    'Erasers':                (3, 5, True),
    'Sharpeners':             (5, 5, True),
    'Highlighters':           (20, 50, False),
    'Sketch pens':            (60, 120, False),
    'Permanent markers':      (30, 60, False),
    'Whiteboard markers':     (40, 80, False),
    'Correction pens':        (20, 40, False),
    'Paper clips':            (20, 40, False),
    'Binder clips':           (40, 80, False),
    'Stapler':                (80, 150, False),
    'Staples':                (20, 40, False),
    'Glue sticks':            (20, 40, False),
    'Cellophane tape':        (20, 40, False),
    'Double-sided tape':      (50, 100, False),
    'Rubber bands':           (20, 40, False),
    'Folders / Files':        (20, 50, False),
    'Envelopes':              (5, 10, False),
    'Notepads':               (20, 50, True),
    'Name slips / ID labels': (2, 5, True),
    'Attendance sheets':      (2, 3, False),
    'Evaluation sheets':      (2, 3, False),
    'Clipboards':             (80, 150, False),
}

# Other category prices (same as before)
OTHER_PRICES = {
    'certificate_color': (8, 15),
    'chocolate':         (10, 20),
    'goodie_kit':        (40, 80),
    'dry_fruit_guest':   (100, 150),
    'trophy_1st':        (500, 700),
    'trophy_2nd':        (300, 500),
    'trophy_3rd':        (200, 300),
    'medal':             (250, 350),
    'momento_guest':     (250, 300),
    'banner':            (800, 1200),
    'decoration':        (500, 1000),
    'poster':            (10, 20),
    'pamphlet':          (2, 5),
    'standee':           (800, 1500),
    'backdrop_small':    (1500, 3000),
    'backdrop_large':    (3000, 6000),
    'cake_inaug':        (600, 900),
    'ribbon':            (30, 100),
    'name_plate':        (30, 100),
    'petrol_trip':       (200, 300),
    'local_transport':   (1500, 3000),
    'meal_per_person':   (80, 150),
    'snacks_meal':       (40, 80),
    'folder_judge':      (20, 50),
    'id_lanyard_combo':  (25, 40),
}


def rand(lo, hi):
    return random.uniform(lo, hi)


def calc_refreshment_cost(items_chosen, participants):
    cost = 0
    for item_name in items_chosen:
        lo, hi, per_p = REFRESHMENT_ITEMS[item_name]
        price = rand(lo, hi)
        if per_p:
            # per-participant items: not everyone gets every item
            # e.g., some get tea, some get coffee — use 60-100% of participants
            fraction = random.uniform(0.6, 1.0)
            cost += price * int(participants * fraction)
        else:
            # event-level: packs based on participants
            if item_name == 'Cake':
                num_cakes = random.randint(1, 2)
                cost += price * num_cakes
            elif item_name in ('Paper cups', 'Disposable glasses', 'Plates'):
                packs = max(1, participants // 50 + 1)
                cost += price * packs
            elif item_name == 'Tissues / Napkins':
                packs = max(1, participants // 100 + 1)
                cost += price * packs
            elif item_name == 'Trash bags':
                packs = random.randint(1, 3)
                cost += price * packs
    return cost


def calc_stationery_cost(items_chosen, participants):
    cost = 0
    for item_name in items_chosen:
        lo, hi, per_p = STATIONERY_ITEMS[item_name]
        price = rand(lo, hi)
        if per_p:
            cost += price * participants
        else:
            # event-level: small fixed quantities
            if item_name in ('Chart papers', 'Highlighters', 'Permanent markers',
                             'Whiteboard markers', 'Correction pens', 'Envelopes'):
                qty = random.randint(2, 10)
            elif item_name in ('Sketch pens',):
                qty = random.randint(1, 5)
            elif item_name in ('Stapler', 'Clipboards'):
                qty = random.randint(1, 3)
            elif item_name in ('Attendance sheets', 'Evaluation sheets'):
                qty = max(1, participants // 30 + 1)
            elif item_name == 'Folders / Files':
                qty = random.randint(3, 10)
            else:
                qty = random.randint(1, 5)
            cost += price * qty
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
    else:
        participants = random.randint(20, 250)
        duration = random.choice([1, 2, 3, 4])

    prize_pool = 0
    if event_type in ['Technical', 'Non-Technical', 'Hackathon']:
        if random.random() < 0.7:
            prize_pool = random.choice([0, 1000, 2000, 3000, 5000, 7000, 10000, 15000, 20000])

    refreshments_needed = random.random() < 0.85
    stationary_needed = random.random() < 0.6
    goodies_needed = random.random() < 0.4
    physical_certificate = random.random() < 0.7
    trophies_needed = (prize_pool > 0) and (random.random() < 0.8)

    volunteers_needed = max(2, participants // random.randint(10, 25))
    rooms_needed = max(1, participants // random.randint(30, 60))

    # Pick random items from the actual seed lists
    refreshment_item_count = 0
    stationery_item_count = 0
    refreshment_items_chosen = []
    stationery_items_chosen = []

    if refreshments_needed:
        refreshment_item_count = random.randint(1, 6)
        refreshment_items_chosen = random.sample(
            list(REFRESHMENT_ITEMS.keys()),
            k=min(refreshment_item_count, len(REFRESHMENT_ITEMS))
        )
        refreshment_item_count = len(refreshment_items_chosen)

    if stationary_needed:
        stationery_item_count = random.randint(1, 8)
        stationery_items_chosen = random.sample(
            list(STATIONERY_ITEMS.keys()),
            k=min(stationery_item_count, len(STATIONERY_ITEMS))
        )
        stationery_item_count = len(stationery_items_chosen)

    # ── EXPENSES ──

    # 1. Refreshments
    expense_refreshments = 0
    if refreshments_needed:
        expense_refreshments = calc_refreshment_cost(refreshment_items_chosen, participants)
        # Long events: add snack meal or full meal
        if duration >= 4 and random.random() < 0.6:
            expense_refreshments += participants * rand(*OTHER_PRICES['snacks_meal'])
        if duration >= 6 and random.random() < 0.5:
            expense_refreshments += participants * rand(*OTHER_PRICES['meal_per_person'])

    # 2. Stationery
    expense_stationery = 0
    if stationary_needed:
        expense_stationery = calc_stationery_cost(stationery_items_chosen, participants)

    # 3. Certificates
    expense_certificates = 0
    if physical_certificate:
        expense_certificates = participants * rand(*OTHER_PRICES['certificate_color'])
        num_judges = random.randint(2, 5)
        expense_certificates += num_judges * rand(*OTHER_PRICES['folder_judge'])

    # 4. Goodies
    expense_goodies = 0
    if goodies_needed:
        if random.random() < 0.6:
            expense_goodies = participants * rand(*OTHER_PRICES['goodie_kit'])
        else:
            expense_goodies = participants * rand(*OTHER_PRICES['chocolate'])
        num_guests = random.randint(2, 6)
        expense_goodies += num_guests * rand(*OTHER_PRICES['dry_fruit_guest'])

    # 5. Trophies
    expense_trophies = 0
    if trophies_needed:
        expense_trophies += rand(*OTHER_PRICES['trophy_1st'])
        expense_trophies += rand(*OTHER_PRICES['trophy_2nd'])
        expense_trophies += rand(*OTHER_PRICES['trophy_3rd'])
        if random.random() < 0.4:
            expense_trophies += random.randint(3, 10) * rand(*OTHER_PRICES['medal'])
        num_momentos = random.randint(1, 4)
        expense_trophies += num_momentos * rand(*OTHER_PRICES['momento_guest'])

    # 6. Other (banners, decoration, logistics, inauguration)
    expense_other = 0
    num_banners = random.randint(2, 5)
    expense_other += num_banners * rand(*OTHER_PRICES['banner'])
    if random.random() < 0.7:
        expense_other += rand(*OTHER_PRICES['decoration'])
    if random.random() < 0.5:
        expense_other += random.randint(10, 30) * rand(*OTHER_PRICES['poster'])
    if random.random() < 0.4:
        expense_other += participants * rand(*OTHER_PRICES['pamphlet'])
    if random.random() < 0.3:
        expense_other += rand(*OTHER_PRICES['standee'])
    if random.random() < 0.4:
        if participants > 100:
            expense_other += rand(*OTHER_PRICES['backdrop_large'])
        else:
            expense_other += rand(*OTHER_PRICES['backdrop_small'])
    if random.random() < 0.5:
        expense_other += rand(*OTHER_PRICES['cake_inaug'])
        expense_other += rand(*OTHER_PRICES['ribbon'])
        expense_other += random.randint(3, 8) * rand(*OTHER_PRICES['name_plate'])
    if random.random() < 0.5:
        expense_other += volunteers_needed * rand(*OTHER_PRICES['id_lanyard_combo'])
    if random.random() < 0.6:
        expense_other += random.randint(1, 4) * rand(*OTHER_PRICES['petrol_trip'])
    if random.random() < 0.3:
        expense_other += rand(*OTHER_PRICES['local_transport'])

    # Round
    expense_refreshments = round(expense_refreshments)
    expense_stationery = round(expense_stationery)
    expense_certificates = round(expense_certificates)
    expense_goodies = round(expense_goodies)
    expense_trophies = round(expense_trophies)
    expense_other = round(expense_other)

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
df.to_csv('data/budget_training_dataset.csv', index=False)

print(f"Generated {NUM_EVENTS} events")
print(f"Columns: {list(df.columns)}")
print(f"\n--- Stats ---")
print(df[['total_expense', 'expense_refreshments', 'expense_stationery',
          'expense_certificates', 'expense_goodies', 'expense_trophies',
          'expense_other']].describe().round(0).to_string())
print(f"\nMin: Rs.{df['total_expense'].min()}")
print(f"Max: Rs.{df['total_expense'].max()}")
print(f"Avg: Rs.{df['total_expense'].mean():.0f}")
