import { GoogleGenerativeAI } from "@google/generative-ai";

const fetchMotivation = async ({ embeddings, pdfText, setQuestions }) => {
  console.log("Embeddings:", embeddings);
  console.log("PDF Text:", pdfText);

  if (!pdfText) {
    console.error("No PDF text available");
    setQuestions('No text available for generating questions.');
    return;
  }

  const apiKey = 'AIzaSyCFHMFx3vK9EibWtrOZ3Ve90Jk2NCJACtw'; // Replace with your actual Google Generative AI API key
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const generationConfig = {
    temperature: 0.7, // Adjust for creativity
    topP: 0.95,
    topK: 50,
    maxOutputTokens: 150, // Limit the length of the response
    responseMimeType: "text/plain",
  };

  async function run() {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Prepare the prompt using both embeddings and PDF text, with safety checks
    const validEmbeddings = embeddings.filter(emb => emb && emb.slice); // Filter out invalid embeddings
    if (validEmbeddings.length === 0) {
      console.error("No valid embeddings found.");
      setQuestions('No valid embeddings available for generating questions.');
      return;
    }

    const embeddingContext = validEmbeddings.map((emb, index) => 
      `Chunk ${index + 1}: ${JSON.stringify(emb.slice(0, 5))}`).join('\n'); // Limit context size
    const textContext = pdfText ? pdfText.slice(0, 500) : 'No text available.'; // Add a fallback for text

    console.log(pdfText);
    console.log(embeddingContext);
    const prompt = `Based on the following embeddings and the corresponding text, generate 3-4 introspective questions:\n\nText: ${pdfText}\n\nEmbeddings:\n${embeddingContext}`;

    try {
      const result = await chatSession.sendMessage(prompt);
      const responseText = await result.response.text(); // Ensure result is a string

      if (typeof responseText === 'string') {
        const questionsArray = responseText.split('\n').filter(q => q); // Ensure it's split correctly
        setQuestions(questionsArray.join('\n')); // Set as string with newlines
      } else {
        setQuestions('No valid questions generated.');
      }
    } catch (error) {
      console.error("Error fetching motivation:", error.message);
      setQuestions('Failed to fetch motivation.');
    }
  }

  run();
};


export default fetchMotivation;
