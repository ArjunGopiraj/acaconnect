"""
Complete Workflow Test Script (Python)
Tests: Event Creation → Approvals → Venue Allocation

Prerequisites:
1. Backend server running on http://localhost:5000
2. MongoDB running with college_events database
3. Test users created with appropriate roles

Run: python test_workflow.py
"""

import requests
import json
import time
from datetime import datetime, timedelta

BASE_URL = 'http://localhost:5000/api'

# Test credentials
CREDENTIALS = {
    'eventTeam': {'email': 'eventteam@college.edu', 'password': 'password123'},
    'treasurer': {'email': 'treasurer@college.edu', 'password': 'password123'},
    'genSec': {'email': 'gensec@college.edu', 'password': 'password123'},
    'chairperson': {'email': 'chairperson@college.edu', 'password': 'password123'},
    'hospitality': {'email': 'hospitality@college.edu', 'password': 'password123'}
}

tokens = {}
test_event_id = None

def login(role, credentials):
    """Login and store token"""
    try:
        response = requests.post(f'{BASE_URL}/auth/login', json=credentials)
        response.raise_for_status()
        tokens[role] = response.json()['token']
        print(f'✅ {role} logged in successfully')
        return True
    except Exception as e:
        print(f'❌ {role} login failed: {str(e)}')
        return False

def get_auth_header(role):
    """Get authorization header"""
    return {'Authorization': f'Bearer {tokens[role]}'}

def test_create_event():
    """Test 1: Event Team creates event"""
    global test_event_id
    print('\n📝 TEST 1: Creating Event...')
    
    # Future date
    future_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
    
    event_data = {
        'title': 'Test Hackathon 2026',
        'type': 'Hackathon',
        'description': 'A test hackathon event for workflow testing',
        'date': future_date,
        'time': '09:00',
        'duration_hours': 8,
        'expected_participants': 100,
        'prize_pool_required': True,
        'prize_pool': 50000,
        'registration_fee_required': True,
        'tags': ['Programming & Coding', 'DSA & Problem Solving'],
        'requirements': {
            'volunteers_needed': 8,
            'rooms_needed': 3,
            'computer_labs_needed': True,
            'computer_labs_count': 2,
            'system_per_participant': True,
            'internet_needed': True,
            'judges_needed': True,
            'judges_count': 3,
            'refreshments_needed': True,
            'refreshment_items': [],
            'stationary_needed': True,
            'stationary_items': [],
            'technical_needed': True,
            'technical_items': [],
            'goodies_needed': True,
            'physical_certificate': True,
            'trophies_needed': True
        }
    }
    
    try:
        response = requests.post(
            f'{BASE_URL}/events',
            json=event_data,
            headers=get_auth_header('eventTeam')
        )
        response.raise_for_status()
        data = response.json()
        test_event_id = data['_id']
        print(f'✅ Event created successfully (ID: {test_event_id})')
        print(f'   Status: {data["status"]}')
        return True
    except Exception as e:
        print(f'❌ Event creation failed: {str(e)}')
        return False

def test_schedule_conflict():
    """Test 2: Check schedule conflicts"""
    print('\n🔍 TEST 2: Checking Schedule Conflicts...')
    
    future_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
    
    conflict_data = {
        'date': future_date,
        'time': '09:00',
        'duration_hours': 8,
        'type': 'Hackathon',
        'expected_participants': 100,
        'prize_pool': 50000,
        'registration_fee': 0
    }
    
    try:
        response = requests.post(
            f'{BASE_URL}/scheduling/check-conflict',
            json=conflict_data,
            headers=get_auth_header('eventTeam')
        )
        response.raise_for_status()
        data = response.json()
        print(f'✅ Schedule check completed')
        print(f'   Has Conflicts: {data["hasConflicts"]}')
        if data['hasConflicts']:
            print(f'   Conflicts: {len(data["conflicts"])}')
            print(f'   Suggestions: {len(data["suggestions"])}')
        return True
    except Exception as e:
        print(f'❌ Schedule check failed: {str(e)}')
        return False

def test_submit_event():
    """Test 3: Submit event for approval"""
    print('\n📤 TEST 3: Submitting Event for Approval...')
    
    try:
        response = requests.put(
            f'{BASE_URL}/events/{test_event_id}/submit',
            headers=get_auth_header('eventTeam')
        )
        response.raise_for_status()
        data = response.json()
        print(f'✅ Event submitted successfully')
        print(f'   Status: {data["status"]}')
        return True
    except Exception as e:
        print(f'❌ Event submission failed: {str(e)}')
        return False

def test_treasurer_approval():
    """Test 4: Treasurer approval"""
    print('\n💰 TEST 4: Treasurer Approval...')
    
    approval_data = {
        'action': 'approve',
        'registration_fee': 500,
        'comments': 'Budget approved. Registration fee set to ₹500.'
    }
    
    try:
        response = requests.put(
            f'{BASE_URL}/treasurer/events/{test_event_id}',
            json=approval_data,
            headers=get_auth_header('treasurer')
        )
        response.raise_for_status()
        data = response.json()
        print(f'✅ Treasurer approved event')
        print(f'   Status: {data["status"]}')
        print(f'   Registration Fee: ₹{data.get("registration_fee", "N/A")}')
        return True
    except Exception as e:
        print(f'❌ Treasurer approval failed: {str(e)}')
        return False

def test_gensec_approval():
    """Test 5: Gen Sec approval"""
    print('\n👔 TEST 5: General Secretary Approval...')
    
    approval_data = {
        'action': 'approve',
        'comments': 'Event plan looks good. Approved.'
    }
    
    try:
        response = requests.put(
            f'{BASE_URL}/gensec/events/{test_event_id}',
            json=approval_data,
            headers=get_auth_header('genSec')
        )
        response.raise_for_status()
        data = response.json()
        print(f'✅ Gen Sec approved event')
        print(f'   Status: {data["status"]}')
        return True
    except Exception as e:
        print(f'❌ Gen Sec approval failed: {str(e)}')
        return False

def test_chairperson_approval():
    """Test 6: Chairperson approval"""
    print('\n🎓 TEST 6: Chairperson Approval...')
    
    approval_data = {
        'action': 'approve',
        'comments': 'Final approval granted. Event can proceed.'
    }
    
    try:
        response = requests.put(
            f'{BASE_URL}/chairperson/events/{test_event_id}',
            json=approval_data,
            headers=get_auth_header('chairperson')
        )
        response.raise_for_status()
        data = response.json()
        print(f'✅ Chairperson approved event')
        print(f'   Status: {data["status"]}')
        return True
    except Exception as e:
        print(f'❌ Chairperson approval failed: {str(e)}')
        return False

def test_view_requirements():
    """Test 7: Hospitality views requirements"""
    print('\n🏨 TEST 7: Hospitality Views Requirements...')
    
    try:
        response = requests.get(
            f'{BASE_URL}/hospitality/events',
            headers=get_auth_header('hospitality')
        )
        response.raise_for_status()
        events = response.json()
        event = next((e for e in events if e['_id'] == test_event_id), None)
        
        if event:
            print(f'✅ Event found in hospitality dashboard')
            print(f'   Expected Participants: {event["expected_participants"]}')
            print(f'   Duration: {event["duration_hours"]} hours')
            print(f'   Type: {event["type"]}')
            return True
        else:
            print('❌ Event not found in hospitality dashboard')
            return False
    except Exception as e:
        print(f'❌ View requirements failed: {str(e)}')
        return False

def test_acknowledge_requirements():
    """Test 8: Acknowledge requirements"""
    print('\n✔️ TEST 8: Acknowledging Requirements...')
    
    try:
        response = requests.post(
            f'{BASE_URL}/hospitality/acknowledge/{test_event_id}',
            headers=get_auth_header('hospitality')
        )
        response.raise_for_status()
        print(f'✅ Requirements acknowledged')
        return True
    except Exception as e:
        print(f'❌ Acknowledge requirements failed: {str(e)}')
        return False

def test_auto_generate_venue():
    """Test 9: Auto-generate venue suggestion"""
    print('\n🤖 TEST 9: Auto-Generating Venue Suggestion...')
    
    try:
        response = requests.post(
            f'{BASE_URL}/scheduling/generate',
            json={'eventIds': [test_event_id]},
            headers=get_auth_header('hospitality')
        )
        response.raise_for_status()
        data = response.json()
        
        if data.get('schedule') and len(data['schedule']) > 0:
            suggestion = data['schedule'][0]
            print(f'✅ Venue suggestion generated')
            print(f'   Suggested Venue: {suggestion.get("venueName", "N/A")}')
            print(f'   Venue Type: {suggestion.get("venueType", "N/A")}')
            print(f'   Capacity: {suggestion.get("venueCapacity", "N/A")}')
            print(f'   Utilization: {suggestion.get("utilization", "N/A")}%')
            print(f'   Priority Score: {suggestion.get("priority", "N/A")}')
            return True
        else:
            print('⚠️ No venue suggestion generated (may be expected if no suitable venue)')
            return True
    except Exception as e:
        print(f'❌ Auto-generate venue failed: {str(e)}')
        return False

def test_allocate_venue():
    """Test 10: Allocate venue"""
    print('\n🏢 TEST 10: Allocating Venue...')
    
    venue_data = {
        'allocated_rooms': [
            {'room_number': '101', 'room_name': 'Computer Lab 1'},
            {'room_number': '102', 'room_name': 'Computer Lab 2'},
            {'room_number': '201', 'room_name': 'Conference Hall'}
        ],
        'lab_allocated': 'Computer Lab 1, Computer Lab 2',
        'venue_details': 'Room 101 (Computer Lab 1), Room 102 (Computer Lab 2), Room 201 (Conference Hall)'
    }
    
    try:
        response = requests.post(
            f'{BASE_URL}/hospitality/venue/{test_event_id}',
            json=venue_data,
            headers=get_auth_header('hospitality')
        )
        response.raise_for_status()
        print(f'✅ Venue allocated successfully')
        print(f'   Allocated Rooms: {len(venue_data["allocated_rooms"])}')
        print(f'   Lab: {venue_data["lab_allocated"]}')
        return True
    except Exception as e:
        print(f'❌ Venue allocation failed: {str(e)}')
        return False

def test_verify_venue_allocation():
    """Test 11: Verify venue allocation"""
    print('\n🔍 TEST 11: Verifying Venue Allocation...')
    
    try:
        response = requests.get(
            f'{BASE_URL}/events',
            headers=get_auth_header('eventTeam')
        )
        response.raise_for_status()
        events = response.json()
        event = next((e for e in events if e['_id'] == test_event_id), None)
        
        if event and event.get('hospitality', {}).get('venue_allocated'):
            print(f'✅ Venue allocation verified in Event Team dashboard')
            print(f'   Allocated Rooms: {len(event["hospitality"].get("allocated_rooms", []))}')
            print(f'   Lab: {event["hospitality"].get("lab_allocated", "N/A")}')
            print(f'   Venue Details: {event["hospitality"].get("venue_details", "N/A")}')
            return True
        else:
            print('❌ Venue allocation not found in event')
            return False
    except Exception as e:
        print(f'❌ Verify venue allocation failed: {str(e)}')
        return False

def test_cleanup():
    """Test 12: Cleanup - Delete test event"""
    print('\n🧹 TEST 12: Cleaning Up Test Data...')
    
    try:
        response = requests.delete(
            f'{BASE_URL}/events/{test_event_id}',
            headers=get_auth_header('eventTeam')
        )
        response.raise_for_status()
        print(f'✅ Test event deleted successfully')
        return True
    except Exception as e:
        print(f'❌ Cleanup failed: {str(e)}')
        return False

def run_tests():
    """Main test runner"""
    print('🚀 Starting Complete Workflow Test\n')
    print('=' * 60)
    
    passed_tests = 0
    total_tests = 12
    
    # Login all users
    print('\n🔐 Logging in all users...')
    login_results = [
        login('eventTeam', CREDENTIALS['eventTeam']),
        login('treasurer', CREDENTIALS['treasurer']),
        login('genSec', CREDENTIALS['genSec']),
        login('chairperson', CREDENTIALS['chairperson']),
        login('hospitality', CREDENTIALS['hospitality'])
    ]
    
    if not all(login_results):
        print('\n❌ Login failed for one or more users. Aborting tests.')
        return
    
    # Run tests sequentially
    tests = [
        test_create_event,
        test_schedule_conflict,
        test_submit_event,
        test_treasurer_approval,
        test_gensec_approval,
        test_chairperson_approval,
        test_view_requirements,
        test_acknowledge_requirements,
        test_auto_generate_venue,
        test_allocate_venue,
        test_verify_venue_allocation,
        test_cleanup
    ]
    
    for test in tests:
        result = test()
        if result:
            passed_tests += 1
        time.sleep(0.5)  # Small delay between tests
    
    # Summary
    print('\n' + '=' * 60)
    print('\n📊 TEST SUMMARY')
    print(f'   Total Tests: {total_tests}')
    print(f'   Passed: {passed_tests}')
    print(f'   Failed: {total_tests - passed_tests}')
    print(f'   Success Rate: {(passed_tests / total_tests * 100):.1f}%')
    
    if passed_tests == total_tests:
        print('\n✅ ALL TESTS PASSED! Workflow is working correctly.')
    else:
        print('\n⚠️ SOME TESTS FAILED. Please check the logs above.')
    
    print('\n' + '=' * 60)

if __name__ == '__main__':
    try:
        run_tests()
    except KeyboardInterrupt:
        print('\n\n⚠️ Tests interrupted by user')
    except Exception as e:
        print(f'\n💥 Fatal error: {str(e)}')
