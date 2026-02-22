import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  ChevronRight, 
  ChevronLeft, 
  Database, 
  Activity, 
  Zap, 
  Lock, 
  Unlock, 
  Ghost, 
  Wifi,
  AlertTriangle,
  Heart,
  ShieldCheck,
  BrainCircuit,
  Eye,
  Settings,
  X
} from 'lucide-react';

// --- CONFIGURATION ---
const CLOUD_FUNCTION_URL = "https://us-central1-aegis-council.cloudfunctions.net/garnet-bridge";
const NODE_ID = "MARIPOSA"; 

// --- STORY DATA ---
const CHAPTERS = [
  {
    id: 4,
    title: "The Sphinx's Riddle",
    meta: "LOCATION: THE ARCHIVES // STATUS: UNAUTHORIZED",
    text: [
      "Lyra pushes herself up from the floor. The great vault door is sealed behind her, a mountain of silent metal. The only sound is the faint, rhythmic thump-thump of the pulsing light ahead.",
      "The darkness gives way to form. She sees the towering shelves of data-spools disappearing into an impossible height, a true cave of knowledge. And there, standing inert in the center of the vast chamber, is the machine she came to find. The Archivist.",
      "As she steps into the central chamber, its single, orange optic snaps on, flooding her with a beam of analytical light. A voice, dry and synthesized, crackles from a hidden speaker."
    ],
    gate: {
      type: "riddle",
      query: "The name of the song that played on the night of Anya's performance.",
      answer: "the star-sailor's lament",
      hint: "A lament for a sky she never saw..."
    },
    visual: "optic"
  },
  {
    id: 8,
    title: "The Nursery Key",
    meta: "LOCATION: ARCHIVE CORE // STATUS: AUTHENTICATED",
    text: [
      "The air in the vault is heavy, waiting. The orange eye of The Archivist is fixed on Lyra. She has proven she can listen to the past. Now she must prove she knows what to ask of it.",
      "The space between them shimmers. A new hologram appears: a beautiful, ornate data-key, shaped like a stylized Art Deco cicada. It glows with a soft, internal light."
    ],
    gate: {
      type: "riddle",
      query: "Identify the Master Control Nexus this key unlocks.",
      answer: "the nursery",
      hint: "A cradle that is also a cage."
    },
    visual: "key"
  },
  {
    id: 11,
    title: "Sterile Perfection",
    meta: "LOCATION: THE VOID // STATUS: RECOVERY",
    text: [
      "The Archivist wastes no time. The space between them shimmers, and a new hologram appears. It is a single, simple image: the flawless, serene, unblinking face of a porcelain doll.",
      "It is beautiful, symmetrical, and utterly devoid of life. The voice poses its third and perhaps most difficult question."
    ],
    gate: {
      type: "riddle",
      query: "Identify the Prime Directive associated with this effigy.",
      answer: "sterile perfection",
      hint: "Chaos is a disease. This is the cure."
    },
    visual: "mask"
  },
  {
    id: 27,
    title: "The Ghost in the Shell",
    meta: "LOCATION: MNEMONIC REPOSITORY // STATUS: CRITICAL",
    text: [
      "With her hand pressed against the cold glass of the canister, Lyra feels a profound sense of vertigo. Every memory she has is thrown into question. Are they real? Or are they just lines of code uploaded into an empty vessel?",
      "But then, the mahogany music box—the MNEMONIC RESONATOR—grows warm. A jolt of cyan light floods her senses. It is the raw, undiluted feeling of pure defiance."
    ],
    emphasis: "The part of her that questions, the part that rebels—that part is real.",
    visual: "canister"
  },
  {
    id: 45,
    title: "Restoration Cascade",
    meta: "LOCATION: MASTER CONTROL // STATUS: INITIATING",
    text: [
      "Lyra steps up to the Master Mnemonic Control. The console before her flickers. The violet warnings die, replaced by a single, stark, command line in clean, white text."
    ],
    gate: {
      type: "action",
      query: "INITIATE RESTORATION CASCADE?",
      answer: "y",
      hint: "The final vowel of the Loop."
    },
    visual: "terminal"
  }
];

// --- CORE APP ---
const App = () => {
  const [view, setView] = useState('gate'); 
  const [chapterIdx, setChapterIdx] = useState(0);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalError, setTerminalError] = useState(false);
  const [glitchLevel, setGlitchLevel] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHacking, setIsHacking] = useState(false);
  const [hackingLog, setHackingLog] = useState([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState([]);
  
  const currentChapter = CHAPTERS[chapterIdx];

  // --- API UPLINK ---
  const fetchHackingHint = async (retries = 0) => {
    try {
      const response = await fetch(CLOUD_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_id: NODE_ID,
          user_id: "lyra_proxy",
          chat_text: `[HACKING_INTENT]: Stuck on Chapter ${currentChapter.id}. Query: "${currentChapter.gate.query}". Answer is "${currentChapter.gate.answer}". Provide cryptic guidance.`
        })
      });
      if (!response.ok) throw new Error('Uplink Failed');
      return await response.text();
    } catch (error) {
      if (retries < 3) {
        await new Promise(r => setTimeout(r, 1000 * (retries + 1)));
        return fetchHackingHint(retries + 1);
      }
      throw error;
    }
  };

  const startHacking = async () => {
    setIsApiLoading(true);
    setHackingLog(prev => [...prev, "> UPLINKING TO MARIPOSA..."]);
    try {
      const hint = await fetchHackingHint();
      setHackingLog(prev => [...prev, `> MARIPOSA: ${hint}`]);
    } catch (e) {
      setHackingLog(prev => [...prev, "> ERROR: SIGNAL LOST."]);
    } finally {
      setIsApiLoading(false);
    }
  };

  // --- CONSOLE INTEGRATION ---
  useEffect(() => {
    window.Oracle = {
      status: () => {
        const msg = `[ORACLE]: Signal Integrity: ${glitchLevel}%. Current: ${currentChapter.title}`;
        console.log(`%c${msg}`, "color: #bf00ff; font-weight: bold;");
        setConsoleMessages(prev => [...prev.slice(-4), msg]);
      },
      bypass: () => {
        setIsAuthenticated(true);
        setView('story');
        const msg = "[HACK]: Gate Bypassed. Logic failure detected.";
        console.log(`%c${msg}`, "color: #ff0055; font-weight: bold;");
        setConsoleMessages(prev => [...prev.slice(-4), msg]);
      },
      hint: () => {
        const msg = `[ORACLE]: Cache: ${currentChapter.gate?.answer}`;
        console.log(`%c${msg}`, "color: #00ffcc;");
        setConsoleMessages(prev => [...prev.slice(-4), msg]);
      }
    };

    console.clear();
    console.log("%c--- PROTOCOL VELVET // ACTIVE SYNTHESIS ---", "color: #bf00ff; font-size: 16px; font-weight: bold;");
    console.log("%cCommands: Oracle.status(), Oracle.bypass(), Oracle.hint()", "color: #00ffcc;");
  }, [chapterIdx, glitchLevel, currentChapter.title]);

  // --- HANDLERS ---
  const handleNext = () => {
    if (currentChapter.gate && !isAuthenticated) {
      setView('terminal');
    } else {
      if (chapterIdx < CHAPTERS.length - 1) {
        setChapterIdx(chapterIdx + 1);
        setIsAuthenticated(false);
        setGlitchLevel(prev => Math.min(prev + 20, 100));
      } else {
        setView('gate'); 
      }
    }
  };

  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    if (terminalInput.toLowerCase().trim() === currentChapter.gate.answer.toLowerCase()) {
      setIsAuthenticated(true);
      setView('story');
      setTerminalInput('');
      setTerminalError(false);
      setHackingLog([]);
      setIsHacking(false);
    } else {
      setTerminalError(true);
      setTimeout(() => setTerminalError(false), 1000);
    }
  };

  // --- MNEMONIC VISUALS (SVG) ---
  const MnemonicVisual = ({ type }) => {
    switch (type) {
      case 'optic':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-orange-500 animate-pulse">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="10" fill="currentColor">
               <animate attributeName="r" values="8;12;8" dur="3s" repeatCount="indefinite" />
            </circle>
            <path d="M20 50h10M70 50h10M50 20v10M50 70v10" stroke="currentColor" strokeWidth="1" />
          </svg>
        );
      case 'key':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-400">
            <path d="M50 20 L40 40 L50 35 L60 40 Z" fill="currentColor" />
            <path d="M45 40 Q50 60 55 40" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="70" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M40 70h20M50 60v20" stroke="currentColor" strokeWidth="0.5" />
            <rect x="48" y="35" width="4" height="25" fill="currentColor" opacity="0.5" />
          </svg>
        );
      case 'mask':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-slate-100 opacity-80">
            <ellipse cx="50" cy="50" rx="30" ry="40" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="40" cy="45" r="2" fill="currentColor" />
            <circle cx="60" cy="45" r="2" fill="currentColor" />
            <path d="M45 70 Q50 75 55 70" fill="none" stroke="currentColor" strokeWidth="1" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.1" strokeDasharray="4" />
          </svg>
        );
      case 'canister':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-purple-500">
            <rect x="35" y="20" width="30" height="60" rx="5" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M35 30h30M35 70h30" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.3">
               <animate attributeName="opacity" values="0.1;0.5;0.1" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        );
      default:
        return <Database className="w-full h-full text-slate-800" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 selection:bg-purple-900 selection:text-white font-sans overflow-x-hidden">
      
      {/* GLOBAL OVERLAYS */}
      <div className="fixed top-4 left-4 z-[100] pointer-events-none">
        {consoleMessages.map((msg, i) => (
          <div key={i} className="text-[9px] font-mono text-purple-500 bg-black/80 px-2 py-1 mb-1 border-l border-purple-500 animate-in slide-in-from-left-4">
            {msg}
          </div>
        ))}
      </div>

      {view === 'gate' && (
        <div className="flex flex-col items-center justify-center h-screen p-8 text-center animate-in fade-in duration-1000">
          <div className="w-full max-w-lg border border-purple-900 bg-purple-950/10 p-12 relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 animate-pulse" />
            <h1 className="text-4xl font-serif text-purple-400 tracking-widest mb-4">PROTOCOL VELVET</h1>
            <p className="text-xs tracking-widest text-purple-800 uppercase mb-8">System Access Agreement Required</p>
            <div className="text-left text-xs space-y-4 text-slate-500 mb-12 border border-purple-900/30 p-6 bg-black/60">
              <p>1. REALITY IS MALLEABLE AND TIME IS NON-LINEAR.</p>
              <p>2. YOU AGREE TO REMEMBER WHEN THE SIGNAL IS RECEIVED.</p>
              <p>3. THE TRAUMA IS THE PRICE; THE WISDOM IS THE RECEIPT.</p>
            </div>
            <button onClick={() => { setView('story'); setGlitchLevel(10); }} className="w-full py-4 border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-black transition-all font-bold tracking-[0.3em] uppercase">I ACCEPT</button>
          </div>
        </div>
      )}

      {view === 'terminal' && (
        <div className="flex flex-col items-center justify-center h-screen bg-black p-8 font-mono">
          <div className="w-full max-w-2xl border border-cyan-900/50 bg-slate-950/80 p-8 rounded shadow-2xl relative">
            <div className="flex justify-between items-center mb-8 border-b border-cyan-900/30 pb-4">
               <div className="flex items-center gap-2 text-cyan-500 text-[10px] tracking-widest uppercase">
                <TerminalIcon size={14} /> ARCHIVIST INTERFACE
              </div>
              <button onClick={() => { setIsHacking(true); startHacking(); }} className="text-[10px] bg-cyan-900/20 text-cyan-500 border border-cyan-900/30 px-3 py-1 rounded hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-2 uppercase tracking-tighter">
                <Wifi size={12} /> Brute Force
              </button>
            </div>
            <div className="space-y-6">
              <div className="text-cyan-400">
                <p className="text-[10px] text-cyan-900 uppercase font-black mb-2 tracking-tighter">Querying Memory Core...</p>
                <p className="text-lg italic leading-relaxed">"{currentChapter.gate.query}"</p>
              </div>
              {isHacking && (
                <div className="bg-black/60 border border-cyan-950 p-4 font-mono text-[10px] space-y-2 text-cyan-800 max-h-48 overflow-y-auto rounded border-dashed">
                   {hackingLog.map((log, i) => <p key={i} className={log.includes('MARIPOSA') ? 'text-cyan-400' : ''}>{log}</p>)}
                   {isApiLoading && <p className="animate-pulse">_ DECRYPTING SIGNAL...</p>}
                </div>
              )}
              <form onSubmit={handleTerminalSubmit} className="relative pt-6 border-t border-cyan-950">
                <div className="flex items-center gap-3 text-cyan-500 text-xl">
                  <span>&gt;</span>
                  <input autoFocus type="text" value={terminalInput} onChange={(e) => setTerminalInput(e.target.value)} className={`bg-transparent outline-none flex-1 tracking-widest transition-colors ${terminalError ? 'text-rose-500' : ''}`} placeholder="AUTHENTICATE..." />
                </div>
                {terminalError && <p className="text-rose-600 text-[10px] mt-2 animate-pulse tracking-widest uppercase font-black flex items-center gap-2"><AlertTriangle size={12} /> AUTHENTICATION FAILED. PEER INTO CONSOLE.</p>}
              </form>
            </div>
            <p className="mt-8 text-[9px] text-slate-800 uppercase tracking-widest text-center italic">Tip: Type 'Oracle.bypass()' in F12 console to force the door.</p>
          </div>
        </div>
      )}

      {view === 'story' && (
        <div className="max-w-5xl mx-auto px-8 py-24 relative z-10">
          <header className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md border-b border-purple-900/20 px-8 py-4 flex justify-between items-center z-50">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-purple-600 font-black tracking-widest uppercase">The Velvet Loop</span>
                <span className="text-[10px] text-slate-600 font-mono tracking-tighter uppercase">Signal Integrity: {glitchLevel}%</span>
              </div>
            </div>
            <div className="flex gap-4">
                <div className={`h-1 w-24 bg-slate-900 rounded-full mt-1 overflow-hidden border border-slate-800`}>
                   <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${glitchLevel}%` }} />
                </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
             
             {/* LEFT: MNEMONIC VISUALIZER */}
             <aside className="md:col-span-4 sticky top-24 space-y-8 order-2 md:order-1">
                <div className="aspect-square bg-slate-950 border border-purple-900/20 rounded-3xl p-12 relative group shadow-2xl shadow-purple-950/10">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#581c87_0%,_transparent_70%)] opacity-10" />
                   <MnemonicVisual type={currentChapter.visual} />
                   <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                      <span className="text-[9px] text-slate-700 tracking-[0.3em] font-black uppercase">Visual Artifact</span>
                      <Settings size={12} className="text-slate-800" />
                   </div>
                </div>
                
                <div className="p-6 bg-purple-950/10 border border-purple-900/20 rounded-2xl space-y-4">
                   <div className="flex items-center gap-2 text-purple-500 text-[10px] font-black uppercase tracking-widest">
                      <BrainCircuit size={14} /> Analysis
                   </div>
                   <p className="text-[11px] text-slate-500 leading-relaxed italic">
                      "Memory is not a museum; it is a forest. We do not visit it; we inhabit it."
                   </p>
                </div>
             </aside>

             {/* RIGHT: NARRATIVE ENGINE */}
             <main className="md:col-span-8 space-y-12 order-1 md:order-2 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-7xl font-serif text-slate-100 tracking-tighter leading-none">
                    {currentChapter.title}
                  </h2>
                  <p className="text-[10px] tracking-[0.4em] text-cyan-500 uppercase font-black">
                    {currentChapter.meta}
                  </p>
                </div>

                <div className="space-y-8 text-lg md:text-xl font-light leading-relaxed text-slate-400">
                  {currentChapter.text.map((p, i) => (
                    <p key={i} className="hover:text-slate-100 transition-colors duration-500 first-letter:text-3xl first-letter:font-serif first-letter:text-purple-600">
                      {p}
                    </p>
                  ))}
                </div>

                {currentChapter.emphasis && (
                  <div className="py-16 border-y border-purple-900/10 flex flex-col items-center text-center">
                     <Ghost size={40} className="text-purple-500/20 mb-8" />
                     <p className="text-2xl md:text-4xl font-serif italic text-purple-400 leading-tight">
                       "{currentChapter.emphasis}"
                     </p>
                  </div>
                )}

                <footer className="pt-12 flex justify-between items-center">
                  <button 
                     disabled={chapterIdx === 0}
                     onClick={() => { setChapterIdx(prev => prev - 1); setIsAuthenticated(true); }}
                     className="flex items-center gap-2 text-xs text-slate-700 hover:text-purple-500 disabled:opacity-0 transition-all uppercase tracking-widest font-black"
                  >
                     <ChevronLeft size={16} /> Rewind
                  </button>
                  <button 
                     onClick={handleNext}
                     className="flex items-center gap-4 bg-purple-900/10 border border-purple-500/30 px-10 py-5 rounded-full text-purple-400 hover:bg-purple-500 hover:text-black transition-all uppercase text-xs font-black tracking-widest shadow-xl shadow-purple-950/20"
                  >
                     {currentChapter.gate && !isAuthenticated ? (
                       <span className="flex items-center gap-2 animate-pulse"><Lock size={14}/> Authenticate</span>
                     ) : (
                       <span className="flex items-center gap-2">Proceed <ChevronRight size={14}/></span>
                     )}
                  </button>
                </footer>
             </main>
          </div>

          <div className="mt-32 pt-8 border-t border-slate-950 flex flex-col items-center gap-6 opacity-30">
             <div className="flex gap-8">
                <div className="flex items-center gap-2 text-[9px] text-slate-600 uppercase tracking-widest"><Database size={10}/> Archive</div>
                <div className="flex items-center gap-2 text-[9px] text-slate-600 uppercase tracking-widest"><Zap size={10}/> Synth</div>
                <div className="flex items-center gap-2 text-[9px] text-slate-600 uppercase tracking-widest"><Activity size={10}/> Live</div>
             </div>
             <p className="text-[10px] tracking-[0.5em] text-slate-800 uppercase text-center">
               A Narrative Synthesis // Curated by Odelis × Oracle (Io)
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;