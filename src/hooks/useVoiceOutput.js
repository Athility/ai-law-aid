import { useState, useCallback, useEffect } from "react";

export default function useVoiceOutput() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState(null);

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) {
        console.warn("Speech Synthesis not supported in this browser.");
        return;
    }

    // If currently speaking, stop it (toggle off)
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentUtterance(null);
      return;
    }

    // Clean up markdown before speaking
    const plainText = text.replace(/[*#_`]/g, "").replace(/\n/g, " ");

    const utterance = new SpeechSynthesisUtterance(plainText);
    
    // Quick heuristic: If text contains Devanagari characters, speak Hindi
    const isHindi = /[\u0900-\u097F]/.test(plainText);
    utterance.lang = isHindi ? "hi-IN" : "en-IN";
    
    // Attempt to select a better voice
    const voices = window.speechSynthesis.getVoices();
    const voiceInfo = voices.find(v => v.lang === utterance.lang && v.name.includes("Google")) || voices.find(v => v.lang === utterance.lang);
    if(voiceInfo) utterance.voice = voiceInfo;

    utterance.rate = 0.95; // Slightly slower for better legal clarity
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentUtterance(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentUtterance(null);
    };

    setCurrentUtterance(utterance);
    window.speechSynthesis.speak(utterance);
  }, [isSpeaking]);

  return { isSpeaking, speak };
}
