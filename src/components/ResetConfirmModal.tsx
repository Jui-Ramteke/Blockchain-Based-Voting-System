import React, { useState } from 'react';
import { ElectionState } from '../types';
import { sound } from '../utils/audio';
import { RotateCcw, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, X, Play, Settings } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: (mode: ElectionState) => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
}) => {
  const [selectedMode, setSelectedMode] = useState<ElectionState>(ElectionState.ACTIVE);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    sound.playClick();
    setIsResetting(true);
    setTimeout(() => {
      onConfirmReset(selectedMode);
      setIsResetting(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-sky-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Reset Everything
              </h3>
              <p className="text-xs text-rose-100 font-medium">
                Reset blockchain state, ledger, tallies & voter records
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-rose-950 block mb-0.5">Warning: Immutable State Restoration</span>
              This action will completely flush all cast ballots, reset candidates' vote tallies to zero, regenerate the Merkle tree, and reset the simulated blockchain ledger to block #1050.
            </div>
          </div>

          {/* Reset Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Choose Reset Target Mode:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Mode 1: Active Demo Mode */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMode(ElectionState.ACTIVE);
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  selectedMode === ElectionState.ACTIVE
                    ? 'border-sky-600 bg-sky-50/70 text-sky-950 shadow-sm ring-2 ring-sky-400/20'
                    : 'border-slate-200 hover:border-sky-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-emerald-600" />
                    Active Voting Demo
                  </span>
                  {selectedMode === ElectionState.ACTIVE && (
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Sets state to <strong>ACTIVE</strong> with 3 initial candidates & whitelisted voters ready to cast votes immediately.
                </p>
              </button>

              {/* Mode 2: Clean Setup Phase */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMode(ElectionState.NOT_STARTED);
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  selectedMode === ElectionState.NOT_STARTED
                    ? 'border-sky-600 bg-sky-50/70 text-sky-950 shadow-sm ring-2 ring-sky-400/20'
                    : 'border-slate-200 hover:border-sky-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-amber-600" />
                    Fresh Setup (NOT_STARTED)
                  </span>
                  {selectedMode === ElectionState.NOT_STARTED && (
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Sets state to <strong>NOT_STARTED</strong> so you can test registering custom candidates and whitelisting voters from scratch.
                </p>
              </button>
            </div>
          </div>

          {/* Reset Checklist Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs text-slate-700">
            <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
              Included in this reset:
            </span>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>All cast ballots cleared (<code className="font-mono text-slate-800">totalVotes = 0</code>)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>All voter eligibility restored (<code className="font-mono text-slate-800">hasVoted = false</code>)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Merkle Tree recalculated with default eligible addresses</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Simulated block ledger & EVM transaction logs wiped</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Wallet persona reset to Deployer Admin</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer shadow-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isResetting}
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/30 flex items-center gap-2 cursor-pointer"
          >
            {isResetting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Resetting Everything...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Confirm & Reset Everything</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
