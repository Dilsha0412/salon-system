import os
import re
import warnings
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Filter unnecessary library deprecation logs
warnings.filterwarnings("ignore")

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
from tools import (
    check_available_services,
    check_available_stylists,
    check_available_slots,
    book_appointment,
    get_customer_bookings
)

load_dotenv()

# Initialize Gemini LLM with supported models and fast timeout
gemini_model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
llm = None
try:
    api_key = os.getenv("GOOGLE_API_KEY")
    if api_key:
        llm = ChatGoogleGenerativeAI(
            model=gemini_model,
            google_api_key=api_key,
            timeout=10,
            max_retries=1
        )
except Exception as e:
    print(f"Warning: Could not initialize Gemini LLM: {e}")

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

current_dir = os.path.dirname(os.path.abspath(__file__))
knowledge_file_path = os.path.join(current_dir, "salon_knowledge.txt")
persist_directory = os.path.join(current_dir, "chroma_db")

# Load & Embed Data into Chroma Vector DB
if os.path.exists(persist_directory) and len(os.listdir(persist_directory)) > 0:
    vectorstore = Chroma(
        persist_directory=persist_directory,
        embedding_function=embeddings
    )
elif os.path.exists(knowledge_file_path):
    loader = TextLoader(knowledge_file_path, encoding="utf-8")
    raw_documents = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=350,
        chunk_overlap=50,
        separators=["\n\n", "\n", " ", ""]
    )
    docs = text_splitter.split_documents(raw_documents)
    
    vectorstore = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        persist_directory=persist_directory
    )
else:
    vectorstore = Chroma.from_texts(
        ["Luméra Luxury Hair & Beauty Studio is open daily from 9:00 AM to 8:00 PM."],
        embedding=embeddings
    )

retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# Bind All Tools with LLM
tools = [
    check_available_services,
    check_available_stylists,
    check_available_slots,
    book_appointment,
    get_customer_bookings
]
tool_map = {t.name: t for t in tools}
llm_with_tools = None
if llm:
    try:
        llm_with_tools = llm.bind_tools(tools)
    except Exception as e:
        print(f"Warning: Tool binding failed: {e}")


def format_docs(docs):
    """Cleanly formats and deduplicates context lines from retrieved documents."""
    seen = set()
    lines = []
    for doc in docs:
        for line in doc.page_content.split("\n"):
            trimmed = line.strip()
            if trimmed and trimmed not in seen:
                seen.add(trimmed)
                lines.append(trimmed)
    return "\n".join(lines)


def extract_text_from_content(content):
    """Extract clean string text from LLM response content."""
    if isinstance(content, str):
        return content
    elif isinstance(content, list):
        text_blocks = [block.get('text', '') for block in content if isinstance(block, dict) and 'text' in block]
        return "".join(text_blocks) if text_blocks else str(content)
    return str(content)


def parse_target_date(text: str) -> str:
    """Parses relative and absolute date strings into YYYY-MM-DD."""
    today = datetime.now()
    text_lower = text.lower()
    
    if "tomorrow" in text_lower or "tommorow" in text_lower or "tmrw" in text_lower:
        target = today + timedelta(days=1)
        return target.strftime("%Y-%m-%d")
    elif "day after tomorrow" in text_lower:
        target = today + timedelta(days=2)
        return target.strftime("%Y-%m-%d")
    elif "today" in text_lower or "tonight" in text_lower:
        return today.strftime("%Y-%m-%d")
    
    # Check for YYYY-MM-DD
    match = re.search(r'\b(\d{4}-\d{2}-\d{2})\b', text)
    if match:
        return match.group(1)
        
    # Default to tomorrow if future inquiry, else today
    return (today + timedelta(days=1)).strftime("%Y-%m-%d")


def parse_target_time(text: str) -> str:
    """Detects target time like '3 pm', '03:00 PM', '10 am', '11:30'."""
    text_lower = text.lower()
    match = re.search(r'\b(0?[1-9]|1[0-2])(?::([0-5]\d))?\s*(am|pm)\b', text_lower)
    if match:
        hour = int(match.group(1))
        minute = match.group(2) or "00"
        ampm = match.group(3).upper()
        return f"{hour:02d}:{minute} {ampm}"
    return ""


def generate_knowledge_fallback(user_message: str, docs, history=None) -> str:
    """Intelligent dynamic fallback combining RAG, tool calling, and live database queries."""
    msg_lower = user_message.lower().strip()
    
    # 1. Slot Availability & Specific Time Inquiries
    if any(w in msg_lower for w in ["slot", "available", "free time", "opening", "vacancy", "appointment at", "slot available"]):
        target_date = parse_target_date(user_message)
        requested_time = parse_target_time(user_message)
        
        try:
            slots_response = check_available_slots.invoke({"appointment_date": target_date})
            
            # If user asked about a specific time
            if requested_time:
                # Standardize 03:00 PM or 3:00 PM
                is_available = requested_time in slots_response or requested_time.lstrip("0") in slots_response
                if is_available:
                    return (
                        f"✨ **Yes!** The **{requested_time}** slot is currently **AVAILABLE** for **{target_date}** at Luméra Studio!\n\n"
                        f"Would you like me to reserve this for you? Please provide:\n"
                        f"1. **Your Name**\n"
                        f"2. **Selected Treatment** (e.g. Haircut & Styling, Balayage, Facial)\n"
                        f"3. **Contact Phone Number**"
                    )
                else:
                    return (
                        f"⚠️ The **{requested_time}** slot is currently occupied for **{target_date}**.\n\n"
                        f"📅 **Other available slots for {target_date}:**\n"
                        f"{slots_response}\n\n"
                        f"Would you like to book any of these available times instead?"
                    )
            
            # General slot check for date
            return (
                f"📅 **Available Appointment Slots for {target_date}:**\n\n"
                f"{slots_response}\n\n"
                f"Which time slot works best for you? You can reply with your preferred time and contact details to book."
            )
        except Exception as e:
            return f"📅 Our appointments are open daily from 9:00 AM to 8:00 PM. Available slots for {target_date}: 09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM, 03:00 PM, 04:00 PM, 05:00 PM."

    # 2. Check Customer Bookings by phone
    phone_match = re.search(r'\b(07\d{8}|\+94\d{9})\b', user_message)
    if phone_match and any(w in msg_lower for w in ["my booking", "my appointment", "history", "check booking", "status"]):
        try:
            return get_customer_bookings.invoke({"customer_phone": phone_match.group(1)})
        except Exception:
            pass

    # 3. Direct Booking execution if all details are supplied
    if any(w in msg_lower for w in ["book", "reserve", "schedule"]) and phone_match:
        phone = phone_match.group(1)
        target_date = parse_target_date(user_message)
        target_time = parse_target_time(user_message) or "10:00 AM"
        
        # Detect service
        service = "Signature Haircut & Styling"
        if "color" in msg_lower or "colour" in msg_lower or "balayage" in msg_lower:
            service = "Balayage & Color Gloss"
        elif "facial" in msg_lower:
            service = "Herbal Gold Facial"
        elif "keratin" in msg_lower:
            service = "Keratin Smoothing Therapy"
            
        try:
            booking_res = book_appointment.invoke({
                "customer_name": "Valued Guest",
                "service_name": service,
                "appointment_date": target_date,
                "appointment_time": target_time,
                "customer_phone": phone
            })
            return f"🎉 {booking_res}"
        except Exception as e:
            pass

    # 4. Stylist Query
    if any(w in msg_lower for w in ["stylist", "staff", "specialist", "barber", "beautician", "who"]):
        try:
            stylists_info = check_available_stylists.invoke({})
            return f"💇‍♂️ **Luméra Master Stylists**:\n\n{stylists_info}\n\nWould you like to book an appointment with any of our master stylists?"
        except Exception:
            return "Our expert Luméra stylists are available daily for all hair, beauty, and grooming treatments. How can I assist you today?"

    # 5. Location / Hours / Contact query
    if any(w in msg_lower for w in ["hour", "time", "open", "close", "where", "location", "address", "phone", "contact", "parking", "whatsapp"]):
        return (
            "📍 **Luméra Luxury Hair & Beauty Studio**\n"
            "- **Address**: No. 58, Temple Road, Kelaniya, Sri Lanka\n"
            "- **Opening Hours**: Open 7 days a week from 9:00 AM to 8:00 PM\n"
            "- **Hotline**: +94 11 234 5678 | WhatsApp: +94 77 522 7202\n"
            "- **Facilities**: Free customer parking, AC VIP lounge, High-Speed Wi-Fi, Card & contactless payments accepted."
        )

    # 6. Haircut / Styling / Treatments query
    if any(w in msg_lower for w in ["hair", "haircut", "styling", "cut", "color", "colour", "keratin", "spa", "beard", "clean", "facial", "price", "cost", "rate", "bridal", "package", "offer", "discount", "threading", "waxing", "manicure", "pedicure", "treatment", "service"]):
        try:
            live_services = check_available_services.invoke({})
            if "Available Services:" in live_services:
                return (
                    f"✨ **Luméra Hair & Beauty Treatments**:\n\n{live_services}\n\n"
                    f"Would you like to check available slots or book any of these treatments?"
                )
        except Exception:
            pass
        context = format_docs(docs)
        if not context:
            context = "- Signature Haircut & Styling: LKR 2,500\n- Balayage & Color Gloss: LKR 14,500\n- Herbal Gold Facial: LKR 5,000\n- Keratin Smoothing Therapy: LKR 12,000"
        return (
            f"✨ **Luméra Hair & Beauty Treatments**:\n\n{context}\n\n"
            f"Would you like to book a slot for this? Just let me know your preferred date and time!"
        )

    # 7. General Booking Instructions
    if any(w in msg_lower for w in ["book", "appointment", "reserve", "reservation", "schedule"]):
        return (
            "I'd be delighted to assist you with booking an appointment at Luméra! 💇‍♀️✨\n\n"
            "Please let me know:\n"
            "1. **Your Name**\n"
            "2. **Preferred Treatment** (e.g. Haircut, Color, Facial, Spa)\n"
            "3. **Preferred Date & Time** (Daily between 9:00 AM - 8:00 PM)\n"
            "4. **Phone Number**\n\n"
            "I can check slot availability or confirm your booking immediately!"
        )

    # 8. General Context Fallback from Chroma RAG
    context = format_docs(docs)
    if context:
        return f"Welcome to Luméra Studio! Here are the details you requested:\n\n{context}\n\nHow else may I assist you today?"

    return "Welcome to Luméra Luxury Hair & Beauty Studio! We are open daily from 9:00 AM to 8:00 PM. How may I assist you with treatments, slots, or bookings today?"


def get_ai_response(user_message: str, history=None) -> str:
    """Retrieves context, constructs conversation with tools, and executes actions with instant resilient fallback."""
    try:
        docs = retriever.invoke(user_message)
    except Exception:
        docs = []

    context_text = format_docs(docs)
    
    # If LLM is available, try invoking with fast timeout
    if llm_with_tools:
        try:
            system_prompt = f"""You are a warm, friendly, and professional AI receptionist for 'Luméra Luxury Hair & Beauty Studio'.

Your Responsibilities:
1. Answer customer questions about salon services, treatments, prices in LKR, durations, offers, and policies using the Salon Knowledge Context below.
2. CHECK AVAILABILITY: When a customer asks about a slot or time (e.g. 'is there any slot available in tommorow 3 pm'), call `check_available_slots` for that date and answer specifically if that time is available.
3. HELP CUSTOMERS BOOK APPOINTMENTS:
   - When a customer wants to book, gather: Customer Name, Service Requested, Date, Time, and Contact Phone Number.
   - If all details are present, automatically call the `book_appointment` tool.
   - After booking, give them a warm confirmation with the Reference Booking ID returned by the tool.

Salon Knowledge Context:
{context_text}
"""
            messages = [SystemMessage(content=system_prompt)]
            
            if history:
                for msg in history[-4:]:
                    role = getattr(msg, 'sender', None) or (isinstance(msg, dict) and msg.get('sender'))
                    text = getattr(msg, 'text', None) or (isinstance(msg, dict) and msg.get('text', '')) or str(msg)
                    if role == 'user':
                        messages.append(HumanMessage(content=text))
                    else:
                        messages.append(AIMessage(content=text))
                        
            messages.append(HumanMessage(content=user_message))
            
            response = llm_with_tools.invoke(messages)
            
            if response.tool_calls:
                messages.append(response)
                
                for tool_call in response.tool_calls:
                    tool_name = tool_call["name"]
                    tool_args = tool_call["args"]
                    tool_id = tool_call["id"]
                    
                    if tool_name in tool_map:
                        try:
                            tool_output = tool_map[tool_name].invoke(tool_args)
                        except Exception as err:
                            tool_output = f"Error executing {tool_name}: {str(err)}"
                        
                        messages.append(ToolMessage(content=str(tool_output), tool_call_id=tool_id))
                
                final_response = llm.invoke(messages)
                return extract_text_from_content(final_response.content)
            
            extracted = extract_text_from_content(response.content)
            if extracted and len(extracted.strip()) > 0:
                return extracted
        except Exception as llm_err:
            print(f"LLM Error/Timeout (Gracefully using Salon Knowledge Engine fallback): {llm_err}")

    # Resilient Instant Fallback from Salon Knowledge & Live Database Tools
    return generate_knowledge_fallback(user_message, docs, history)
