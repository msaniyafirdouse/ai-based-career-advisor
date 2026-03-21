'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, Send, BrainCircuit, Square, Mic, MicOff, 
  Video, VideoOff, Award, Trophy, XCircle, Loader2, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function MockInterviewStudio() {
  const searchParams = useSearchParams();
  // Read topic and syllabus from URL: ?topic=JavaScript...&syllabus=JS basics,DOM manipulation
  const topicFromUrl = searchParams.get('topic') || 'Software Engineering';
  const syllabusFromUrl = searchParams.get('syllabus')
    ? searchParams.get('syllabus')!.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  
  const [qNum, setQNum] = useState(1);
  const [examResult, setExamResult] = useState<{ passed: boolean; text: string } | null>(null);

  // --- VOICE & SPEECH STATES ---
  const [isListening, setIsListening] = useState(false);
  const [ttsReady, setTtsReady] = useState(false);
  // isSpeaking: true while the AI is reading out the question
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // --- CAMERA & RECORDING STATES ---
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // ─────────────────────────────────────────────
  // CONFETTI TRIGGER
  // ─────────────────────────────────────────────
  const triggerConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  // Unlock TTS on first user gesture
  const unlockTTS = useCallback(() => {
    if (ttsReady) return;
    const utterance = new SpeechSynthesisUtterance('');
    window.speechSynthesis.speak(utterance);
    setTtsReady(true);
  }, [ttsReady]);

  useEffect(() => {
    document.addEventListener('click', unlockTTS, { once: true });
    return () => document.removeEventListener('click', unlockTTS);
  }, [unlockTTS]);

  // ─────────────────────────────────────────────
  // SPEAK: reads AI text aloud, then auto-starts
  // mic so the candidate can answer immediately
  // ─────────────────────────────────────────────
  const speak = useCallback((text: string, autoListen: boolean = true) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;

    setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
      // After AI finishes speaking, auto-start mic for seamless flow
      if (autoListen) {
        startListeningInternal();
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────
  // LISTEN: internal version used by speak's onend
  // so we don't have a circular dependency
  // ─────────────────────────────────────────────
  const startListeningInternal = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Stop any existing recognition session
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    // FIX: When speech recognition finishes, auto-submit the answer
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Auto-submit after a short delay so the user can see what was captured
      setTimeout(() => {
        submitAnswer(transcript);
      }, 800);
    };

    try { recognition.start(); } catch (_) {}
  };

  // Manual mic toggle button — for the user to re-trigger listening
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Voice input requires Chrome/Edge.');

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => {
        submitAnswer(transcript);
      }, 800);
    };

    recognition.start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleCamera = async () => {
    if (isCameraOn) {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      } catch (err) { alert('Enable camera/mic access.'); }
    }
  };

  const startRecording = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (!stream) return alert('Turn on camera first!');
    setIsRecording(true);
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `exam-session-q${qNum}.webm`;
      a.click();
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
  };

  // ─────────────────────────────────────────────
  // CORE SUBMIT LOGIC — extracted so both the
  // form submit and auto-submit after voice can use it
  // ─────────────────────────────────────────────
  const submitAnswer = async (answerText: string) => {
    if (!answerText.trim() || isLoading || examResult) return;

    const userText = answerText.trim();
    const updatedMessages = [...messages, { role: 'user', text: userText }];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // FIX 1: Map internal messages to proper {role, content} objects the backend expects
      // 'ai' role → 'assistant' (OpenAI/Groq standard)
      // 'user' role → 'user'
      const apiHistory = updatedMessages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }));

      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: apiHistory,           // properly structured {role, content} objects
          topic_context: topicFromUrl,    // dynamic — from roadmap module URL param
          syllabus: syllabusFromUrl,      // sub-skills — keeps questions on-module
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.text }]);

      if (data.q_num) setQNum(data.q_num);
      
      if (data.is_complete) {
        setExamResult({ passed: data.passed, text: data.text });
        // Speak final result but don't auto-listen after
        speak(data.text, false);
        if (data.passed) triggerConfetti();
      } else {
        // Seamless: AI speaks the next question, mic auto-starts after
        speak(data.text, true);
      }

    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // INTRO: fires once on mount
  // FIX 2: send empty messages array (not a string)
  // ─────────────────────────────────────────────
  const introFired = useRef(false);
  useEffect(() => {
    if (introFired.current) return;
    introFired.current = true;

    const triggerIntro = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Send empty messages array + dynamic topic + syllabus from the roadmap module
          body: JSON.stringify({
            messages: [],
            topic_context: topicFromUrl,
            syllabus: syllabusFromUrl,
          }),
        });
        const data = await response.json();
        setMessages([{ role: 'ai', text: data.text }]);
        // Speak intro and auto-start mic after
        speak(data.text, true);
      } catch (err) { console.error('Intro failed:', err); }
      finally { setIsLoading(false); }
    };
    triggerIntro();
  }, [speak]);

  // Form submit handler — delegates to submitAnswer
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) {
      recognitionRef.current?.stop();
    }
    await submitAnswer(input);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-6">
            <button onClick={() => window.history.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Certification Studio</h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{topicFromUrl}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                   {qNum > 10 ? "Evaluating..." : `Question ${qNum} / 10`}
                </span>
                <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(Math.min(qNum, 10) / 10) * 100}%` }} 
                    className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isRecording ? (
              <button onClick={startRecording} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:scale-105 transition-all uppercase tracking-widest">Record Session</button>
            ) : (
              <button onClick={() => mediaRecorderRef.current?.stop()} className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black animate-pulse shadow-lg flex items-center gap-2">
                <Square size={12} fill="white"/> Stop & Save
              </button>
            )}
            <div className="px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black border border-red-100 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> LIVE PROCTORING
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 flex flex-col gap-8 overflow-hidden relative">
          
          <div className="flex-1 bg-slate-900 rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-slate-800">
            {!isCameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                {/* Visual indicator: pulsing when speaking, different color when listening */}
                <div className={`w-24 h-24 rounded-full mb-6 flex items-center justify-center transition-all duration-500 ${
                  isSpeaking 
                    ? 'bg-indigo-400 animate-pulse scale-110 shadow-2xl shadow-indigo-500/50' 
                    : isListening 
                      ? 'bg-emerald-500 animate-pulse scale-105 shadow-2xl shadow-emerald-500/50'
                      : isLoading 
                        ? 'bg-indigo-600 animate-pulse' 
                        : 'bg-indigo-600 shadow-2xl shadow-indigo-500/30'
                }`}>
                  <BrainCircuit className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-white font-black text-2xl tracking-tight">AI Technical Examiner</h2>
                {/* Dynamic status label */}
                <p className="text-slate-400 text-sm mt-2 max-w-xs font-medium">
                  {isSpeaking 
                    ? '🔊 Speaking — listen carefully...' 
                    : isListening 
                      ? '🎙️ Listening — answer now...'
                      : isLoading 
                        ? 'Thinking...'
                        : 'Proctored certification in progress.'}
                </p>
              </div>
            )}
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-700 ${isCameraOn ? 'opacity-100' : 'opacity-0'}`} />
            
            <div className="absolute bottom-8 left-8">
              <button onClick={toggleCamera} className="p-5 bg-white/10 backdrop-blur-2xl rounded-[1.5rem] border border-white/20 hover:bg-white/20 transition-all shadow-2xl group">
                {isCameraOn ? <Video className="text-white group-hover:scale-110 transition-transform" /> : <VideoOff className="text-red-400" />}
              </button>
            </div>

            {/* Speaking/Listening status badge — visible even when camera is on */}
            {(isSpeaking || isListening) && (
              <div className={`absolute top-6 right-6 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
                isSpeaking ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'
              }`}>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                {isSpeaking ? 'AI Speaking' : 'Your Turn'}
              </div>
            )}
          </div>

          <div className="pb-4">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={isLoading || !!examResult || isSpeaking}
                  placeholder={
                    isSpeaking 
                      ? "AI is speaking..." 
                      : isListening 
                        ? "Listening — speak your answer..." 
                        : "Speak or type your technical answer..."
                  }
                  className="w-full bg-white border border-slate-200 rounded-[1.8rem] pl-8 pr-16 py-6 shadow-2xl focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={isListening ? () => recognitionRef.current?.stop() : startListening}
                  disabled={isSpeaking || isLoading || !!examResult}
                  className={`absolute right-5 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse shadow-lg' 
                      : isSpeaking 
                        ? 'text-slate-200 cursor-not-allowed' 
                        : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  {isListening ? <MicOff size={22}/> : <Mic size={22}/>}
                </button>
              </div>
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading || isSpeaking} 
                className="p-6 bg-indigo-600 text-white rounded-[1.8rem] shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <Send size={24} />}
              </button>
            </form>
          </div>

          <AnimatePresence>
            {examResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-8 z-50">
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }} 
                  animate={{ scale: 1, y: 0 }} 
                  className="bg-white rounded-[3.5rem] p-16 max-w-xl w-full text-center shadow-2xl relative overflow-hidden"
                >
                  {examResult.passed ? (
                    <div className="flex flex-col items-center">
                      <div className="w-28 h-28 bg-amber-50 rounded-full flex items-center justify-center mb-8 border border-amber-100 shadow-inner">
                        <Trophy className="w-14 h-14 text-amber-500 drop-shadow-md" />
                      </div>
                      <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">Skill Certified!</h2>
                      <p className="text-slate-500 mb-10 leading-relaxed font-medium italic">"{examResult.text}"</p>
                      <button 
                        onClick={() => window.history.back()} 
                        className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black shadow-2xl shadow-indigo-100 hover:scale-[1.02] transition-all uppercase tracking-[0.2em] text-xs"
                      >
                        Add Verified Badge to Resume
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-28 h-28 bg-red-50 rounded-full flex items-center justify-center mb-8 border border-red-100 shadow-inner">
                        <XCircle className="w-14 h-14 text-red-500 drop-shadow-md" />
                      </div>
                      <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">Unverified Proficiency</h2>
                      <p className="text-slate-500 mb-10 leading-relaxed font-medium italic">"{examResult.text}"</p>
                      <button 
                        onClick={() => window.location.reload()} 
                        className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black shadow-2xl hover:bg-black transition-all uppercase tracking-[0.2em] text-xs"
                      >
                        Review Roadmap & Retry
                      </button>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <aside className="w-[26rem] bg-white border-l border-slate-200 flex flex-col hidden xl:flex shadow-[-20px_0_40px_rgba(0,0,0,0.02)]">
        <div className="p-8 border-b bg-indigo-50/20 flex items-center justify-between">
          <h2 className="font-black text-indigo-900 flex items-center gap-3 uppercase tracking-widest text-[11px]">
            <BrainCircuit size={18} className="text-indigo-600" /> Exam Transcript
          </h2>
          <div className="text-[10px] bg-white px-3 py-1.5 rounded-lg border border-indigo-100 font-black text-indigo-600 shadow-sm">
            {qNum > 10 ? "EVAL" : `Q ${qNum} / 10`}
          </div>
        </div>
        <div className="flex-1 p-8 overflow-y-auto space-y-6 scrollbar-hide">
          {messages.map((msg, i) => (
            <div key={i} className={`p-5 rounded-[1.5rem] text-sm leading-relaxed transition-all hover:shadow-md ${msg.role === 'ai' ? 'bg-slate-50 border border-slate-100 text-slate-700' : 'bg-indigo-600 text-white ml-8 shadow-xl shadow-indigo-100'}`}>
              <span className={`text-[10px] font-black uppercase block mb-2 tracking-widest ${msg.role === 'ai' ? 'text-indigo-600' : 'text-indigo-200'}`}>
                {msg.role === 'ai' ? 'AI Examiner' : 'Candidate'}
              </span>
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 p-5 rounded-[1.5rem] flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}