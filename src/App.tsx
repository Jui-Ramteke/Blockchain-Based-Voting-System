import React, { useState, useEffect, useMemo } from 'react';
import { BlockchainVotingEngine, DEMO_ACCOUNTS } from './services/blockchainEngine';
import { DemoAccount, ElectionInfo, ElectionState, Candidate, Voter, BlockchainTransaction, BlockchainEvent } from './types';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { VoterDashboard } from './components/VoterDashboard';
import { ResultsDashboard } from './components/ResultsDashboard';
import { MerkleVisualizer } from './components/MerkleVisualizer';
import { HardhatTestRunner } from './components/HardhatTestRunner';
import { RemixSimulationView } from './components/RemixSimulationView';
import { SolidityCodeView } from './components/SolidityCodeView';
import { SecurityPrivacyExplainer } from './components/SecurityPrivacyExplainer';
import { BlockchainExplorer } from './components/BlockchainExplorer';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { sound } from './utils/audio';
import { BrowserProvider } from 'ethers';
import { CheckCircle2, RotateCcw, X } from 'lucide-react';

export default function App() {
  const engine = useMemo(() => new BlockchainVotingEngine(), []);

  const [accounts, setAccounts] = useState<DemoAccount[]>(DEMO_ACCOUNTS);
  const [selectedAccount, setSelectedAccount] = useState<DemoAccount>(DEMO_ACCOUNTS[0]);
  const [activeTab, setActiveTab] = useState<string>('admin');
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Trigger state refreshes from engine
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLiveWeb3, setIsLiveWeb3] = useState(false);
  const [metaMaskAddress, setMetaMaskAddress] = useState<string | null>(null);

  const forceRefresh = () => setRefreshTrigger((prev) => prev + 1);

  // Derived state from engine
  const election: ElectionInfo = engine.election;
  const candidates: Candidate[] = Array.from(engine.candidates.values());
  const voters: Voter[] = Array.from(engine.voters.values());
  const transactions: BlockchainTransaction[] = engine.transactions;
  const events: BlockchainEvent[] = engine.events;

  // Active voter info
  const currentVoterInfo = engine.voters.get(selectedAccount.address.toLowerCase());

  // Connect MetaMask if user requests
  const handleConnectMetaMask = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setMetaMaskAddress(address);
        setIsLiveWeb3(true);

        // Add or switch to MetaMask account
        const liveAcc: DemoAccount = {
          name: 'MetaMask Wallet',
          role: address.toLowerCase() === election.admin.toLowerCase() ? 'ADMIN' : 'VOTER',
          address: address,
          balanceEth: '5.25',
          avatar: '🦊',
        };

        setAccounts((prev) => {
          if (prev.some((a) => a.address.toLowerCase() === address.toLowerCase())) {
            return prev;
          }
          return [...prev, liveAcc];
        });
        setSelectedAccount(liveAcc);
      } catch (err) {
        console.warn('MetaMask connection rejected or unavailable:', err);
      }
    } else {
      alert('MetaMask extension was not detected. The DApp is running in high-fidelity In-Browser EVM Simulation mode.');
    }
  };

  const handleResetDemo = () => {
    setIsResetModalOpen(true);
  };

  const handleConfirmReset = (mode: ElectionState) => {
    engine.resetEverything(mode);
    setSelectedAccount(DEMO_ACCOUNTS[0]);
    if (mode === ElectionState.NOT_STARTED) {
      setActiveTab('admin');
      setResetSuccessMessage('EVM State reset to Fresh Setup Phase (NOT_STARTED). You can now register custom candidates and start the election.');
    } else {
      setResetSuccessMessage('EVM State reset to Active Voting Demo. All votes cleared, tallies zeroed, and eligible voters ready.');
    }
    sound.playSuccessChime();
    forceRefresh();
    setTimeout(() => {
      setResetSuccessMessage(null);
    }, 6000);
  };

  // Contract operations
  const handleAddCandidate = (name: string, party: string, bio: string) => {
    const res = engine.addCandidate(selectedAccount.address, name, party, bio);
    forceRefresh();
    return res;
  };

  const handleRegisterVoter = (voterAddress: string) => {
    const res = engine.registerVoter(selectedAccount.address, voterAddress);
    forceRefresh();
    return res;
  };

  const handleRegisterMultiple = (addresses: string[]) => {
    const res = engine.registerMultipleVoters(selectedAccount.address, addresses);
    forceRefresh();
    return res;
  };

  const handleStartElection = () => {
    const res = engine.startElection(selectedAccount.address);
    forceRefresh();
    return res;
  };

  const handleEndElection = () => {
    const res = engine.endElection(selectedAccount.address);
    forceRefresh();
    return res;
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    if (newTab === 'voter' && selectedAccount.role === 'ADMIN') {
      // Auto-switch to an eligible voter (Alice Vance) when navigating to Voter Ballot
      const voterAcc = accounts.find((a) => a.role === 'VOTER') || DEMO_ACCOUNTS[1];
      setSelectedAccount(voterAcc);
    } else if (newTab === 'admin' && selectedAccount.role !== 'ADMIN') {
      // Auto-switch to Admin when navigating to Admin Authority
      const adminAcc = accounts.find((a) => a.role === 'ADMIN') || DEMO_ACCOUNTS[0];
      setSelectedAccount(adminAcc);
    }
  };

  const handleAutoWhitelist = (address: string) => {
    engine.whitelistVoterDirectly(address);
    forceRefresh();
  };

  const handleVote = (candidateId: number) => {
    const res = engine.vote(selectedAccount.address, candidateId);
    forceRefresh();
    return res;
  };

  const handleGetWinner = () => {
    return engine.getWinner();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/30 to-slate-50 text-slate-800 flex flex-col font-sans selection:bg-sky-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        accounts={accounts}
        selectedAccount={selectedAccount}
        onSelectAccount={setSelectedAccount}
        election={election}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isLiveWeb3={isLiveWeb3}
        onConnectMetaMask={handleConnectMetaMask}
        onResetDemo={handleResetDemo}
        onOpenResetModal={() => setIsResetModalOpen(true)}
      />

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmReset={handleConfirmReset}
      />

      {/* Reset Success Toast Banner */}
      {resetSuccessMessage && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs block text-emerald-950">System Reset Successful</span>
                <p className="text-xs text-emerald-800">{resetSuccessMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setResetSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-950 p-1.5 rounded-lg hover:bg-emerald-100/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'admin' && (
          <AdminDashboard
            currentAccount={selectedAccount}
            election={election}
            candidates={candidates}
            voters={voters}
            onAddCandidate={handleAddCandidate}
            onRegisterVoter={handleRegisterVoter}
            onRegisterMultiple={handleRegisterMultiple}
            onStartElection={handleStartElection}
            onEndElection={handleEndElection}
            onSwitchToAdmin={() => setSelectedAccount(DEMO_ACCOUNTS[0])}
            onNavigateToResults={() => setActiveTab('results')}
            onOpenResetModal={() => setIsResetModalOpen(true)}
          />
        )}

        {activeTab === 'voter' && (
          <VoterDashboard
            currentAccount={selectedAccount}
            election={election}
            candidates={candidates}
            voterInfo={currentVoterInfo}
            merkleTree={engine.merkleTree}
            onVote={handleVote}
            onSwitchAccount={setSelectedAccount}
            onStartElection={handleStartElection}
            onAutoWhitelist={handleAutoWhitelist}
            onNavigateToResults={() => setActiveTab('results')}
            accounts={accounts}
          />
        )}

        {activeTab === 'results' && (
          <ResultsDashboard
            election={election}
            candidates={candidates}
            voters={voters}
            onGetWinner={handleGetWinner}
            onEndElection={handleEndElection}
          />
        )}

        {activeTab === 'merkle' && (
          <MerkleVisualizer
            merkleTree={engine.merkleTree}
            election={election}
            accounts={accounts}
          />
        )}

        {activeTab === 'hardhat' && <HardhatTestRunner />}

        {activeTab === 'remix' && <RemixSimulationView />}

        {activeTab === 'contracts' && <SolidityCodeView />}

        {activeTab === 'security' && <SecurityPrivacyExplainer />}

        {activeTab === 'explorer' && (
          <BlockchainExplorer
            transactions={transactions}
            events={events}
            contractAddress={engine.contractAddress}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-sky-100 py-6 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span className="font-semibold text-sky-900">
              Blockchain-Based Voting System Prototype
            </span>
          </div>
          <div className="text-slate-500">
            Educational Coursework · Solidity 0.8.20 · Hardhat · Merkle Eligibility · Ethers.js
          </div>
        </div>
      </footer>
    </div>
  );
}
