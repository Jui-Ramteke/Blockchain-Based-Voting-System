import React, { useState, useEffect } from 'react';
import { DemoAccount } from '../types';
import { sound } from '../utils/audio';
import { ShieldCheck, Fuel, ArrowRight, Code2, AlertTriangle, CheckCircle2, Radio, Zap, Lock, RefreshCw, Layers } from 'lucide-react';

export interface TxRequestPayload {
  title: string;
  methodName: string;
  contractAddress: string;
  fromAccount: DemoAccount;
  params: Record<string, any>;
  rawCalldata?: string;
  gasLimit: number;
  onConfirm: () => { success: boolean; error?: string; txHash?: string };
  onClose: () => void;
  onSuccess?: (txHash: string, blockNumber: number) => void;
}

export const WalletSignatureModal: React.FC<TxRequestPayload> = ({
  title,
  methodName,
  contractAddress,
  fromAccount,
  params,
  rawCalldata,
  gasLimit,
  onConfirm,
  onClose,
  onSuccess,
}) => {
  const [gasSpeed, setGasSpeed] = useState<'eco' | 'market' | 'fast'>('market');
  const [activeTab, setActiveTab] = useState<'details' | 'data' | 'trace'>('details');
  const [step, setStep] = useState<'review' | 'signing' | 'broadcasting' | 'mining' | 'confirmed' | 'failed'>('review');
  const [miningProgress, setMiningProgress] = useState(0);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [minedTxHash, setMinedTxHash] = useState<string>('');
  const [minedBlock, setMinedBlock] = useState<number>(1044);

  // Gas calculation based on speed
  const gweiRate = gasSpeed === 'eco' ? 12 : gasSpeed === 'market' ? 18 : 25;
  const gasEth = ((gasLimit * gweiRate) / 1e9).toFixed(6);
  const gasUsd = (parseFloat(gasEth) * 3150).toFixed(2);

  const calldataHex =
    rawCalldata ||
    '0x' +
      (methodName === 'vote' ? '0121a83b' : '7b69c412') +
      '000000000000000000000000000000000000000000000000000000000000000' +
      (params.candidateId || '1');

  const handleSignAndSend = () => {
    sound.playClick();
    setErrorText(null);
    setStep('signing');
    setMiningProgress(15);

    // Step 1: Simulated ECDSA Private Key Signing
    setTimeout(() => {
      sound.playBroadcast();
      setStep('broadcasting');
      setMiningProgress(45);

      // Step 2: Simulated P2P Mempool broadcast
      setTimeout(() => {
        setStep('mining');
        setMiningProgress(75);

        // Step 3: EVM Execution & Block Mining
        setTimeout(() => {
          const res = onConfirm();
          if (res.success) {
            const hash = res.txHash || '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
            const blockNum = Math.floor(1040 + Math.random() * 20);
            setMinedTxHash(hash);
            setMinedBlock(blockNum);
            setStep('confirmed');
            setMiningProgress(100);
            sound.playSuccessChime();

            if (onSuccess) {
              setTimeout(() => {
                onSuccess(hash, blockNum);
              }, 600);
            }
          } else {
            sound.playRevert();
            setStep('failed');
            setErrorText(res.error || 'Execution Reverted on EVM.');
          }
        }, 650);
      }, 500);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-sky-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Wallet Simulated Chrome Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
              ⟠
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                Web3 Signer · Hardhat EVM
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Chain ID: 31337 (Localhost)</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-mono text-sky-300">
            <span>{fromAccount.avatar}</span>
            <span>{fromAccount.address.slice(0, 6)}...{fromAccount.address.slice(-4)}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {step === 'review' && (
            <>
              {/* Target Contract & Method Header */}
              <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Contract Action:</span>
                  <span className="font-mono font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded border border-sky-300 text-[11px]">
                    {methodName}()
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Contract Target:</span>
                  <span className="font-mono text-slate-700 text-[11px]">
                    {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
                  </span>
                </div>
              </div>

              {/* Tabs: Details / Calldata */}
              <div className="flex border-b border-sky-100 text-xs">
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('details');
                  }}
                  className={`pb-2 px-3 font-semibold transition-colors cursor-pointer ${
                    activeTab === 'details'
                      ? 'text-sky-600 border-b-2 border-sky-600 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Parameters
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('data');
                  }}
                  className={`pb-2 px-3 font-semibold transition-colors cursor-pointer ${
                    activeTab === 'data'
                      ? 'text-sky-600 border-b-2 border-sky-600 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Raw Calldata
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('trace');
                  }}
                  className={`pb-2 px-3 font-semibold transition-colors cursor-pointer ${
                    activeTab === 'trace'
                      ? 'text-sky-600 border-b-2 border-sky-600 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  EVM Opcode Trace
                </button>
              </div>

              {/* Tab 1: Parameter Overview */}
              {activeTab === 'details' && (
                <div className="bg-white border border-sky-100 rounded-xl p-3.5 space-y-2 text-xs">
                  {Object.entries(params).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center py-1 border-b border-sky-50 last:border-0">
                      <span className="text-slate-500 capitalize">{key}:</span>
                      <span className="font-semibold text-slate-900 font-mono text-[11px]">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Raw Hex Calldata */}
              {activeTab === 'data' && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-emerald-400 space-y-1 overflow-x-auto shadow-inner">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Function Selector & Payload</div>
                  <div className="break-all">{calldataHex}</div>
                </div>
              )}

              {/* Tab 3: EVM Execution Simulation */}
              {activeTab === 'trace' && (
                <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-3 text-xs space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center gap-1 text-slate-700 font-bold">
                    <Layers className="w-3.5 h-3.5 text-sky-600" /> Simulated Opcode Steps:
                  </div>
                  <div className="text-slate-600 space-y-0.5 text-[10px] pl-2 border-l border-sky-300">
                    <div>1. <code>CALLER</code> ➔ reads <code>msg.sender</code> ({fromAccount.address.slice(0, 6)}...)</div>
                    <div>2. <code>SLOAD(electionState)</code> ➔ verifies state == ACTIVE</div>
                    <div>3. <code>SLOAD(voters[msg.sender].hasVoted)</code> ➔ verifies !hasVoted</div>
                    <div>4. <code>SSTORE(voters[msg.sender].hasVoted)</code> ➔ sets true</div>
                    <div>5. <code>LOG2(VoteRecorded)</code> ➔ emits event</div>
                  </div>
                </div>
              )}

              {/* Gas Speed Selector */}
              <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Fuel className="w-3.5 h-3.5 text-amber-600" /> Priority Gas Speed
                  </span>
                  <span className="font-mono text-slate-700 font-bold text-[11px]">
                    {gasEth} ETH (~${gasUsd})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['eco', 'market', 'fast'] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setGasSpeed(spd);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer ${
                        gasSpeed === spd
                          ? 'bg-sky-600 text-white font-bold shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-sky-100/60 border border-sky-200'
                      }`}
                    >
                      <span className="capitalize">{spd}</span>
                      <span className="text-[9px] opacity-85 font-mono">
                        {spd === 'eco' ? '12 Gwei' : spd === 'market' ? '18 Gwei' : '25 Gwei'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-slate-200"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={handleSignAndSend}
                  className="flex-1 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-sky-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Sign & Broadcast
                </button>
              </div>
            </>
          )}

          {/* Progress / Mining States */}
          {(step === 'signing' || step === 'broadcasting' || step === 'mining') && (
            <div className="py-6 space-y-5 text-center">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-sky-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-sky-600 border-t-transparent animate-spin"></div>
                <Zap className="w-7 h-7 text-sky-600 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  {step === 'signing' && '1/3 Generating ECDSA Signature...'}
                  {step === 'broadcasting' && '2/3 Broadcasting to P2P Validators...'}
                  {step === 'mining' && '3/3 Executing Smart Contract & Mining Block...'}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  {step === 'signing' && 'Signing with local private key (secp256k1)'}
                  {step === 'broadcasting' && 'Propagating transaction to mempool nodes'}
                  {step === 'mining' && 'Verifying state transitions on EVM Hardhat engine'}
                </p>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-sky-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${miningProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Confirmed State */}
          {step === 'confirmed' && (
            <div className="py-4 space-y-4 text-center">
              <div className="w-14 h-14 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-center text-emerald-700 mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">Transaction Confirmed!</h4>
                <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                  Included in Block #{minedBlock} (1/12 Confirmations)
                </p>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-left font-mono text-[11px] space-y-1.5 text-slate-700">
                <div className="flex justify-between border-b border-sky-200 pb-1">
                  <span className="text-slate-500">Tx Hash:</span>
                  <span className="text-sky-700 font-bold truncate max-w-[200px]">{minedTxHash}</span>
                </div>
                <div className="flex justify-between border-b border-sky-200 pb-1">
                  <span className="text-slate-500">Gas Used:</span>
                  <span className="text-emerald-700 font-bold">{gasLimit.toLocaleString()} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-700 font-bold">0x1 (SUCCESS)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/25"
              >
                Close Receipt
              </button>
            </div>
          )}

          {/* Failed State */}
          {step === 'failed' && (
            <div className="py-4 space-y-4 text-center">
              <div className="w-14 h-14 bg-rose-100 border border-rose-300 rounded-2xl flex items-center justify-center text-rose-700 mx-auto shadow-sm">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">Transaction Reverted</h4>
                <p className="text-xs text-rose-700 font-semibold mt-0.5">
                  EVM Execution Failed / Reverted by Contract
                </p>
              </div>

              {errorText && (
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 text-left font-mono text-xs text-rose-900">
                  <span className="font-bold">Revert Reason:</span> {errorText}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
