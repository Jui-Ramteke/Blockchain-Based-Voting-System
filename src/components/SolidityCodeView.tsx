import React, { useState } from 'react';
import { VOTING_SYSTEM_ABI, VOTING_SYSTEM_SOLIDITY_SOURCE } from '../contracts/VotingSystemSol';
import { Code2, Copy, Check, ShieldCheck, FileCheck, Layers, Cpu, Lock } from 'lucide-react';

export const SolidityCodeView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'source' | 'abi'>('source');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const content = viewMode === 'source' ? VOTING_SYSTEM_SOLIDITY_SOURCE : JSON.stringify(VOTING_SYSTEM_ABI, null, 2);
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">Smart Contract Architecture & Solidity 0.8.20 Source</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Production-grade educational Solidity implementation featuring modifiers, ballot secrecy, and tie resolution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-sky-50 border border-sky-200 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setViewMode('source')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'source' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              VotingSystem.sol
            </button>
            <button
              onClick={() => setViewMode('abi')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'abi' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              Contract ABI (JSON)
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-sky-50 text-slate-700 rounded-xl text-xs font-bold transition-all border border-sky-200 cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-sky-600" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Contract Features Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-sky-100 rounded-xl p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-sky-700 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-sky-600" /> Role & State Modifiers
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            <code className="text-sky-800 font-mono bg-sky-50 px-1 py-0.5 rounded border border-sky-200">onlyAdmin</code> and <code className="text-sky-800 font-mono bg-sky-50 px-1 py-0.5 rounded border border-sky-200">inState(state)</code> restrict state mutations to the correct lifecycle phase.
          </p>
        </div>

        <div className="bg-white border border-sky-100 rounded-xl p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
            <Lock className="w-4 h-4 text-emerald-600" /> Privacy-Preserving Events
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            <code className="text-emerald-800 font-mono bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">VoteRecorded(voter, time)</code> avoids leaking candidate choices on-chain, preventing targeted voter retaliation.
          </p>
        </div>

        <div className="bg-white border border-sky-100 rounded-xl p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
            <FileCheck className="w-4 h-4 text-amber-600" /> Deterministic Tie Handler
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            <code className="text-amber-800 font-mono bg-amber-50 px-1 py-0.5 rounded border border-amber-200">getWinner()</code> inspects top tallies and detects deadlocks cleanly without revert crashes.
          </p>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="bg-slate-900 border border-sky-900/50 rounded-2xl overflow-hidden shadow-lg">
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span className="ml-2 font-mono text-sky-200 font-bold">
              {viewMode === 'source' ? 'contracts/VotingSystem.sol' : 'artifacts/VotingSystem.json (ABI)'}
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">Solidity ^0.8.20</span>
        </div>

        <pre className="p-5 font-mono text-xs text-sky-100 overflow-x-auto max-h-[560px] leading-relaxed select-text">
          {viewMode === 'source' ? VOTING_SYSTEM_SOLIDITY_SOURCE : JSON.stringify(VOTING_SYSTEM_ABI, null, 2)}
        </pre>
      </div>
    </div>
  );
};
