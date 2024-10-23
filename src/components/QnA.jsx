import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import stars from '../assets/star.jpg';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase.config';
import { useUser } from './UserContext';
import "../qna.css";

const PDFPreview = React.memo(({ file }) => {
  if (!file) {
    return <div className="text-center text-gray-400 neon-text">No PDF selected.</div>;
  }
  return (
    <embed
      src={URL.createObjectURL(file)}
      type="application/pdf"
      className="w-full h-[500px] border border-gray-600 rounded-lg shadow-md"
    />
  );
});

function QnA() {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useUser();
  const { user, setUser } = useUser();
  const [userData, setUserData] = useState(null);
  const [file, setFile] = useState(null);
  const [queries, setQueries] = useState([]);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [queryInput, setQueryInput] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qnaData, setQnaData] = useState({ pdf_embedding: null });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login'); 
      return; 
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        alert('User Found!'); 
        setIsLoggedIn(true);
        setUser(user);

        const docRef = doc(db, 'users', user.uid);
        const fetchData = async () => {
          try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserData(docSnap.data());
            }
          } catch (error) {
            console.error('Error fetching user data:', error.message);
          } finally {
            setLoading(false);
          }
        };
        fetchData();
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isLoggedIn, setIsLoggedIn, navigate, setUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error logging out: ', error.message);
    }
  };

  const addQuery = () => {
    if (queryInput) {
      setQueries((prevQueries) => [...prevQueries, queryInput]);
      setQueryInput('');
    }
  };

  const addGeneratedQuery = (question) => {
    setQueries((prevQueries) => [...prevQueries, question]);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const submitQueries = async () => {
    const formData = new FormData();
    formData.append('pdf_file', file);
    formData.append('queries', JSON.stringify(queries));

    try {
      const response = await fetch('http://localhost:5000/process_pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Response from server:', data); 

      setResults(data.responses);
      if (data.generated_questions) {
        setGeneratedQuestions(data.generated_questions);
      }
      if (data.pdf_embedding) {
        setQnaData({ pdf_embedding: data.pdf_embedding });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6"
      style={{
        backgroundImage: `url(${stars})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="flex flex-row w-full mt-8 space-x-8">
        {/* Left Section - PDF Preview */}
        <div className="w-1/2 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 transition-transform transform hover:scale-105">
          <h2 className="text-2xl font-bold text-center mb-4 neon-text">PDF Preview</h2>
          <PDFPreview file={file} />
          <input
            type="file"
            onChange={handleFileChange}
            className="mt-4 w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 neon-border"
          />
          <div className="my-8 bg-gray-900 p-2 rounded border border-gray-700 shadow-md">
            <strong className="text-yellow-400">PDF Embedding:</strong> 
            <pre className="mt-4 mb-4 max-h-60 overflow-y-auto bg-gray-900 p-2 rounded border border-gray-700">{JSON.stringify(qnaData.pdf_embedding, null, 2)}</pre>
          </div>
        </div>

        {/* Right Section - Q&A */}
        <div className="w-1/2 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 transition-transform transform hover:scale-105">
          <h2 className="text-2xl font-bold text-center mb-4 neon-text">Query Processor</h2>
          <input
            type="text"
            placeholder="Enter your query"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 neon-border mb-4"
          />
          <button
            onClick={addQuery}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 rounded-lg transition-all neon-border"
          >
            Add Query
          </button>

          <div className="mt-6">
            <h3 className="text-lg font-semibold neon-text">Generated Questions:</h3>
            <ul className="list-disc list-inside space-y-2 mt-2 text-white">
              {generatedQuestions.map((question, index) => (
                <li key={index} className="flex justify-between items-center hover:bg-gray-800 p-2 rounded">
                  {question}
                  <div className='flex'>
                    <button
                      onClick={() => addGeneratedQuery(question)}
                      className="ml-4 text-blue-300 py-1 pl-3 rounded-lg hover:text-blue-200 transition-all"
                    >
                      ↘️
                    </button>
                    <button
                      onClick={() => addGeneratedQuery(question)}
                      className="ml-1.5 underline text-blue-300 py-1 pr-3 rounded-lg hover:text-blue-200 transition-all"
                    >
                      use
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold neon-text">Custom Queries:</h3>
            <ul className="list-disc list-inside space-y-2 mt-2 text-white">
              {queries.map((query, index) => (
                <li key={index} className="hover:bg-gray-800 p-2 rounded">{query}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={submitQueries}
            className="w-full mt-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-teal-500 hover:to-green-500 text-white py-3 rounded-lg neon-border transition-all"
          >
            Submit Queries
          </button>

          <div className="mt-8">
            <h3 className="text-lg font-semibold neon-text">Results:</h3>
            <ul className="space-y-4 mt-4 text-gray-200">
              {results.map((result, index) => (
                <li key={index} className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-600 transition-transform transform hover:scale-105">
                  <div className="my-4 max-h-32 overflow-y-auto bg-gray-900 p-2 rounded border border-gray-700">
                    <strong className="text-indigo-400">Query:</strong> {result.query}
                  </div>
                  <div className="mt-4 bg-gray-900 p-2 rounded border border-gray-700">
                    <strong className="text-green-400">Answer:</strong> {result.answer}
                  </div>
                  <br />
                  <div className="-mt-2 mb-4 max-h-32 overflow-y-auto bg-gray-900 p-2 rounded border border-gray-700">
                    <strong className="text-yellow-400">Answer Embedding:</strong> 
                    <pre className="mt-4">{JSON.stringify(result.embedding, null, 2)}</pre>
                  </div>
                  {result.matched_text && (
                    <div>
                      <div className="my-4 bg-gray-900 p-2 rounded border border-gray-700">
                        <strong className="text-yellow-400">Matched Text:</strong> {result.matched_text}
                      </div>
                      <div className="my-4 bg-gray-900 p-2 rounded border border-gray-700">
                        <strong className="text-blue-400">Page:</strong> {result.page}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <button onClick={handleLogout} className="absolute top-4 right-8 bg-blue-800 hover:bg-blue-500 text-white py-2 px-4 rounded-lg transition-transform transform hover:scale-110">
        Logout
      </button>
    </div>
  );
}

export default QnA;
