import React, { useState } from 'react';
import { SimpleMerkleTree, hashVoter } from '../utils/merkle';
import { DemoAccount, ElectionInfo } from '../types';
import { sound } from '../utils/audio';
import { Binary, ShieldCheck, CheckCircle2, XCircle, Search, Key, Database, Sparkles, Layers, ArrowDown } from 'lucide-react';

interface MerkleVisualizerProps {
  merkleTree: SimpleMerkleTree;
  election: ElectionInfo;
  accounts: DemoAccount[];
}

export const MerkleVisualizer: React.FC<MerkleVisualizerProps> = ({
  merkleTree,
  election,
  accounts,
}) => {
  const [testAddress, setTestAddress] = useState(accounts[1]?.address || '');
  const root = merkleTree.getRoot();
  const proof = merkleTree.getProof(testAddress);
  const isValid = merkleTree.verify(testAddress, proof, root);
  const leafHash = testAddress ? hashVoter(testAddress) : '';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <Binary className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-bold text-slate-900">Merkle Tree Voter Whitelist & Eligibility Proofs</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Cryptographic zero-storage voter eligibility verification. Proves membership in $O(\log N)$ gas complexity.
        </p>
      </div>

      {/* Merkle Root Storage Callout */}
      <div className="bg-white border border-sky-100 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-mono text-sky-700 font-bold">
              Current On-Chain Merkle Root (bytes32)
            </span>
            <div className="font-mono text-xs text-slate-800 mt-1 break-all bg-sky-50 px-3 py-2 rounded-lg border border-sky-200 font-medium">
              {root}
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs text-slate-500">Total Registered Leaves:</span>
            <div className="text-xl font-black text-slate-900">{merkleTree.addresses.length} Wallets</div>
          </div>
        </div>
      </div>

      {/* Interactive Whitelist Proof Tester */}
      <div className="bg-white border border-sky-100 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">Interactive Merkle Proof Tester</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Verify any wallet address against the root</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Test Wallet Address:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testAddress}
                onChange={(e) => setTestAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1 bg-sky-50/50 border border-sky-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <span className="text-slate-500 font-medium">Try Sample:</span>
            {accounts.map((acc) => (
              <button
                key={acc.address}
                onClick={() => {
                  sound.playClick();
                  setTestAddress(acc.address);
                }}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                  testAddress.toLowerCase() === acc.address.toLowerCase()
                    ? 'bg-sky-600 text-white border-sky-600 font-bold shadow-xs'
                    : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50'
                }`}
              >
                {acc.name.split(' ')[0]} ({acc.role})
              </button>
            ))}
          </div>
        </div>

        {/* Proof Output Box */}
        <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Proof Verification:</span>
              {isValid ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Valid Whitelist Proof (Eligible to Vote)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                  <XCircle className="w-4 h-4 text-rose-600" /> Invalid Proof (Not in Whitelist)
                </span>
              )}
            </div>
            <span className="text-xs font-mono text-slate-500 font-semibold">
              Proof Length: {proof.length} sibling hashes
            </span>
          </div>

          <div className="font-mono text-xs space-y-2">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Voter Leaf Node (keccak256(address)):</span>
              <div className="text-sky-800 break-all bg-white p-2 rounded-lg border border-sky-200 mt-0.5 font-semibold">
                {leafHash || 'None'}
              </div>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Cryptographic Audit Path (Proof Array):</span>
              {proof.length > 0 ? (
                <div className="space-y-1 mt-1">
                  {proof.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-700 bg-white p-2 rounded-lg border border-sky-200">
                      <span className="text-slate-500 text-[10px] font-bold">Sibling #{idx + 1}:</span>
                      <span className="truncate text-sky-700 font-semibold">{p}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 italic p-2 bg-white rounded-lg border border-sky-100">No proof path available for this address.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Merkle Tree Hierarchy Visualization */}
      <div className="bg-white border border-sky-100 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">Tree Hierarchy & Layers</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Depth: {merkleTree.layers.length} Layers</span>
        </div>

        <div className="space-y-4 overflow-x-auto py-2">
          {merkleTree.layers.map((layer, layerIdx) => (
            <div key={layerIdx} className="space-y-1">
              <div className="text-[11px] font-mono text-slate-600 uppercase font-bold">
                {layerIdx === merkleTree.layers.length - 1
                  ? '👑 Layer (Root Node)'
                  : layerIdx === 0
                  ? '🌱 Layer 0 (Leaf Hashes)'
                  : `🌿 Layer ${layerIdx} (Intermediate Hashes)`}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {layer.map((hash, nodeIdx) => (
                  <div
                    key={nodeIdx}
                    className={`p-2.5 rounded-xl border font-mono text-[11px] break-all ${
                      hash.toLowerCase() === root.toLowerCase()
                        ? 'bg-sky-100 border-sky-400 text-sky-950 font-bold shadow-xs'
                        : hash.toLowerCase() === leafHash.toLowerCase()
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-sky-50/40 border-sky-200 text-slate-600'
                    }`}
                  >
                    <div className="text-[9px] text-slate-400 uppercase mb-0.5 font-sans font-bold">
                      Node [{layerIdx}][{nodeIdx}]
                    </div>
                    {hash}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Merkle Proofs in Blockchain Voting? */}
      <div className="bg-white border border-sky-100 rounded-xl p-5 space-y-2 text-xs shadow-sm">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          Gas Economics: On-Chain Storage vs Merkle Whitelist
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 pt-2 leading-relaxed">
          <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-200">
            <span className="font-bold text-rose-800 block mb-1">Traditional On-Chain Mapping:</span>
            Storing 100,000 voter addresses on Ethereum storage slots (<code className="font-mono text-rose-700 bg-rose-100 px-1 py-0.5 rounded">SSTORE</code>) costs ~20,000 gas per voter = <strong>2,000,000,000 gas (~$80,000 in fees)</strong>.
          </div>
          <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200">
            <span className="font-bold text-emerald-800 block mb-1">Merkle Root Architecture:</span>
            Admin uploads ONLY one 32-byte root hash (20,000 gas total = <strong>~$0.80</strong>). Each voter supplies a 3-hash sibling proof when voting for instant verification.
          </div>
        </div>
      </div>
    </div>
  );
};
