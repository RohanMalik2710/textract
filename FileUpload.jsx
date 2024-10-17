import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import axios from 'axios';
import fetchMotivation from '../gemini'; // Adjust the path as necessary

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [embeddings, setEmbeddings] = useState([]);
  const [questions, setQuestions] = useState(''); // New state for introspective questions

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    extractTextFromPdf(selectedFile);
  };

  const extractTextFromPdf = (pdfFile) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(pdfFile);
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;

      let extractedText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        extractedText += `Page ${i}:\n${pageText}\n\n`;
      }
      setPdfText(extractedText);
      generateEmbeddings(extractedText);
    };
  };

  const generateEmbeddings = async (text) => {
    const contextSize = 200; // Limiting context size to 200 characters per chunk
    const chunks = splitTextIntoChunks(text, contextSize);

    // Make API call to Cohere for embeddings
    try {
      const embeddingPromises = chunks.map(async (chunk) => {
        const response = await getEmbeddingFromCohere(chunk);
        return response.data.embeddings[0];
      });

      const embeddingsResult = await Promise.all(embeddingPromises);
      const embeddingData = chunks.map((chunk, index) => ({
        chunkIndex: index + 1,
        embedding: embeddingsResult[index]
      }));

      setEmbeddings(embeddingData);


      // Fetch introspective questions using the embeddings
      fetchMotivation({
        embeddings: embeddingData.map(item => item.embedding),
        pdfText: pdfText, // Pass embeddings as input
        setQuestions: setQuestions // Set questions in state
      });
    } catch (error) {
      console.error('Error generating embeddings:', error);
    }
  };

  const getEmbeddingFromCohere = async (text) => {
    const apiKey = 'hVPrMCHfh5Hx3RvWXj5t6LDqmLzc3eWI0RXoPInN'; // Replace with your actual API key from Cohere
    const response = await axios.post(
      'https://api.cohere.ai/v1/embed',
      {
        texts: [text], // You can send multiple texts here as an array
        model: 'small', // Use a small model to reduce API cost
        truncate: 'LEFT' // This truncates long text from the left if it exceeds model capacity
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response;
  };

  const splitTextIntoChunks = (text, size) => {
    const regex = new RegExp(`(.{1,${size}})(\\s|$)`, 'g');
    return text.match(regex) || [];
  };

  return (
    <div className="mt-8 flex flex-col items-center">
      <form className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-white text-xl mb-4">Upload your PDF file</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="text-white bg-gray-900 p-2 rounded mb-4 w-full"
        />
      </form>
      
      {pdfText && (
        <div className="bg-gray-700 p-6 mt-6 rounded-lg w-full max-w-2xl shadow-lg">
          <h3 className="text-white text-xl mb-4">PDF Preview:</h3>
          <pre className="text-gray-300 whitespace-pre-wrap overflow-y-auto max-h-96">{pdfText}</pre>
        </div>
      )}
      
      {embeddings.length > 0 && (
        <div className="bg-gray-800 p-6 mt-6 rounded-lg w-full max-w-2xl shadow-lg">
          <h3 className="text-white text-xl mb-4">Embeddings Preview (Cohere):</h3>
          {embeddings.map((item) => (
            <div key={item.chunkIndex} className="mb-4">
              <p className="text-gray-400">Chunk {item.chunkIndex} Embedding:</p>
              <pre className="text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(item.embedding.slice(0, 10))}... {/* Show only part of the embedding */}
              </pre>
            </div>
          ))}
        </div>
      )}

      {questions && (
        <div className="bg-gray-800 p-6 mt-6 rounded-lg w-full max-w-2xl shadow-lg">
          <h3 className="text-white text-xl mb-4">Introspective Questions:</h3>
          <ul className="text-gray-300">
            {questions.split('\n').map((question, index) => (
              <li key={index} className="mb-2">{question}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
