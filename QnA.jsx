import React, { useState } from 'react';
import stars from '../assets/star.jpg';

function QnA() {
    const [file, setFile] = useState(null);
    const [queries, setQueries] = useState([]);
    const [queryInput, setQueryInput] = useState('');
    const [results, setResults] = useState([]);

    // Function to handle adding queries to the list
    const addQuery = () => {
      setQueries([...queries, queryInput]);
      setQueryInput('');
    };

    // Function to handle file selection
    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    };

    // Function to submit the queries and selected file
    const submitQueries = async () => {
        const formData = new FormData();
        formData.append('pdf_file', file); // File selected by the user
        formData.append('queries', JSON.stringify(queries)); // Queries array as a string
    
        const response = await fetch('http://localhost:5000/process_pdf', {
          method: 'POST',
          body: formData, // Sending the file and queries
        });
    
        const data = await response.json();
        setResults(data);
    };


    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6"
           style={{ backgroundImage: `url(${stars})`, backgroundSize: '100%', backgroundRepeat: 'no-repeat' }}>
        <div className="bg-gray-900 bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h1 className="text-3xl font-bold text-center mb-6">PDF Query Processor</h1>
          
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files[0])} // Set the selected file to state
            className="w-full p-3 mb-4 bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <input 
            type="text" 
            placeholder="Enter your query" 
            value={queryInput} 
            onChange={(e) => setQueryInput(e.target.value)} 
            className="w-full p-3 mb-4 bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          
          <button 
            onClick={addQuery} 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out">
            Add Query
          </button>

          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-3">Queries:</h3>
            <ul className="list-disc list-inside space-y-2">
              {queries.map((query, index) => (
                <li key={index} className="text-gray-300">{query}</li>
              ))}
            </ul>
          </div>
          
          <button 
            onClick={submitQueries} 
            className="w-full mt-6 bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out">
            Submit Queries
          </button>

          <h2 className="text-2xl font-bold mt-8">Results</h2>
          <ul className="space-y-4 mt-4">
            {results.map((result, index) => (
              <li key={index} className="bg-gray-800 p-4 rounded-lg">
                <strong className="text-indigo-400">Query:</strong> {result.query} <br />
                <strong className="text-green-400">Answer:</strong> {result.answer} <br />
                {result.matched_text ? (
                  <div>
                    <strong className="text-yellow-400">Matched Text:</strong> {result.matched_text} <br />
                    <strong className="text-blue-400">Page:</strong> {result.page}
                  </div>
                ) : (
                  <p className="text-red-400">No matching text found.</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
}

export default QnA;
