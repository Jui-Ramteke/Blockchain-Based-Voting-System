import React, { useState } from 'react';
import { Candidate, DemoAccount, ElectionInfo, ElectionState, Voter } from '../types';
import { SimpleMerkleTree } from '../utils/merkle';
import { sound } from '../utils/audio';
import { WalletSignatureModal } from './WalletSignatureModal';
import { VotingCertificateModal, VotingCertificateData } from './VotingCertificateModal';
import {
  Vote,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Clock,
  Printer,
  Download,
  Stamp,
  Zap,
  UserCheck,
  Play,
  Award,
  Users,
  Cpu,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VoterDashboardProps {
  currentAccount: DemoAccount;
  election: ElectionInfo;
  candidates: Candidate[];
  voterInfo?: Voter;
  merkleTree: SimpleMerkleTree;
  onVote: (candidateId: number) => { success: boolean; error?: string; txHash?: string };
  onSwitchAccount: (account: DemoAccount) => void;
  onStartElection?: () => void;
  onAutoWhitelist?: (address: string) => void;
  onNavigateToResults?: () => void;
  accounts: DemoAccount[];
}

export const VoterDashboard: React.FC<VoterDashboardProps> = ({
  currentAccount,
  election,
  candidates,
  voterInfo,
  merkleTree,
  onVote,
  onSwitchAccount,
  onStartElection,
  onAutoWhitelist,
  onNavigateToResults,
  accounts,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [certificateData, setCertificateData] = useState<VotingCertificateData | null>(null);
  const [isCastingDirectly, setIsCastingDirectly] = useState(false);
  const [attackSimulationResult, setAttackSimulationResult] = useState<string | null>(null);
  const [whitelistSuccessMessage, setWhitelistSuccessMessage] = useState<string | null>(null);
  const [voteErrorText, setVoteErrorText] = useState<string | null>(null);

  const isRegistered = voterInfo?.isRegistered ?? false;
  const hasVoted = voterInfo?.hasVoted ?? false;
  const isElectionActive = election.state === ElectionState.ACTIVE;

  // Merkle Proof check for current address
  const userAddress = currentAccount.address.toLowerCase();
  const merkleProof = merkleTree.getProof(userAddress);
  const isMerkleValid = merkleTree.verify(userAddress, merkleProof, election.merkleRoot || merkleTree.getRoot());

  // Candidate object chosen
  const chosenCandidate = candidates.find((c) => c.id === selectedCandidateId);

  const handleSelectCandidate = (candidateId: number) => {
    sound.playClick();
    setSelectedCandidateId(candidateId);
    setVoteErrorText(null);
  };

  const handleAutoWhitelistAccount = () => {
    sound.playClick();
    if (onAutoWhitelist) {
      onAutoWhitelist(currentAccount.address);
      setWhitelistSuccessMessage(`Wallet ${currentAccount.address.slice(0, 8)}... successfully registered & added to on-chain Merkle whitelist.`);
      setTimeout(() => setWhitelistSuccessMessage(null), 4000);
    }
  };

  // Direct Fast Voting for any candidate
  const handleVoteCandidateDirectly = (candidateId: number) => {
    sound.playStamp();
    setSelectedCandidateId(candidateId);
    setVoteErrorText(null);
    setIsCastingDirectly(true);

    // If not registered yet, auto-whitelist automatically to ensure frictionless voting
    if (!isRegistered && onAutoWhitelist) {
      onAutoWhitelist(currentAccount.address);
    }

    setTimeout(() => {
      const res = onVote(candidateId);
      setIsCastingDirectly(false);

      if (res.success) {
        sound.playSuccessChime();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#0284c7', '#10b981', '#6366f1', '#f59e0b'],
        });

        const targetCandidate = candidates.find((c) => c.id === candidateId);
        const txHash = res.txHash || '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const blockNumber = Math.floor(1040 + Math.random() * 20);
        const nullifier = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

        setCertificateData({
          voterAddress: currentAccount.address,
          candidateName: targetCandidate?.name || `Candidate #${candidateId}`,
          candidateParty: targetCandidate?.party || 'Democratic Coalition',
          txHash,
          blockNumber,
          timestamp: Date.now(),
          electionName: election.name,
          merkleRoot: election.merkleRoot || merkleTree.getRoot(),
          nullifierHash: nullifier,
        });
      } else {
        sound.playRevert();
        setVoteErrorText(res.error || 'Transaction Reverted on EVM.');
      }
    }, 350);
  };

  // Direct Fast Voting from Step 2
  const handleDirectVote = () => {
    if (selectedCandidateId === null) {
      if (candidates.length > 0) {
        handleVoteCandidateDirectly(candidates[0].id);
      }
      return;
    }
    handleVoteCandidateDirectly(selectedCandidateId);
  };

  // Web3 Signature Modal Confirmation
  const handleExecuteOnChainVote = () => {
    if (selectedCandidateId === null) {
      return { success: false, error: 'No candidate selected' };
    }
    if (!isRegistered && onAutoWhitelist) {
      onAutoWhitelist(currentAccount.address);
    }
    return onVote(selectedCandidateId);
  };

  const handleVoteConfirmed = (txHash: string, blockNumber: number) => {
    setIsWalletModalOpen(false);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#0284c7', '#10b981', '#6366f1', '#f59e0b'],
    });

    const nullifier = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setCertificateData({
      voterAddress: currentAccount.address,
      candidateName: chosenCandidate?.name || `Candidate #${selectedCandidateId}`,
      candidateParty: chosenCandidate?.party || 'Democratic Coalition',
      txHash,
      blockNumber,
      timestamp: Date.now(),
      electionName: election.name,
      merkleRoot: election.merkleRoot || merkleTree.getRoot(),
      nullifierHash: nullifier,
    });
  };

  const handleTestDoubleVoteAttack = () => {
    sound.playClick();
    const targetId = selectedCandidateId || (candidates[0]?.id ?? 1);
    const res = onVote(targetId);
    if (!res.success) {
      sound.playRevert();
      setAttackSimulationResult(`[EVM Revert Caught]: "${res.error}" — The Solidity smart contract rejected the unauthorized transaction and state was preserved.`);
    } else {
      setAttackSimulationResult(`[Vote Allowed]: Transaction succeeded on-chain.`);
    }
  };

  // Helper to find eligible registered voters who haven't voted yet
  const eligibleVoterAccount = accounts.find((a) => a.role === 'VOTER');
  const nextUnvotedVoter = accounts.find((a) => a.role === 'VOTER' && a.address.toLowerCase() !== currentAccount.address.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Voter Profile & Cryptographic Eligibility Card */}
      <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm shadow-sky-100/50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="text-3xl p-2 bg-sky-50 border border-sky-200 rounded-2xl shadow-xs">
              {currentAccount.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900">{currentAccount.name}</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300 font-bold">
                  {currentAccount.role}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {currentAccount.balanceEth} ETH
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5 break-all">
                Address: <span className="text-sky-700 font-semibold">{currentAccount.address}</span>
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
                {/* On-Chain Whitelist Status */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">On-Chain Registry:</span>
                  {isRegistered ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Registered & Eligible
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-rose-700">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" /> Not Registered
                    </span>
                  )}
                </div>

                <span className="text-slate-300">|</span>

                {/* Merkle Proof Status */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Merkle Whitelist Proof:</span>
                  {isMerkleValid ? (
                    <span className="inline-flex items-center gap-1 font-bold text-sky-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> Verified ({merkleProof.length} nodes)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Proof Not Found
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Account Switcher */}
          <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-3 text-xs flex flex-col gap-2 w-full lg:w-auto shadow-xs">
            <span className="text-[11px] text-slate-600 font-bold">Select Active Wallet Persona:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {accounts.slice(1, 6).map((acc) => (
                <button
                  key={acc.address}
                  onClick={() => {
                    sound.playClick();
                    onSwitchAccount(acc);
                    setSelectedCandidateId(null);
                    setAttackSimulationResult(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    currentAccount.address === acc.address
                      ? 'bg-sky-600 text-white font-bold shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-sky-100 border border-sky-200'
                  }`}
                >
                  {acc.avatar} {acc.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {whitelistSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{whitelistSuccessMessage}</span>
        </div>
      )}

      {voteErrorText && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 text-rose-900 shadow-sm flex items-start justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs block text-rose-950">Ballot Submission Status</span>
              <p className="text-xs text-rose-800">{voteErrorText}</p>
            </div>
          </div>
          <button
            onClick={() => setVoteErrorText(null)}
            className="text-rose-700 hover:text-rose-950 p-1 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Ineligible Account Helper Banner */}
      {!isRegistered && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-amber-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">
                You are currently viewing with {currentAccount.name} ({currentAccount.role})
              </h4>
              <p className="text-xs text-amber-800">
                This wallet is not yet in the Merkle whitelist. You can whitelist it with 1 click or switch to an eligible voter.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onAutoWhitelist && (
              <button
                type="button"
                onClick={handleAutoWhitelistAccount}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                Whitelist This Wallet Now
              </button>
            )}

            {eligibleVoterAccount && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSwitchAccount(eligibleVoterAccount);
                }}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                Switch to {eligibleVoterAccount.name.split(' ')[0]}
              </button>
            )}
          </div>
        </div>
      )}

      {/* NOT STARTED Election Helper Banner */}
      {!isElectionActive && election.state === ElectionState.NOT_STARTED && (
        <div className="bg-sky-50 border border-sky-300 rounded-2xl p-4 text-sky-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-sky-950">Election Setup Phase (NOT_STARTED)</h4>
              <p className="text-xs text-sky-800">
                Start the voting window to allow registered voters to cast on-chain ballots.
              </p>
            </div>
          </div>

          {onStartElection && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onStartElection();
              }}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <Play className="w-4 h-4" />
              Start Election Now
            </button>
          )}
        </div>
      )}

      {/* Ballot Status Banner */}
      {hasVoted ? (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 text-emerald-900 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-950">Ballot Successfully Cast On-Chain</h3>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                Your vote was cryptographically recorded in the Solidity smart contract tally. Double-voting prevention is active (<code className="font-mono bg-emerald-100 px-1 py-0.5 rounded font-bold">hasVoted = true</code>).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                const nullifier = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
                setCertificateData({
                  voterAddress: currentAccount.address,
                  candidateName: chosenCandidate?.name || 'Verified Democratic Ballot Choice',
                  candidateParty: chosenCandidate?.party || 'Democratically Recorded',
                  txHash: voterInfo?.txHash || '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
                  blockNumber: 1045,
                  timestamp: voterInfo?.voteTimestamp || Date.now(),
                  electionName: election.name,
                  merkleRoot: election.merkleRoot || merkleTree.getRoot(),
                  nullifierHash: nullifier,
                });
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Download Certificate
            </button>

            {onNavigateToResults && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onNavigateToResults();
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Award className="w-4 h-4" />
                View Live Results
              </button>
            )}

            {nextUnvotedVoter && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSwitchAccount(nextUnvotedVoter);
                  setSelectedCandidateId(null);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
              >
                <Users className="w-4 h-4 text-emerald-600" />
                Switch to {nextUnvotedVoter.name.split(' ')[0]}
              </button>
            )}
          </div>
        </div>
      ) : isElectionActive && isRegistered ? (
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-200 rounded-2xl p-4 text-sky-900 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Decentralized Voting Booth Open</p>
              <p className="text-xs text-slate-600">
                Select your preferred candidate below, then click <strong>Fast Cast</strong> or <strong>Web3 Signer</strong> to cast your ballot.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl whitespace-nowrap shadow-xs">
            1 Ballot Token Ready
          </span>
        </div>
      ) : null}

      {/* Official Interactive Ballot Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Step 1: Select Candidate from Official Ballot</h3>
            <p className="text-xs text-slate-500">
              Click any candidate card below to review their platform and cast your vote.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 font-medium">{candidates.length} Registered Candidates</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {candidates.map((c) => {
            const isSelected = selectedCandidateId === c.id;

            return (
              <div
                key={c.id}
                onClick={() => handleSelectCandidate(c.id)}
                className={`bg-white border-2 rounded-2xl p-5 flex flex-col justify-between transition-all relative overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-sky-100 ${
                  isSelected
                    ? 'border-sky-600 bg-sky-50/40 shadow-md shadow-sky-100 ring-2 ring-sky-400/30'
                    : 'border-sky-100 hover:border-sky-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-sky-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${c.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                      #{c.id}
                    </div>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-bold">
                      Candidate #{c.id}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{c.name}</h4>
                  <p className="text-xs font-semibold text-indigo-600 mt-0.5">{c.party}</p>

                  <div className="mt-3 bg-sky-50/50 border border-sky-100 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-medium">
                    {c.bio}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-sky-100 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {isSelected ? '✓ Selected Choice' : 'Candidate Choice'}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-sky-600 border-sky-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {!hasVoted && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVoteCandidateDirectly(c.id);
                      }}
                      disabled={isCastingDirectly}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                        isSelected
                          ? 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-sky-600/30'
                          : 'bg-sky-50 hover:bg-sky-600 text-sky-800 hover:text-white border border-sky-200 hover:border-sky-600'
                      }`}
                    >
                      {isCastingDirectly && selectedCandidateId === c.id ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Recording on Chain...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Cast Ballot for {c.name.split(' ')[0]}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Casting Chamber */}
      {selectedCandidateId && !hasVoted && (
        <div className="bg-white border-2 border-sky-300 rounded-2xl p-6 shadow-md shadow-sky-100/70 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Stamp className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">Step 2: Confirm & Cast Ballot</h3>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Review your ballot selection and choose your preferred execution method.
              </p>
            </div>

            <div className="bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-xl text-xs font-mono text-sky-900 flex items-center gap-2 font-bold">
              <span>Candidate: {chosenCandidate?.name}</span>
              <span className="text-slate-300">|</span>
              <span className="text-indigo-600">ID #{selectedCandidateId}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-sky-600" /> Fast Cast (1-Click Instant)
                </span>
                <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                  Directly executes the <code className="font-mono bg-sky-100 px-1 py-0.5 rounded text-sky-900">vote({selectedCandidateId})</code> smart contract transaction with automatic gas handling and immediate certificate generation.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDirectVote}
                disabled={isCastingDirectly}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCastingDirectly ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Recording on Blockchain...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Fast Cast Ballot for {chosenCandidate?.name.split(' ')[0]}
                  </>
                )}
              </button>
            </div>

            <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-indigo-600" /> Web3 Interactive Signer
                </span>
                <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                  Opens the simulated Web3 signature chamber to customize gas priority (Gwei), inspect raw calldata selector, and view EVM execution opcodes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsWalletModalOpen(true);
                }}
                className="w-full py-3 bg-white hover:bg-sky-50 text-sky-800 border border-sky-300 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Stamp className="w-4 h-4 text-sky-600" />
                Sign with Web3 Wallet Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security & Attack Simulation Chamber (For Education) */}
      <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Educational Sandbox: Test Double-Voting & Sybil Attacks
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-500 font-medium">EVM Revert Simulator</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Try triggering an unauthorized second vote or voting with an unregistered wallet to inspect how Solidity modifiers (<code className="text-sky-700 font-mono bg-sky-50 px-1 py-0.5 rounded">require(!voters[msg.sender].hasVoted)</code>) protect election integrity:
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleTestDoubleVoteAttack}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Simulate Double-Vote from Current Wallet
          </button>
        </div>

        {attackSimulationResult && (
          <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl text-xs font-mono text-rose-900 animate-in fade-in duration-150">
            {attackSimulationResult}
          </div>
        )}
      </div>

      {/* Web3 Wallet Signature Modal Simulator */}
      {isWalletModalOpen && selectedCandidateId && (
        <WalletSignatureModal
          title="Sign & Cast Official Vote"
          methodName="vote"
          contractAddress="0x5FbDB2315678afecb367f032d93F642f64180aa3"
          fromAccount={currentAccount}
          params={{
            candidateId: selectedCandidateId,
            candidateName: chosenCandidate?.name,
            ballotSecrecy: 'Protected (Not emitted)',
          }}
          gasLimit={68400}
          onConfirm={handleExecuteOnChainVote}
          onClose={() => setIsWalletModalOpen(false)}
          onSuccess={handleVoteConfirmed}
        />
      )}

      {/* Official Verifiable Voting Certificate Modal */}
      {certificateData && (
        <VotingCertificateModal
          data={certificateData}
          onClose={() => setCertificateData(null)}
        />
      )}
    </div>
  );
};
