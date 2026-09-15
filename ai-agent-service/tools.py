import requests
from langchain_core.tools import tool

BOOKING_SERVICE_URL = "http://localhost:8080/api"

@tool
def check_available_services():
    """Fetches the live list of all salon services available in the salon database."""
    try:
        response = requests.get(f"{BOOKING_SERVICE_URL}/services", timeout=5)
        if response.status_code == 200:
            services = response.json()
            if not services:
                return "No services found in the database."
            return f"Available Services: {', '.join([s['name'] + ' (LKR ' + str(s['price']) + ')' for s in services])}"
        return "Could not retrieve services from booking service."
    except Exception as e:
        return f"Error connecting to booking service: {str(e)}"

@tool
def check_available_stylists():
    """Fetches the list of active stylists and their specialties in the salon."""
    try:
        response = requests.get(f"{BOOKING_SERVICE_URL}/stylists", timeout=5)
        if response.status_code == 200:
            stylists = response.json()
            if not stylists:
                return "Our general salon team is available for all treatments."
            return f"Our Stylists: {', '.join([s['name'] + ' (' + str(s['specialty']) + ')' for s in stylists])}"
        return "Could not retrieve stylists from booking service."
    except Exception as e:
        return f"Error connecting to booking service: {str(e)}"

@tool
def check_available_slots(appointment_date: str):
    """
    Checks the free and available time slots for a given date.
    Args:
        appointment_date: Date to check slots for (e.g. '2026-09-15', 'Tomorrow')
    """
    try:
        response = requests.get(f"{BOOKING_SERVICE_URL}/bookings/available-slots", params={"date": appointment_date}, timeout=5)
        if response.status_code == 200:
            slots = response.json()
            if not slots:
                return f"Sorry, all slots are fully booked for {appointment_date}."
            return f"Available time slots for {appointment_date}: {', '.join(slots)}"
        return f"Could not check slots for {appointment_date}."
    except Exception as e:
        return f"Booking service slot check is offline: {str(e)}"

@tool
def book_appointment(customer_name: str, service_name: str, appointment_date: str, appointment_time: str, customer_phone: str):
    """
    Books an appointment for a customer in the salon booking system.
    Args:
        customer_name: Name of the customer (e.g., 'Kasun Perera')
        service_name: Name of the service requested (e.g., 'Men\'s Haircut', 'Keratin Treatment')
        appointment_date: Date of appointment (e.g., '2026-09-15' or 'Tomorrow')
        appointment_time: Preferred time (e.g., '10:00 AM', '02:00 PM')
        customer_phone: Customer contact phone number (e.g., '0771234567')
    """
    payload = {
        "customerName": customer_name,
        "serviceName": service_name,
        "appointmentDate": appointment_date,
        "appointmentTime": appointment_time,
        "customerPhone": customer_phone,
        "status": "CONFIRMED"
    }
    try:
        response = requests.post(f"{BOOKING_SERVICE_URL}/bookings", json=payload, timeout=5)
        if response.status_code in [200, 201]:
            data = response.json()
            booking_id = data.get("id", "BK-" + str(data.get("bookingId", "101")))
            return f"SUCCESS: Appointment booked successfully! Booking Reference ID is #{booking_id} for {customer_name} on {appointment_date} at {appointment_time}."
        else:
            return f"Booking failed with status code {response.status_code}. Please ask customer to call salon directly."
    except Exception as e:
        return f"Booking Service is currently offline. Error: {str(e)}"

@tool
def get_customer_bookings(customer_phone: str):
    """
    Retrieves previous booking history and current appointment status for a customer by their phone number.
    Args:
        customer_phone: The customer's contact phone number (e.g. '0771234567')
    """
    try:
        response = requests.get(f"{BOOKING_SERVICE_URL}/bookings/customer/{customer_phone}", timeout=5)
        if response.status_code == 200:
            bookings = response.json()
            if not bookings:
                return f"No bookings found for phone number {customer_phone}."
            summary = []
            for b in bookings[:3]:
                summary.append(f"#{b.get('id')}: {b.get('serviceName')} on {b.get('appointmentDate')} at {b.get('appointmentTime')} (Status: {b.get('status')})")
            return f"Bookings for {customer_phone}:\n" + "\n".join(summary)
        return f"Could not retrieve booking history for {customer_phone}."
    except Exception as e:
        return f"Error retrieving booking history: {str(e)}"
