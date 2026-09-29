import os
import warnings
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

# Initialize Gemini LLM with fast timeout
gemini_model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
llm = None
try:
    if os.getenv("GOOGLE_API_KEY"):
        llm = ChatGoogleGenerativeAI(
            model=gemini_model,
            timeout=5,
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
        ["Salona Beauty & Hair Studio is open daily from 9:00 AM to 8:00 PM."],
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
llm_with_tools = llm.bind_tools(tools) if llm else None


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


def generate_knowledge_fallback(user_message: str, docs, history=None) -> str:
    """Intelligent instant fallback using Chroma Vector RAG & Database tools."""
    msg_lower = user_message.lower().strip()
    
    # 1. Location / Hours / Contact query
    if any(w in msg_lower for w in ["hour", "time", "open", "close", "where", "location", "address", "phone", "contact", "parking", "whatsapp"]):
        return (
            "📍 **Salona Beauty & Hair Studio**\n"
            "- **Address**: No. 58, Temple Road, Kelaniya, Sri Lanka\n"
            "- **Opening Hours**: Open 7 days a week from 9:00 AM to 8:00 PM\n"
            "- **Hotline**: +94 11 234 5678 | WhatsApp: +94 77 522 7202\n"
            "- **Facilities**: Free customer parking, AC waiting lounge, High-Speed Wi-Fi, Card payments accepted."
        )

    # 2. Haircut / Styling / Treatments query
    if any(w in msg_lower for w in ["hair", "haircut", "styling", "cut", "color", "colour", "keratin", "spa", "beard", "clean", "facial", "price", "cost", "rate", "bridal", "package", "offer", "discount", "threading", "waxing", "manicure", "pedicure"]):
        context = format_docs(docs)
        if not context:
            context = "- Men's Classic Haircut: LKR 1,500\n- Women's Haircut & Blow Dry: LKR 2,800\n- Keratin Treatment: LKR 10,000 - 18,000\n- Herbal Gold Facial: LKR 5,000"
        return (
            f"✨ **Salona Hair & Beauty Services**:\n\n{context}\n\n"
            f"Would you like to book a slot for this? Just tell me your **Name, Preferred Date & Time**, and your **Contact Number**!"
        )

    # 3. Booking Intent
    if any(w in msg_lower for w in ["book", "appointment", "reserve", "slot", "schedule"]):
        return (
            "I'd be delighted to book your appointment! 💇‍♀️✨\n\n"
            "Please provide:\n"
            "1. **Your Name**\n"
            "2. **Service** (e.g. Men's Haircut, Women's Styling, Gold Facial)\n"
            "3. **Preferred Date & Time** (Daily between 9:00 AM - 8:00 PM)\n"
            "4. **Phone Number**\n\n"
            "I will immediately confirm your reservation!"
        )

    # 4. Stylist Query
    if any(w in msg_lower for w in ["stylist", "staff", "specialist", "barber", "beautician"]):
        try:
            stylists_info = check_available_stylists.invoke({})
            return f"💇‍♂️ **Our Expert Team**:\n{stylists_info}\n\nWould you like to book an appointment with any of our stylists?"
        except Exception:
            return "Our expert salon stylists are available daily for all hair, beauty, and grooming treatments. How can I assist you today?"

    # 5. General Context Fallback from Chroma RAG
    context = format_docs(docs)
    if context:
        return f"Welcome to Salona Studio! Here are the details you requested:\n\n{context}\n\nHow else can I assist you today?"

    return "Welcome to Salona Beauty & Hair Studio! We are open daily from 9:00 AM to 8:00 PM. How may I assist you with treatments, styling, or bookings today?"


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
            system_prompt = f"""You are a warm, friendly, and professional AI receptionist for 'Salona Beauty & Hair Studio'.

Your Responsibilities:
1. Answer customer questions about salon services, treatments, prices in LKR, durations, offers, and policies using the Salon Knowledge Context below.
2. HELP CUSTOMERS BOOK APPOINTMENTS:
   - When a customer wants to book, gather: Customer Name, Service Requested, Date, Time, and Contact Phone Number.
   - If any of these are missing, politely ask the customer for the missing details.
   - When all details are present, automatically call the `book_appointment` tool.
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

    # Resilient Instant Fallback from Salon Knowledge & Chroma Vector Store
    return generate_knowledge_fallback(user_message, docs, history)
