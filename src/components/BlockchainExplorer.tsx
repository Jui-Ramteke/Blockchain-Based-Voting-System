import React, { useState } from 'react';
import { BlockchainTransaction, BlockchainEvent } from '../types';
import { Layers, Hash, CheckCircle2, XCircle, Clock, Cpu, Filter, ExternalLink } from 'lucide-react';

interface BlockchainExplorerProps {
  transactions: BlockchainTransaction[];
  events: BlockchainEvent[];
  contractAddress: string;
}

export const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({
  transactions,
  events,
  contractAddress,
}) => {
  const [selectedTx, setSelectedTx] = useState<BlockchainTransaction | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'txs' | 'events'>('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">Blockchain Ledger & Event Explorer</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable transaction history, gas consumption, and emitted smart contract events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Contract:</span>
          <span className="text-xs font-mono px-2.5 py-1 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 font-bold">
            {contractAddress}
          </span>
        </div>
      </div>

      {/* Transactions & Events Ledger */}
      <div className="bg-white border border-sky-100 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Hash className="w-4 h-4 text-sky-600" /> Mined Transactions & Execution Traces ({transactions.length})
          </h3>
          <span className="text-xs text-slate-400 font-medium">Latest block first</span>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.hash}
              onClick={() => setSelectedTx(tx)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedTx?.hash === tx.hash
                  ? 'bg-sky-50/80 border-sky-500 shadow-xs'
                  : 'bg-white border-sky-100 hover:border-sky-300 hover:bg-sky-50/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {tx.status === 'SUCCESS' ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                  )}
                  <span className="font-mono font-bold text-slate-900 text-sm">{tx.method}()</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-bold">
                    Block #{tx.blockNumber}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      tx.status === 'SUCCESS'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                  <span>Gas: {tx.gasUsed.toLocaleString()}</span>
                  <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="mt-2.5 font-mono text-[11px] text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>
                  From: <span className="text-sky-800 font-bold">{tx.from.slice(0, 8)}...{tx.from.slice(-6)}</span>
                </span>
                <span>
                  Hash: <span className="text-slate-400">{tx.hash.slice(0, 16)}...</span>
                </span>
                {tx.revertReason && (
                  <span className="text-rose-700 font-sans font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    Revert: "{tx.revertReason}"
                  </span>
                )}
              </div>

              {tx.eventsEmitted && tx.eventsEmitted.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-sky-100 flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Emitted Events:</span>
                  {tx.eventsEmitted.map((ev, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg font-mono text-[10px] font-bold"
                    >
                      {ev.name}({JSON.stringify(ev.data)})
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-sky-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">Transaction Details</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-600 hover:text-slate-900 text-xs px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-4 space-y-2.5 font-mono text-xs text-slate-800">
              <div className="flex justify-between border-b border-sky-200 pb-1.5">
                <span className="text-slate-500">Method:</span>
                <span className="text-sky-800 font-bold">{selectedTx.method}()</span>
              </div>
              <div className="flex justify-between border-b border-sky-200 pb-1.5">
                <span className="text-slate-500">Status:</span>
                <span className={selectedTx.status === 'SUCCESS' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                  {selectedTx.status}
                </span>
              </div>
              <div className="flex justify-between border-b border-sky-200 pb-1.5">
                <span className="text-slate-500">Block Number:</span>
                <span className="text-slate-900 font-bold">#{selectedTx.blockNumber}</span>
              </div>
              <div className="flex justify-between border-b border-sky-200 pb-1.5">
                <span className="text-slate-500">Transaction Hash:</span>
                <span className="text-sky-700 truncate max-w-[240px] font-bold">{selectedTx.hash}</span>
              </div>
              <div className="flex justify-between border-b border-sky-200 pb-1.5">
                <span className="text-slate-500">Sender (From):</span>
                <span className="text-sky-800 font-bold truncate max-w-[240px]">{selectedTx.from}</span>
              </div>
              <div className="flex justify-between border-b border-sky-200 pb-1.5">
                <span className="text-slate-500">Contract (To):</span>
                <span className="text-slate-700 truncate max-w-[240px]">{selectedTx.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gas Used:</span>
                <span className="text-amber-800 font-bold">{selectedTx.gasUsed.toLocaleString()} units</span>
              </div>
            </div>

            {selectedTx.revertReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
                <strong>Revert Reason:</strong> {selectedTx.revertReason}
              </div>
            )}

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Back to Ledger
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
