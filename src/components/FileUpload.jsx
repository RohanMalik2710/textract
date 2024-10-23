import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import axios from 'axios';
import fetchMotivation from '../gemini'; // Adjust the path as necessary

const FileUpload = ({ input_file }) => {
  const [file, setFile] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [embeddings, setEmbeddings] = useState([]);
  const [questions, setQuestions] = useState(''); // New state for introspective questions

  useEffect(() => {
    if (input_file) {
      setFile(input_file); // Set file when input_file changes
      extractTextFromPdf(input_file);
    }
  }, [input_file]);

  const extractTextFromPdf = async (pdfFile) => {
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

    console.log('Chunks to send for embeddings:', chunks); // Log the chunks

    try {
      const embeddingsResult = await getBatchEmbeddings(chunks);
      const embeddingData = chunks.map((chunk, index) => ({
        chunkIndex: index + 1,
        embedding: embeddingsResult[index]
      }));
      setEmbeddings(embeddingData);

      // Fetch introspective questions using the embeddings
      fetchMotivation({
        embeddings: embeddingData.map(item => item.embedding),
        pdfText: pdfText,
        setQuestions: setQuestions
      });
    } catch (error) {
      console.error('Error generating embeddings:', error);
    }
  };

  const getBatchEmbeddings = async (chunks) => {
    const results = [];
    const batchSize = 5; // Adjust based on your needs

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      console.log(`Processing batch: ${Math.floor(i / batchSize) + 1}`, batch); // Log the current batch

      try {
        const embeddings = await getEmbeddingFromServer(batch);
        results.push(...embeddings);
      } catch (error) {
        console.error('Failed to get embeddings for batch:', error);
      }
    }
    return results;
  };

  const getEmbeddingFromServer = async (batch) => {
    // Send request to your Flask server to get embeddings
    const response = await axios.post('http://localhost:5000/embeddings', { texts: batch });
    return response.data.embeddings;
  };

  const splitTextIntoChunks = (text, size) => {
    const regex = new RegExp(`.{1,${size}}(\\s|$)`, 'g');
    return text.match(regex) || [];
  };

  return (
    <div className="mt-8 flex flex-col items-center">
      {embeddings.length > 0 && (
        <div className="bg-gray-800 p-6 mt-6 rounded-lg w-full max-w-2xl shadow-lg">
          <h3 className="text-white font-thin text-xl mb-4">Vector Embeddings Preview:</h3>
          {embeddings.map((item) => (
            <div key={item.chunkIndex} className="mb-4">
              <p className="text-gray-400 font-thin">Chunk {item.chunkIndex} Embedding:</p>
              <pre className="text-gray-300 whitespace-pre-wrap max-w-full overflow-x-auto">
                {JSON.stringify(item.embedding.slice(0, 10))}...
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
