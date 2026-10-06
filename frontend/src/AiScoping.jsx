import { useState } from 'react';
import { Bot, Send, Sparkles, Code } from 'lucide-react';

export default function AiScoping({ onAddLedgerEntry }) {
  const [prompt, setPrompt] = useState('');
  const [isScoping, setIsScoping] = useState(false);
  const [milestones, setMilestones] = useState(null);

  const handleScope = (e) => {
    e.preventDefault();
    if (!prompt) return;
    
    setIsScoping(true);
    
    // Simulate AI thinking delay for the demo
    setTimeout(() => {
      setIsScoping(false);
      setMilestones([
        { id: 1, title: 'Architecture & Parsing', desc: 'Setup AST parsing to scan the monorepo for target structures.' },
        { id: 2, title: 'Model Integration', desc: 'Connect Gemini API to evaluate code snippets and embed watermarks.' },
        { id: 3, title: 'Validation & Testing', desc: 'Deploy automated test suite to ensure watermarks survive code formatting.' }
      ]);
      
      // Push event to Live Ledger
      if (onAddLedgerEntry) {
        onAddLedgerEntry({
          action: 'SCOPE_GENERATED',
          actor: 'AI Engine (Gemini)',
          hash: '0x' + Math.random().toString(16).slice(2, 12) + 'd4e5'
        });
      }
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bot className="text-emerald-400 w-6 h-6" />
          AI Scoping Engine
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Collaborate with the AI to break down the locked brief into an exact milestone plan.
        </p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Chat Interface (Left) */}
        <div className="col-span-3 flex flex-col bg-[#09090b] border border-gray-800 rounded-xl overflow-hidden h-[500px] shadow-lg">
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-4 text-sm text-gray-300 leading-relaxed">
                Bid accepted. I have analyzed the confidential brief for <strong>"LLM Watermarking"</strong>. Briefly describe your technical approach below, and I will generate a 3-phase milestone plan for the project charter.
              </div>
            </div>
            
            {milestones && (
              <div className="flex gap-4 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
                  <span className="text-gray-400 text-xs font-bold">ST</span>
                </div>
                <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-4 text-sm text-gray-300">
                  {prompt}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-black/60 border-t border-gray-800 backdrop-blur-md">
            <form onSubmit={handleScope} className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., I will use Python AST modules and SHA-256 hashing..."
                className="w-full bg-[#050505] border border-gray-700 rounded-lg pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                disabled={milestones !== null}
              />
              <button 
                type="submit"
                disabled={isScoping || milestones !== null || !prompt}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 hover:bg-emerald-500 text-black rounded-md disabled:opacity-50 transition"
              >
                {isScoping ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>

        {/* Generated Milestones (Right) */}
        <div className="col-span-2 space-y-4">
          <h3 className="text-sm font-mono uppercase text-gray-500 flex items-center gap-2">
            <Code className="w-4 h-4" /> Proposed Milestones
          </h3>
          
          {!milestones && (
            <div className="border border-dashed border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center text-center h-[440px] bg-black/20">
              <Sparkles className="w-8 h-8 text-gray-700 mb-3" />
              <p className="text-sm text-gray-500">Awaiting technical approach...</p>
            </div>
          )}

          {milestones && (
            <div className="space-y-3 h-[440px] flex flex-col">
              <div className="space-y-3 flex-1">
                {milestones.map((m, i) => (
                  <div key={m.id} className="bg-[#09090b] border border-emerald-900/30 p-4 rounded-lg relative overflow-hidden group hover:border-emerald-500/50 transition">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 group-hover:bg-emerald-400 transition-colors"></div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                      Phase {i + 1}: {m.title}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{m.desc}</p>
                  </div>
                ))}
              </div>
              <button className="w-full bg-emerald-950/40 text-emerald-400 border border-emerald-800 py-3 rounded-lg text-sm font-semibold hover:bg-emerald-900/60 hover:border-emerald-500 transition shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                Approve & Generate Charter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}