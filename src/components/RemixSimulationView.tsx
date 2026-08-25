import React, { useState } from 'react';
import { REMIX_SIMULATION_STEPS, RemixSimulationStep } from '../contracts/RemixGuide';
import { sound } from '../utils/audio';
import { ListOrdered, Play, CheckCircle2, AlertTriangle, Info, Camera, ArrowRight, RotateCcw, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

export const RemixSimulationView: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [copiedLog, setCopiedLog] = useState<number | null>(null);

  const currentStep = REMIX_SIMULATION_STEPS[currentStepIndex];

  const handleNextStep = () => {
    sound.playClick();
    if (!completedSteps.includes(currentStep.step)) {
      setCompletedSteps((prev) => [...prev, currentStep.step]);
    }
    if (currentStepIndex < REMIX_SIMULATION_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    sound.playClick();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleAutoPlay = () => {
    sound.playBroadcast();
    setIsAutoPlaying(true);
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= REMIX_SIMULATION_STEPS.length) {
        clearInterval(interval);
        setIsAutoPlaying(false);
        sound.playSuccessChime();
        return;
      }
      sound.playClick();
      setCurrentStepIndex(idx);
      setCompletedSteps((prev) => (prev.includes(REMIX_SIMULATION_STEPS[idx].step) ? prev : [...prev, REMIX_SIMULATION_STEPS[idx].step]));
      idx++;
    }, 800);
  };

  const handleReset = () => {
    sound.playClick();
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setIsAutoPlaying(false);
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedLog(id);
    setTimeout(() => setCopiedLog(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">Remix IDE Virtual Simulation Guide (20 Steps)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step walkthrough in Remix VM demonstrating multi-account setup, voting, double-voting prevention, and winner declaration.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="https://remix.ethereum.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-sky-50 text-slate-700 text-xs font-bold rounded-xl border border-sky-200 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
            Open Remix IDE
          </a>
          <button
            onClick={handleAutoPlay}
            disabled={isAutoPlaying}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-sky-600/25 cursor-pointer disabled:cursor-not-allowed"
          >
            <Play className="w-3.5 h-3.5" />
            {isAutoPlaying ? 'Simulating Steps...' : 'Auto-Play 20 Steps'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-sky-50 text-slate-700 text-xs font-bold rounded-xl border border-sky-200 transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset
          </button>
        </div>
      </div>

      {/* Interactive Step Card Hero */}
      <div className="bg-white border border-sky-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-sky-600/30">
              {currentStep.step}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-sky-700 font-bold">
                Step {currentStep.step} of 20
              </span>
              <h3 className="text-lg font-bold text-slate-900">{currentStep.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Active Signer:</span>
            <span className="px-2.5 py-1 bg-sky-50 rounded-xl border border-sky-200 text-xs font-mono text-sky-900 font-bold">
              {currentStep.account} ({currentStep.accountRole})
            </span>
          </div>
        </div>

        {/* Action and Expected Result */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-4 space-y-1.5">
            <span className="text-slate-500 font-mono uppercase text-[10px] block font-bold">Action to Perform in Remix:</span>
            <p className="text-slate-900 text-sm font-bold leading-relaxed">{currentStep.action}</p>
            <div className="pt-2 font-mono text-[11px] text-sky-800 font-semibold bg-white p-2 rounded-lg border border-sky-200">
              <code>{currentStep.codeOrCommand}</code>
            </div>
          </div>

          <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-4 space-y-1.5">
            <span className="text-slate-500 font-mono uppercase text-[10px] block font-bold">Expected Terminal / UI Output:</span>
            <p className="text-emerald-800 text-sm font-bold leading-relaxed">{currentStep.expectedResult}</p>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-lg border border-amber-200 font-medium">
              <Camera className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>{currentStep.screenshotTip}</span>
            </div>
          </div>
        </div>

        {/* Transaction Log Box */}
        <div className="bg-slate-900 border border-sky-900/50 rounded-xl p-4 space-y-2 shadow-inner">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-sky-300 font-bold">
              <Terminal className="w-3.5 h-3.5 text-sky-400" /> Simulated Remix VM Console Log
            </span>
            <button
              onClick={() => handleCopy(currentStep.transactionLog, currentStep.step)}
              className="text-[11px] text-sky-300 hover:text-white flex items-center gap-1 cursor-pointer font-sans font-medium"
            >
              {copiedLog === currentStep.step ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedLog === currentStep.step ? 'Copied' : 'Copy Log'}
            </button>
          </div>
          <pre className="font-mono text-xs text-sky-100 whitespace-pre-wrap leading-relaxed bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            {currentStep.transactionLog}
          </pre>
        </div>

        {/* Navigation Step Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 bg-white hover:bg-sky-50 disabled:opacity-40 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-sky-200 shadow-2xs"
          >
            ← Previous Step
          </button>

          <span className="text-xs font-mono text-slate-500 font-bold">
            {completedSteps.length} of 20 Steps Completed ({Math.round((completedSteps.length / 20) * 100)}%)
          </span>

          <button
            onClick={handleNextStep}
            disabled={currentStepIndex === REMIX_SIMULATION_STEPS.length - 1}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-sky-600/25 flex items-center gap-1.5 cursor-pointer"
          >
            Next Step →
          </button>
        </div>
      </div>

      {/* Complete 20-Step Checklist Overview */}
      <div className="bg-white border border-sky-100 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Full 20-Step Course Simulation Matrix</h3>
          <span className="text-xs text-slate-500 font-medium">Click any step to inspect</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {REMIX_SIMULATION_STEPS.map((step) => {
            const isSelected = step.step === currentStep.step;
            const isCompleted = completedSteps.includes(step.step);

            return (
              <button
                key={step.step}
                onClick={() => setCurrentStepIndex(step.step - 1)}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50 border-sky-500 text-sky-950 shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-800 hover:border-sky-300'
                    : 'bg-white border-sky-100 text-slate-600 hover:border-sky-200 hover:bg-sky-50/30'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                    isSelected
                      ? 'bg-sky-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {step.step}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs truncate text-slate-900">{step.title}</span>
                    <span
                      className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${
                        step.statusType === 'success'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : step.statusType === 'revert'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {step.statusType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">{step.action}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
