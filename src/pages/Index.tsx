import { useState, useEffect } from "react";
import IntroScreen from "@/components/IntroScreen";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <>
      {showIntro ? (
        <IntroScreen onComplete={handleIntroComplete} />
      ) : (
        <ChatInterface />
      )}
    </>
  );
};

export default Index;
