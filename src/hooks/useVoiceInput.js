import { useState, useRef, useCallback, useEffect } from "react";

const LANGUAGES = [
  { code: "en-IN", label: "English", short: "EN" },
  { code: "hi-IN", label: "हिन्दी", short: "HI" },
  { code: "mr-IN", label: "मराठी", short: "MR" },
  { code: "ta-IN", label: "தமிழ்", short: "TA" },
  { code: "te-IN", label: "తెలుగు", short: "TE" },
  { code: "bn-IN", label: "বাংলা", short: "BN" },
  { code: "gu-IN", label: "ગુજરાતી", short: "GU" },
  { code: "kn-IN", label: "ಕನ್ನಡ", short: "KN" },
  { code: "ml-IN", label: "മലയാളം", short: "ML" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ", short: "PA" },
];

export default function useVoiceInput(onTranscript) {
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("nyaybot-voice-lang") || "en-IN";
  });
  const [interimText, setInterimText] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  // Persist language choice
  useEffect(() => {
    localStorage.setItem("nyaybot-voice-lang", lang);
  }, [lang]);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Stop any existing instance
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimText("");
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        onTranscript?.(final);
        setInterimText("");
      } else {
        setInterimText(interim);
      }
    };

    recognition.onerror = (event) => {
      // Ignore "no-speech" and "aborted" — they're expected
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.warn("Speech recognition error:", event.error);
      }
      setIsListening(false);
      setInterimText("");
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [lang, onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText("");
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    interimText,
    lang,
    setLang,
    supported,
    toggleListening,
    stopListening,
    languages: LANGUAGES,
  };
}
