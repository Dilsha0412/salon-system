import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

load_dotenv()
llm = ChatGoogleGenerativeAI(model="gemini-3.7-flash", temperature=0.3)

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Dummy Data
salon_data = [
    "A haircut at our salon costs LKR 1500.",
    "The Keratin treatment costs LKR 8000 and takes approximately 2 hours.",
    "The salon is open daily from 9:00 AM to 7:00 PM."
]
vectorstore = Chroma.from_texts(texts=salon_data, embedding=embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 2})

prompt_template = """
You are a friendly and professional AI receptionist working for 'ELIX Salon'. 
Use the provided context to answer the customer's question accurately. 
If the information is not present in the context, politely respond with: "I'm sorry, I don't have that exact information. Please call the salon directly for further assistance." 
Do not invent or fabricate any information.

Context: {context}
Customer Question: {question}
Answer:"""

PROMPT = PromptTemplate(template=prompt_template, input_variables=["context", "question"])

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# Configure the RAG System
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | PROMPT
    | llm
    | StrOutputParser()
)

def get_ai_response(user_message: str):
    """Retrieves context from the vector database and generates an AI response."""
    return rag_chain.invoke(user_message)
