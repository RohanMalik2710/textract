from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_google_genai import ChatGoogleGenerativeAI
import pdfplumber
import re
from fuzzywuzzy import fuzz
import os

app = Flask(__name__)
CORS(app)  # Allow CORS for all routes

# Set your Google API key
os.environ["GOOGLE_API_KEY"] = "AIzaSyCvZ77nBl6U4gW5qUklausueeddTu91tho"  # Replace with your actual key

# Function to clean text
def clean_text(text):
    return re.sub(r'\s+', ' ', text).strip().lower()

# Function to find the relevant page in the PDF
def find_page_with_answer(pdf_file, answer):
    answer = clean_text(answer)
    with pdfplumber.open(pdf_file) as pdf:
        best_match = None
        best_score = 0
        best_page = None
        for page_num, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                cleaned_text = clean_text(text)
                score = fuzz.partial_ratio(answer, cleaned_text)
                if score > best_score:
                    best_score = score
                    best_match = text
                    best_page = page_num + 1
        return best_page, best_match

# Function to refine search for specific text
def find_specific_text_on_page(page_text, search_text):
    search_text = clean_text(search_text)
    cleaned_page_text = clean_text(page_text)
    
    best_score = 0
    best_match = None
    for i in range(0, len(cleaned_page_text) - len(search_text)):
        snippet = cleaned_page_text[i:i+len(search_text)]
        score = fuzz.ratio(search_text, snippet)
        if score > best_score:
            best_score = score
            best_match = snippet
    return best_match

@app.route('/process_pdf', methods=['POST'])
def process_pdf():
    if 'pdf_file' not in request.files:
        return jsonify({"error": "No PDF file uploaded"}), 400
    
    pdf_file = request.files['pdf_file']  # Get the uploaded PDF file
    queries = request.form.get('queries')
    queries = eval(queries)  # Convert the string to list

    # Load the PDF file and extract text
    pdfreader = PdfReader(pdf_file)
    raw_text = ''
    for i, page in enumerate(pdfreader.pages):
        content = page.extract_text()
        if content:
            raw_text += content

    # Split the text into chunks
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=600,
        chunk_overlap=300,
        length_function=len,
    )
    texts = text_splitter.split_text(raw_text)

    # Initialize Google Generative AI embeddings
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

    # Create the FAISS vector store
    document_search = FAISS.from_texts(texts, embeddings)

    # Initialize Gemini Pro as the language model
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro")

    # Set up the QA chain with retrieval
    chain = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=document_search.as_retriever())

    responses = []

    # Process each query
    for query in queries:
        answer = chain.invoke({"query": query})['result']
        page, page_text = find_page_with_answer(pdf_file, answer)
        
        if page_text:
            search_text = ' '.join(answer.split()[:7])
            matched_text = find_specific_text_on_page(page_text, search_text)
            responses.append({
                "query": query,
                "answer": answer,
                "page": page,
                "matched_text": matched_text
            })
        else:
            responses.append({
                "query": query,
                "answer": answer,
                "page": None,
                "message": "No matching text found in the PDF."
            })

    return jsonify(responses)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
