import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion'; // Import motion from framer-motion
import Navbar from './Navbar';
import FileUpload from './FileUpload';
import HelloWorld from './HelloWorld';
import Button from './Button';
import { useNavigate } from 'react-router-dom';
import bgImg from "../assets/BestImage.png";

const Dashboard = () => {
  const navigate = useNavigate();

  const [typedText, setTypedText] = useState('');
  const [showMainContent, setShowMainContent] = useState(false);
  const [animationCompleted, setAnimationCompleted] = useState(false); // New state for animation completion
  const [typingCompleted, setTypingCompleted] = useState(false); // State to track typing completion
  const [isBlinking, setIsBlinking] = useState(false); // State to control blinking of the last character
  const fullText = 'Welcome to Textract'; // Full text to type out

  // Effect to show main content after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMainContent(true); // Show main content
    }, 2500); // Duration before showing main content

    return () => clearTimeout(timer); // Clean up timer on unmount
  }, []);

  // Effect to handle typing animation which starts after the animation is completed
  useEffect(() => {
    if (animationCompleted) { // Start typing animation only when animation is complete
      let index = 0;
      setTypedText(''); // Clear previous text

      const typeText = () => {
        if (index < fullText.length) {
          const newChar = fullText[index];
          setTypedText((prev) => {
            // Check if the new character is 'undefined'
            if (newChar === 'undefined') return prev; // Prevent adding 'undefined'
            return prev + newChar;
          });
          index++;
          setTimeout(typeText, 100); // Use setTimeout to control typing speed
        } else {
          // After typing is complete, set typingCompleted to true and start blinking
          setTypingCompleted(true);
          setIsBlinking(true); // Start blinking the last character
        }
      };

      typeText(); // Start the typing effect
    }
  }, [animationCompleted]);

  return (
    <div>
      {!showMainContent ? (
        <HelloWorld />
      ) : (
        <div className="min-h-screen text-white flex flex-col items-center justify-center relative">
          <motion.div
            initial={{ opacity: 0 }} // Start with no opacity for the fade-in effect
            animate={{ opacity: 1 }} // Animate to full opacity
            transition={{ duration: 0.3, ease: "easeOut" }} // Animation duration and easing for smooth effect
            className="absolute inset-0" // Full-screen overlay
            style={{ 
              backgroundImage: `url(${bgImg})`, // Properly format the background image
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover', // Ensure the image covers the area
              backgroundPosition: 'center', // Center the image
              pointerEvents: 'none' // Prevent interaction with overlay
            }} 
            onAnimationComplete={() => setAnimationCompleted(true)} // Set the animation completion state
          />
          
          <div className="container mx-auto mt-6 px-4 flex flex-col items-center justify-center relative z-10"> {/* z-10 to keep content above the animation */}
            <div className="flex justify-center gap-4">
              <h1 className="text-6xl font-thin mb-4">
                {animationCompleted && typedText && ( // Only show text after animation is complete
                  <span className="glow text-black">
                    {typedText}
                    {typingCompleted && isBlinking && <span className="-ml-1 blinking">|</span>} {/* Blinking effect for the last character */}
                  </span>
                )}
              </h1>
            </div>
            <p className="text-center text-black mb-10 text-3xl font-extralight">
              {typingCompleted && (
                <div className='flex flex-col items-center gap-20'>
                  <p>"Upload your file and see the magic."</p>
                  <Button onClick={() => navigate('/upload')} />
                  </div>
              )} {/* Show paragraph text only after typing is complete */}
            </p>
          </div>

          {/* CSS for blinking effect */}
          <style jsx>{`
            .blinking {
              animation: blink 1s step-start infinite;
            }

            @keyframes blink {
              50% {
                opacity: 0;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
