# Textract

## Overview

This project is a web-based application that allows users to upload PDF files, submit custom queries, and get answers using an embedded AI model. The application features:
- PDF preview: Users can see the uploaded PDF on the left side of the page.
- Query processing: Users can input their own queries or select from generated questions, which are then processed to extract relevant information from the uploaded PDF.
- Firebase Authentication: User authentication is integrated to manage login/logout.
- Data storage: Queries, generated questions, and answers are handled and displayed in a visually appealing UI, with some Firebase support for user data.

## Features
- PDF Upload: Users can upload any PDF file, which will be displayed for preview.
- Query Submission: Users can submit multiple queries, and the AI will attempt to answer them based on the PDF content.
- Generated Questions: Automatically generated questions from the document for ease of use.
- Answer Embeddings: Visual representation of embedding data related to the answers.
- Authentication: Firebase Authentication is used for secure login and logout functionality.

## Tech Stack
- Frontend: React.js, Tailwind CSS
- Backend: Flask (for processing PDF files), Firebase
- Authentication: Firebase Authentication
- Database: Firebase Firestore (for storing user data)

## Project Structure

```
📦 QnA PDF Processor
 ┣ 📂 public
 ┃ ┣ 📜 index.html
 ┣ 📂 src
 ┃ ┣ 📂 components
 ┃ ┃ ┣ 📜 QnA.js      // The main component for the QnA functionality
 ┃ ┃ ┗ 📜 UserContext.js // Manages user authentication state
 ┃ ┣ 📂 assets
 ┃ ┃ ┗ 📜 star.jpg     // Background image for the UI
 ┃ ┣ 📂 firebase
 ┃ ┃ ┗ 📜 firebase.config.js // Firebase configuration
 ┃ ┗ 📜 App.js         // Main React entry file
 ┣ 📜 .gitignore
 ┣ 📜 README.md
 ┣ 📜 package.json
 ┗ 📜 tailwind.config.js
```

## Installation

1. Clone the repository:
   `git clone https://github.com/RohanMalik2710/textract`
   
   `cd textract`

2. Install dependencies:
   `npm install`

3. Configure Firebase:
   - Add your Firebase configuration in `src/firebase/firebase.config.js`.
   - Ensure you set up Firebase Authentication and Firestore in your Firebase console.

4. Run the Flask server (backend for PDF processing):
   - Navigate to your Flask project directory and start the server:
     `python app.py`
   - Ensure Flask is running on `localhost:5000` by default.

5. Run the React app:
   `npm start`

## Usage

1. Log in to the application using Firebase authentication.
2. Upload a PDF file from your computer.
3. Add queries manually or select from the automatically generated questions.
4. Submit queries, and see the results displayed below the query processor.
5. View the PDF on the left side while interacting with the query processor on the right.

## Contributing

Contributions are welcome! Please fork the repository, make your changes, and submit a pull request. Ensure that your code follows the project's coding standards.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
