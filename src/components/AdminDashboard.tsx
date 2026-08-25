import React, { useState } from 'react';
import { Candidate, DemoAccount, ElectionInfo, ElectionState, Voter } from '../types';
import { sound } from '../utils/audio';
import { ShieldCheck, UserPlus, Play, StopCircle, UserCheck, AlertTriangle, CheckCircle, Info, Sparkles, FileText, ChevronRight, Hash, Users, Vote as VoteIcon, RotateCcw } from 'lucide-react';

interface AdminDashboardProps {
  currentAccount: DemoAccount;
  election: ElectionInfo;
  candidates: Candidate[];
  voters: Voter[];
  onAddCandidate: (name: string, party: string, bio: string) => { success: boolean; error?: string };
  onRegisterVoter: (address: string) => { success: boolean; error?: string };
  onRegisterMultiple: (addresses: string[]) => { success: boolean; addedCount: number; error?: string };
  onStartElection: () => { success: boolean; error?: string };
  onEndElection: () => { success: boolean; error?: string };
  onSwitchToAdmin: () => void;
  onNavigateToResults: () => void;
  onOpenResetModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentAccount,
  election,
  candidates,
  voters,
  onAddCandidate,
  onRegisterVoter,
  onRegisterMultiple,
  onStartElection,
  onEndElection,
  onSwitchToAdmin,
  onNavigateToResults,
  onOpenResetModal,
}) => {
  // Candidate form state
  const [candidateName, setCandidateName] = useState('');
  const [candidateParty, setCandidateParty] = useState('');
  const [candidateBio, setCandidateBio] = useState('');
  const [candidateMsg, setCandidateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Voter form state
  const [singleVoterAddress, setSingleVoterAddress] = useState('');
  const [batchVoterInput, setBatchVoterInput] = useState('');
  const [voterMsg, setVoterMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [regMode, setRegMode] = useState<'single' | 'batch'>('single');

  // General action status
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = currentAccount.role === 'ADMIN';

  const handleAddCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setCandidateMsg(null);
    if (!candidateName.trim()) {
      sound.playRevert();
      setCandidateMsg({ type: 'error', text: 'Candidate name cannot be empty.' });
      return;
    }
    const res = onAddCandidate(candidateName, candidateParty, candidateBio);
    if (res.success) {
      sound.playSuccessChime();
      setCandidateMsg({ type: 'success', text: `Candidate "${candidateName}" registered successfully on-chain!` });
      setCandidateName('');
      setCandidateParty('');
      setCandidateBio('');
    } else {
      sound.playRevert();
      setCandidateMsg({ type: 'error', text: res.error || 'Failed to add candidate.' });
    }
  };

  const handleSingleVoterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setVoterMsg(null);
    if (!singleVoterAddress.trim()) {
      sound.playRevert();
      setVoterMsg({ type: 'error', text: 'Please enter a valid Ethereum wallet address.' });
      return;
    }
    const res = onRegisterVoter(singleVoterAddress.trim());
    if (res.success) {
      sound.playSuccessChime();
      setVoterMsg({ type: 'success', text: `Wallet ${singleVoterAddress.slice(0, 10)}... registered as eligible voter!` });
      setSingleVoterAddress('');
    } else {
      sound.playRevert();
      setVoterMsg({ type: 'error', text: res.error || 'Failed to register voter.' });
    }
  };

  const handleBatchVoterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setVoterMsg(null);
    const lines = batchVoterInput
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (lines.length === 0) {
      sound.playRevert();
      setVoterMsg({ type: 'error', text: 'Enter at least one wallet address.' });
      return;
    }

    const res = onRegisterMultiple(lines);
    if (res.success) {
      sound.playSuccessChime();
      setVoterMsg({ type: 'success', text: `Successfully registered ${res.addedCount} new voter addresses in batch transaction!` });
      setBatchVoterInput('');
    } else {
      sound.playRevert();
      setVoterMsg({ type: 'error', text: res.error || 'Failed batch registration.' });
    }
  };

  const handleStart = () => {
    sound.playClick();
    setActionStatus(null);
    const res = onStartElection();
    if (res.success) {
      sound.playSuccessChime();
      setActionStatus({ type: 'success', text: 'Election started! State is now ACTIVE. Eligible voters can cast ballots.' });
    } else {
      sound.playRevert();
      setActionStatus({ type: 'error', text: res.error || 'Failed to start election.' });
    }
  };

  const handleEnd = () => {
    sound.playClick();
    setActionStatus(null);
    const res = onEndElection();
    if (res.success) {
      sound.playSuccessChime();
      setActionStatus({ type: 'success', text: 'Election ended! State is now ENDED. Final results & winner are sealed.' });
    } else {
      sound.playRevert();
      setActionStatus({ type: 'error', text: res.error || 'Failed to end election.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Privilege Warning Banner if not Admin */}
      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                You are currently connected as "{currentAccount.name}" ({currentAccount.role})
              </p>
              <p className="text-xs text-amber-800">
                Administrative functions (Add Candidate, Register Voter, State Transitions) require the Election Admin private key.
              </p>
            </div>
          </div>
          <button
            onClick={onSwitchToAdmin}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer shadow-xs"
          >
            Switch to Admin Wallet
          </button>
        </div>
      )}

      {/* Action Notification */}
      {actionStatus && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 shadow-xs ${
            actionStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {actionStatus.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{actionStatus.text}</span>
        </div>
      )}

      {/* Overview & Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-sky-100 rounded-xl p-4 shadow-sm shadow-sky-100/50">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-950">Election Phase</span>
            <ShieldCheck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {election.state === ElectionState.NOT_STARTED && 'NOT_STARTED (0)'}
            {election.state === ElectionState.ACTIVE && 'ACTIVE (1)'}
            {election.state === ElectionState.ENDED && 'ENDED (2)'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {election.state === ElectionState.NOT_STARTED && 'Candidate & Voter setup phase'}
            {election.state === ElectionState.ACTIVE && 'Voting open to whitelisted wallets'}
            {election.state === ElectionState.ENDED && 'Voting closed, tally immutable'}
          </p>
        </div>

        <div className="bg-white border border-sky-100 rounded-xl p-4 shadow-sm shadow-sky-100/50">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-950">Candidates Registered</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{candidates.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {candidates.length >= 2 ? 'Minimum met (>= 2 candidates)' : 'Requires >= 2 to start'}
          </p>
        </div>

        <div className="bg-white border border-sky-100 rounded-xl p-4 shadow-sm shadow-sky-100/50">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-950">Whitelisted Voters</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{voters.filter((v) => v.isRegistered).length}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {voters.filter((v) => v.hasVoted).length} has cast ballot on-chain
          </p>
        </div>

        <div className="bg-white border border-sky-100 rounded-xl p-4 shadow-sm shadow-sky-100/50">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-950">Total Ballots Cast</span>
            <VoteIcon className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{election.totalVotes}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {voters.length > 0
              ? `${Math.round((election.totalVotes / (voters.filter((v) => v.isRegistered).length || 1)) * 100)}% Turnout`
              : '0% Turnout'}
          </p>
        </div>
      </div>

      {/* State Transition Action Bar */}
      <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Election Lifecycle Controls</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300 font-mono font-bold">
                Admin Modifier Guard
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Transition the smart contract state machine. State changes are atomic and permanent on the blockchain.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {election.state === ElectionState.NOT_STARTED && (
              <button
                onClick={handleStart}
                disabled={!isAdmin || candidates.length < 2}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                  isAdmin && candidates.length >= 2
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
              >
                <Play className="w-4 h-4" />
                Start Election (Open Voting)
              </button>
            )}

            {election.state === ElectionState.ACTIVE && (
              <button
                onClick={handleEnd}
                disabled={!isAdmin}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                  isAdmin
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
              >
                <StopCircle className="w-4 h-4" />
                End Election (Seal Tally)
              </button>
            )}

            {election.state === ElectionState.ENDED && (
              <button
                onClick={onNavigateToResults}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-sky-600/25"
              >
                <Sparkles className="w-4 h-4" />
                View Official Result & Winner
              </button>
            )}

            {onOpenResetModal && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenResetModal();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300 transition-all cursor-pointer shadow-xs"
                title="Reset election state, ledger, and all voter records"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                Reset Everything
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Setup Management: Candidate Registration & Voter Whitelisting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Registration Panel */}
        <div className="bg-white border border-sky-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Register Candidate</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    addCandidate(name, party, bio)
                  </p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-bold">
                Phase: NOT_STARTED
              </span>
            </div>

            {election.state !== ElectionState.NOT_STARTED ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 mb-4">
                <div className="flex items-center gap-2 text-amber-900 font-bold mb-1">
                  <Info className="w-4 h-4 text-amber-600" />
                  Candidate Registration Locked
                </div>
                Candidate roster cannot be modified after the election has started or ended to preserve democratic stability.
              </div>
            ) : (
              <form onSubmit={handleAddCandidateSubmit} className="space-y-3 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Candidate Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    disabled={!isAdmin}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Party / Group Affiliation
                  </label>
                  <input
                    type="text"
                    value={candidateParty}
                    onChange={(e) => setCandidateParty(e.target.value)}
                    placeholder="e.g. Decentralized Governance Union"
                    disabled={!isAdmin}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Platform Proposal / Slogan
                  </label>
                  <textarea
                    value={candidateBio}
                    onChange={(e) => setCandidateBio(e.target.value)}
                    placeholder="Key campaign policies and student initiatives..."
                    rows={2}
                    disabled={!isAdmin}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 disabled:opacity-50"
                  />
                </div>

                {candidateMsg && (
                  <div
                    className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                      candidateMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-50 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {candidateMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />}
                    <span className="font-medium">{candidateMsg.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isAdmin || !candidateName.trim()}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs"
                >
                  + Add Candidate to Smart Contract
                </button>
              </form>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-sky-100 text-[11px] text-slate-500">
            💡 <span className="font-semibold text-slate-700">Solidity Rule:</span> Candidates are assigned sequential IDs in storage. <code className="text-sky-700 font-mono bg-sky-50 px-1 py-0.5 rounded">candidates[candidateCount]</code>.
          </div>
        </div>

        {/* Voter Whitelist Registration Panel */}
        <div className="bg-white border border-sky-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-700">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Register Eligible Voters</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    registerVoter(address) & Batch Whitelisting
                  </p>
                </div>
              </div>

              {/* Toggle single vs batch */}
              <div className="flex items-center bg-sky-50 border border-sky-200 rounded-lg p-0.5 text-[11px]">
                <button
                  onClick={() => setRegMode('single')}
                  className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                    regMode === 'single' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-900'
                  }`}
                >
                  Single
                </button>
                <button
                  onClick={() => setRegMode('batch')}
                  className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                    regMode === 'batch' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-900'
                  }`}
                >
                  Batch (Multi)
                </button>
              </div>
            </div>

            {election.state !== ElectionState.NOT_STARTED ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 mb-4">
                <div className="flex items-center gap-2 text-amber-900 font-bold mb-1">
                  <Info className="w-4 h-4 text-amber-600" />
                  Voter Registration Closed
                </div>
                The voter roll is immutable once voting starts to prevent unauthorized voter injections mid-election.
              </div>
            ) : regMode === 'single' ? (
              <form onSubmit={handleSingleVoterSubmit} className="space-y-3 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Voter Ethereum Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={singleVoterAddress}
                    onChange={(e) => setSingleVoterAddress(e.target.value)}
                    placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                    disabled={!isAdmin}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSingleVoterAddress('0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65')}
                    className="text-[11px] text-sky-600 hover:text-sky-800 underline cursor-pointer font-medium"
                  >
                    Load Sample Account 4 (Diana)
                  </button>
                </div>

                {voterMsg && (
                  <div
                    className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                      voterMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-50 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {voterMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />}
                    <span className="font-medium">{voterMsg.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isAdmin || !singleVoterAddress.trim()}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs"
                >
                  ✓ Whitelist Voter Address On-Chain
                </button>
              </form>
            ) : (
              <form onSubmit={handleBatchVoterSubmit} className="space-y-3 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enter multiple addresses (separated by newlines or commas)
                  </label>
                  <textarea
                    value={batchVoterInput}
                    onChange={(e) => setBatchVoterInput(e.target.value)}
                    placeholder="0x90F79bf6EB2c4f870365E785982E1f101E93b906&#10;0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
                    rows={3}
                    disabled={!isAdmin}
                    className="w-full bg-sky-50/50 border border-sky-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setBatchVoterInput(
                        '0x90F79bf6EB2c4f870365E785982E1f101E93b906\n0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65\n0x9965507D1a55bcC2695C58ba16FB37d819B0A4df'
                      )
                    }
                    className="text-[11px] text-sky-600 hover:text-sky-800 underline cursor-pointer font-medium"
                  >
                    Fill 3 Sample Wallets
                  </button>
                </div>

                {voterMsg && (
                  <div
                    className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                      voterMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-50 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {voterMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />}
                    <span className="font-medium">{voterMsg.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isAdmin || !batchVoterInput.trim()}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs"
                >
                  ⚡ Register Batch Voter Array
                </button>
              </form>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-sky-100 text-[11px] text-slate-500">
            🛡️ <span className="font-semibold text-slate-700">Security Rule:</span> Rejects <code className="text-amber-700 font-mono bg-amber-50 px-1 py-0.5 rounded">address(0)</code> and duplicate registrations. Updates Merkle tree root automatically.
          </div>
        </div>
      </div>

      {/* Candidate List on Current Ballot */}
      <div className="bg-white border border-sky-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">Ballot Candidates Roster</h3>
            <span className="text-xs text-slate-500">({candidates.length} Registered)</span>
          </div>
          <span className="text-xs font-mono text-slate-500">Smart Contract Storage Array</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {candidates.map((c) => (
            <div
              key={c.id}
              className="bg-sky-50/40 border border-sky-200 rounded-xl p-4 flex flex-col justify-between hover:border-sky-300 transition-colors shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-100 border border-sky-300 text-sky-800 font-bold">
                    ID #{c.id}
                  </span>
                  <span className="text-xs text-slate-600 font-bold">
                    {c.voteCount} {c.voteCount === 1 ? 'Vote' : 'Votes'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                <p className="text-xs text-indigo-600 font-medium mt-0.5">{c.party}</p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">{c.bio}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-sky-200 flex items-center justify-between text-[11px] text-slate-600">
                <span>Total Tally Share:</span>
                <span className="font-bold text-slate-900">
                  {election.totalVotes > 0 ? Math.round((c.voteCount / election.totalVotes) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Whitelisted Voters Registry Table */}
      <div className="bg-white border border-sky-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Voter Registry & Participation Status</h3>
            <span className="text-xs text-slate-500">({voters.length} Whitelisted)</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Privacy: Voter choices are NOT mapped or stored in this table
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-sky-50 text-sky-900 uppercase font-mono text-[10px] border-b border-sky-200">
              <tr>
                <th className="py-2.5 px-3">Voter Wallet Address</th>
                <th className="py-2.5 px-3">Eligibility</th>
                <th className="py-2.5 px-3">Ballot Status</th>
                <th className="py-2.5 px-3">Double-Vote Protection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 font-mono text-xs">
              {voters.map((v) => (
                <tr key={v.address} className="hover:bg-sky-50/60 transition-colors">
                  <td className="py-2.5 px-3 text-slate-900">
                    <span className="text-sky-700 font-semibold">{v.address}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    {v.isRegistered ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Registered
                      </span>
                    ) : (
                      <span className="text-slate-400">Unregistered</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {v.hasVoted ? (
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-sans font-bold">
                        ✓ Casted Ballot
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-sans font-medium">
                        Pending Vote
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-600 font-sans">
                    {v.hasVoted ? (
                      <span className="text-amber-700 font-semibold">Locked (hasVoted = true)</span>
                    ) : (
                      <span className="text-slate-600">1 Vote Available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Reset & State Restoration Zone */}
      <div className="bg-gradient-to-br from-rose-50/50 via-white to-amber-50/40 border border-rose-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">EVM Environment & State Restoration</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold uppercase">
                Reset Zone
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Need to test a new election lifecycle from scratch? Reset all candidate vote counts, clear voter nullifiers, flush transaction blocks, and restore the Merkle whitelist.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              if (onOpenResetModal) onOpenResetModal();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-rose-600/30 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Everything...</span>
          </button>
        </div>
      </div>
    </div>
  );
};
