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
            return f"Available Services: {', '.join([s['name'] + ' (LKR ' + str(s['price']) + ')' for s in services])}"
        return "Could not retrieve services from booking service."
    except Exception as e:
        return f"Error connecting to booking service: {str(e)}"

@tool
def book_appointment(customer_name: str, service_name: str, appointment_date: str, appointment_time: str, customer_phone: str):
    """
    Books an appointment for a customer in the salon booking system.
    Args:
        customer_name: Name of the customer (e.g., 'Kasun Perera')
        service_name: Name of the service requested (e.g., 'Men\'s Haircut', 'Keratin Treatment')
        appointment_date: Date of appointment (e.g., '2026-09-15' or 'Tomorrow')
        appointment_time: Preferred time (e.g., '10:00 AM', '02:30 PM')
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
