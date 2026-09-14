import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
from tools import check_available_services, book_appointment

load_dotenv()

# 1. Initialize Gemini LLM
llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash-lite")

# 2. Embeddings Model
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# 3. Setup Paths
current_dir = os.path.dirname(os.path.abspath(__file__))
knowledge_file_path = os.path.join(current_dir, "salon_knowledge.txt")
persist_directory = os.path.join(current_dir, "chroma_db")

# 4. Load & Embed Data into Chroma Vector DB
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

# 5. Bind Tools with LLM
tools = [check_available_services, book_appointment]
tool_map = {t.name: t for t in tools}
llm_with_tools = llm.bind_tools(tools)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def extract_text_from_content(content):
    """Extract clean string text from LLM response content."""
    if isinstance(content, str):
        return content
    elif isinstance(content, list):
        text_blocks = [block.get('text', '') for block in content if isinstance(block, dict) and 'text' in block]
        return "".join(text_blocks) if text_blocks else str(content)
    return str(content)

def get_ai_response(user_message: str, history=None) -> str:
    """Retrieves context, constructs conversation with tools, and executes actions."""
    # 1. Retrieve knowledge from Chroma
    docs = retriever.invoke(user_message)
    context_text = format_docs(docs)
    
    # 2. System Instructions
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
    
    # 3. Add History Messages
    if history:
        for msg in history[-6:]:
            role = getattr(msg, 'sender', None) or (isinstance(msg, dict) and msg.get('sender'))
            text = getattr(msg, 'text', None) or (isinstance(msg, dict) and msg.get('text', '')) or str(msg)
            if role == 'user':
                messages.append(HumanMessage(content=text))
            else:
                messages.append(AIMessage(content=text))
                
    # 4. Add Current User Message
    messages.append(HumanMessage(content=user_message))
    
    # 5. Invoke LLM with Tool Calling
    response = llm_with_tools.invoke(messages)
    
    # 6. If LLM requested Tool Calls, execute tools and follow up
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
    
    return extract_text_from_content(response.content)
