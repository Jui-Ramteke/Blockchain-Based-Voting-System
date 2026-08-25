import React from 'react';
import { ShieldAlert, Lock, EyeOff, UserX, AlertTriangle, CheckCircle2, ShieldCheck, Key, FileWarning, Cpu, Database, Fingerprint } from 'lucide-react';

export const SecurityPrivacyExplainer: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Prominent Educational Disclaimer */}
      <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
            <FileWarning className="w-7 h-7" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold font-mono uppercase tracking-wider">
              Mandatory Academic Disclaimer
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Educational Course Prototype Notice
            </h3>
            <p className="text-xs text-amber-900/90 mt-1 leading-relaxed font-medium">
              This system is strictly an <strong>educational prototype</strong> built for blockchain and smart contract coursework. It uses dummy voters, synthetic candidate profiles, simulated wallets, and test cryptocurrency. It <strong>MUST NOT</strong> be presented or deployed for real governmental, civic, or public elections without addressing complex real-world requirements including coercion-resistance, verifiable paper audit trails, universal accessibility, legal compliance, and Sybil-resistant sovereign identity verification.
            </p>
          </div>
        </div>
      </div>

      {/* Deep-Dive 1: Ballot Secrecy & Privacy Architecture */}
      <div className="bg-white border border-sky-100 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900">1. Ballot Secrecy & Event Privacy Engineering</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Anti-Pattern */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-rose-700 font-bold">
              <UserX className="w-4 h-4 text-rose-600" /> ❌ Vulnerable Anti-Pattern (Destroys Privacy)
            </div>
            <pre className="bg-rose-950 p-2.5 rounded-lg font-mono text-[11px] text-rose-200 border border-rose-900 shadow-inner">
{`// BAD: Publicly links voter to candidate
mapping(address => uint256) public voterChoice;

function vote(uint256 id) public {
    voterChoice[msg.sender] = id; // Leak!
    emit VoteCast(msg.sender, id); // Leak!
}`}
            </pre>
            <p className="text-slate-600 leading-relaxed font-medium">
              Publicly recording individual choices on the blockchain destroys the fundamental democratic principle of the secret ballot. Employers, authoritarian regimes, or vote-buyers can inspect transaction logs and penalize or reward voters based on their vote.
            </p>
          </div>

          {/* Secure Pattern */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> ✅ Recommended Architecture (Preserves Privacy)
            </div>
            <pre className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-emerald-300 border border-emerald-900 shadow-inner">
{`// GOOD: Atomic aggregation & unlinked events
mapping(address => Voter) public voters; // hasVoted only
candidates[candidateId].voteCount++; // Atomic aggregate

// Event ONLY proves participation, NOT choice
emit VoteRecorded(msg.sender, block.timestamp);`}
            </pre>
            <p className="text-slate-600 leading-relaxed font-medium">
              Stores only boolean participation status (<code className="text-emerald-800 font-mono bg-emerald-100 px-1 py-0.5 rounded">hasVoted = true</code>) and increments the aggregate counter. The public event log confirms the voter cast a ballot without publishing their candidate preference.
            </p>
          </div>
        </div>
      </div>

      {/* Deep-Dive 2: Double-Voting Prevention & Reentrancy Guards */}
      <div className="bg-white border border-sky-100 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900">2. Double-Voting Prevention & State Transitions</h3>
        </div>

        <div className="space-y-3 text-xs text-slate-700">
          <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">The Checks-Effects-Interactions Pattern in Voting</h4>
            <p className="leading-relaxed text-slate-600 font-medium">
              Double voting is impossible on Ethereum when state updates follow strict checks before state effects:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-800 font-mono text-[11px]">
              <li><strong>Check 1:</strong> <code className="text-sky-800 bg-sky-100 px-1 py-0.5 rounded">require(state == ElectionState.ACTIVE)</code> — Prevents voting outside official windows.</li>
              <li><strong>Check 2:</strong> <code className="text-sky-800 bg-sky-100 px-1 py-0.5 rounded">require(voters[msg.sender].isRegistered)</code> — Rejects Sybil / unregistered addresses.</li>
              <li><strong>Check 3:</strong> <code className="text-sky-800 bg-sky-100 px-1 py-0.5 rounded">require(!voters[msg.sender].hasVoted)</code> — Reads storage slot before updating.</li>
              <li><strong>Check 4:</strong> <code className="text-sky-800 bg-sky-100 px-1 py-0.5 rounded">require(_candidateId &gt; 0 && _candidateId &lt;= candidateCount)</code> — Validates target.</li>
              <li><strong>Effect:</strong> <code className="text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded font-bold">voters[msg.sender].hasVoted = true</code> is executed <em>before</em> emitting events.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Deep-Dive 3: Real-World E-Voting Challenges */}
      <div className="bg-white border border-sky-100 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900">3. Advanced Real-World Frontiers in Decentralized Voting</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-sky-800 text-sm">Coercion Resistance (MACI)</h4>
            <p className="text-slate-600 leading-relaxed font-medium">
              Minimum Anti-Collusion Infrastructure (MACI) uses encryption and coordinator-keyed state trees so voters can change their private encryption key, rendering forced vote proofs useless to extortionists.
            </p>
          </div>

          <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-sky-800 text-sm">Zero-Knowledge Nullifiers</h4>
            <p className="text-slate-600 leading-relaxed font-medium">
              Using Semaphore / Circom ZK-SNARKs, a voter proves: <em>"I possess a private key in the voter Merkle tree, and here is my unique Nullifier hash"</em> without revealing their public address at all!
            </p>
          </div>

          <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-sky-800 text-sm">Decentralized Identity (DID)</h4>
            <p className="text-slate-600 leading-relaxed font-medium">
              Soulbound Tokens (EIP-5114) or WorldID biometrics prevent 1 person from creating 1,000 dummy Ethereum wallets to vote multiple times (Sybil resistance).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
