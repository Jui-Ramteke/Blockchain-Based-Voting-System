import React, { useState, useEffect } from 'react';
import { DemoAccount, ElectionInfo, ElectionState } from '../types';
import { sound } from '../utils/audio';
import { ShieldCheck, Vote, Award, Binary, Terminal, Code2, Lock, ListOrdered, Layers, CheckCircle2, AlertCircle, RefreshCw, Radio, Volume2, VolumeX, Fuel, Cpu } from 'lucide-react';

interface NavbarProps {
  accounts: DemoAccount[];
  selectedAccount: DemoAccount;
  onSelectAccount: (acc: DemoAccount) => void;
  election: ElectionInfo;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isLiveWeb3: boolean;
  onConnectMetaMask: () => void;
  onResetDemo: () => void;
  onOpenResetModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  accounts,
  selectedAccount,
  onSelectAccount,
  election,
  activeTab,
  onTabChange,
  isLiveWeb3,
  onConnectMetaMask,
  onResetDemo,
  onOpenResetModal,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());
  const [gasTicker, setGasTicker] = useState(18);

  useEffect(() => {
    const timer = setInterval(() => {
      // Slight fluctuation in Gwei for realism
      setGasTicker(Math.floor(16 + Math.random() * 6));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSound = () => {
    const nextState = sound.toggleMute();
    setIsMuted(nextState);
    if (!nextState) {
      sound.playClick();
    }
  };

  const getStateBadge = () => {
    switch (election.state) {
      case ElectionState.NOT_STARTED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            SETUP (NOT_STARTED)
          </span>
        );
      case ElectionState.ACTIVE:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            VOTING LIVE (ACTIVE)
          </span>
        );
      case ElectionState.ENDED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-900 border border-sky-300">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
            CLOSED (ENDED)
          </span>
        );
    }
  };

  const navTabs = [
    { id: 'admin', label: 'Admin Authority', icon: ShieldCheck },
    { id: 'voter', label: 'Voter Ballot', icon: Vote },
    { id: 'results', label: 'Results & Tally', icon: Award },
    { id: 'merkle', label: 'Merkle Whitelist', icon: Binary },
    { id: 'hardhat', label: 'Hardhat Tests (20)', icon: Terminal },
    { id: 'remix', label: 'Remix VM Simulator', icon: ListOrdered },
    { id: 'contracts', label: 'Solidity Contract', icon: Code2 },
    { id: 'security', label: 'Privacy & Security', icon: Lock },
    { id: 'explorer', label: 'Block Ledger', icon: Layers },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-sky-200/80 sticky top-0 z-40 shadow-sm shadow-sky-100/60">
      {/* Top Banner / Academic Context & Network Telemetry */}
      <div className="bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-700 px-4 py-1 text-xs text-white shadow-inner flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-1.5 py-0.5 rounded bg-white/20 border border-white/30 text-white font-mono text-[10px] uppercase tracking-wider font-bold">
            Academic Prototype
          </span>
          <span className="text-sky-100 text-[11px] font-medium hidden sm:inline">
            Solidity ^0.8.20 · Hardhat EVM · Merkle Whitelist · Ethers.js
          </span>
        </div>

        {/* Live Network Indicators & Tactile Audio Toggle */}
        <div className="flex items-center gap-3 text-sky-100 text-[11px] flex-wrap">
          {/* Live Gas Price Ticker */}
          <div className="flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded font-mono text-[10px] text-sky-50 border border-white/20">
            <Fuel className="w-3 h-3 text-amber-300" />
            <span>{gasTicker} Gwei</span>
          </div>

          {/* Node Status */}
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Hardhat Node (16 Peers)</span>
          </div>

          {/* Sound Synthesizer Mute Toggle */}
          <button
            onClick={handleToggleSound}
            className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded bg-white/15 hover:bg-white/25 transition-colors cursor-pointer text-[10px] font-medium"
            title={isMuted ? 'Unmute DApp Tactile Sound' : 'Mute DApp Sound'}
          >
            {isMuted ? <VolumeX className="w-3 h-3 text-rose-300" /> : <Volume2 className="w-3 h-3 text-emerald-300" />}
            <span>{isMuted ? 'Muted' : 'Audio ON'}</span>
          </button>

          {/* Reset Everything Trigger Button */}
          <button
            onClick={() => {
              sound.playClick();
              if (onOpenResetModal) {
                onOpenResetModal();
              } else {
                onResetDemo();
              }
            }}
            className="hover:text-white text-rose-100 bg-rose-500/30 hover:bg-rose-500/50 border border-rose-400/40 flex items-center gap-1.5 transition-all px-2.5 py-0.5 rounded cursor-pointer font-bold text-[10px] shadow-xs"
            title="Open Complete Reset Options Dialog"
          >
            <RefreshCw className="w-3 h-3 text-rose-200" />
            <span>Reset Everything</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/25 border border-sky-400 text-white">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  Blockchain Voting System
                </h1>
                {getStateBadge()}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Decentralized E-Voting with Cryptographic Ballot Secrecy
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls: Account Switcher & Web3 Connect */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Account Selector */}
          <div className="flex items-center gap-2 bg-sky-50/70 border border-sky-200 rounded-xl p-1.5 px-3 shadow-xs">
            <div className="text-lg">{selectedAccount.avatar}</div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">
                  {selectedAccount.name}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono uppercase font-bold ${
                    selectedAccount.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : selectedAccount.role === 'VOTER'
                      ? 'bg-sky-100 text-sky-800 border border-sky-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {selectedAccount.role}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-600">
                {selectedAccount.address.slice(0, 6)}...{selectedAccount.address.slice(-4)} ({selectedAccount.balanceEth} ETH)
              </span>
            </div>
            <select
              value={selectedAccount.address}
              onChange={(e) => {
                sound.playClick();
                const found = accounts.find(
                  (a) => a.address.toLowerCase() === e.target.value.toLowerCase()
                );
                if (found) onSelectAccount(found);
              }}
              className="bg-white text-xs text-slate-800 border border-sky-300 rounded-lg px-2 py-1 focus:outline-none focus:border-sky-500 cursor-pointer ml-1 shadow-xs"
              aria-label="Switch Active Blockchain Account"
            >
              {accounts.map((acc) => (
                <option key={acc.address} value={acc.address}>
                  {acc.avatar} {acc.name} ({acc.role})
                </option>
              ))}
            </select>
          </div>

          {/* MetaMask / Live Provider Connect */}
          <button
            onClick={() => {
              sound.playClick();
              onConnectMetaMask();
            }}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer shadow-xs ${
              isLiveWeb3
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                : 'bg-sky-600 hover:bg-sky-700 text-white border border-sky-500 shadow-sky-600/20'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveWeb3 ? 'text-emerald-600' : 'text-white'}`} />
            {isLiveWeb3 ? 'MetaMask Connected' : 'Connect MetaMask'}
          </button>

          {/* Quick Reset Button */}
          <button
            onClick={() => {
              sound.playClick();
              if (onOpenResetModal) {
                onOpenResetModal();
              } else {
                onResetDemo();
              }
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-bold bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300 transition-all cursor-pointer shadow-xs"
            title="Reset Everything (Ledger, Votes & State)"
          >
            <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Reset Everything</span>
            <span className="sm:hidden">Reset</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-sky-100">
        <nav className="flex space-x-1.5 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  onTabChange(tab.id);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                    : 'text-slate-600 hover:text-sky-900 hover:bg-sky-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-sky-600'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
