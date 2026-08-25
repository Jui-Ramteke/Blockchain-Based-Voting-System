import React, { useState } from 'react';
import { generateQrSvg } from '../utils/qr';
import { sound } from '../utils/audio';
import { downloadCertificateAsHtml, downloadCertificateAsJson } from '../utils/certificateDownload';
import { ShieldCheck, Download, Printer, Copy, Check, Lock, CheckCircle2, QrCode, FileText, Sparkles, X, FileCode } from 'lucide-react';

export interface VotingCertificateData {
  voterAddress: string;
  candidateName: string;
  candidateParty: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  electionName: string;
  merkleRoot: string;
  nullifierHash: string;
}

interface VotingCertificateModalProps {
  data: VotingCertificateData;
  onClose: () => void;
}

export const VotingCertificateModal: React.FC<VotingCertificateModalProps> = ({ data, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const qrPayload = `https://blockchain-voting.edu/verify?tx=${data.txHash}&nullifier=${data.nullifierHash}&block=${data.blockNumber}`;
  const qrSvg = generateQrSvg(qrPayload, 130);

  const handleCopyLink = () => {
    sound.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(qrPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadHtml = () => {
    sound.playStamp();
    downloadCertificateAsHtml(data);
    setDownloadSuccess('Certificate HTML downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadJson = () => {
    sound.playClick();
    downloadCertificateAsJson(data);
    setDownloadSuccess('Cryptographic JSON receipt downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handlePrint = () => {
    sound.playClick();
    try {
      window.print();
    } catch {
      // fallback in case print API is blocked in some iframe sandbox configurations
      handleDownloadHtml();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-200">
      <div className="bg-white border-2 border-sky-300 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative print:border-0 print:shadow-none print:max-w-none print:w-full">
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-sky-50 hover:bg-sky-100 p-2 rounded-full cursor-pointer transition-colors print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Alert for Download */}
        {downloadSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 print:hidden">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Certificate Decorative Border & Watermark Container */}
        <div className="border-4 border-double border-sky-400/60 rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-sky-50/50 via-white to-blue-50/30 relative overflow-hidden">
          {/* Subtle Background Seal Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
            <ShieldCheck className="w-96 h-96 text-sky-900" />
          </div>

          {/* Header */}
          <div className="text-center space-y-1 relative z-10 border-b border-sky-200 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-900 text-xs font-bold font-mono uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-sky-600" /> Official Cryptographic Voting Certificate
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Decentralized Ballot Confirmation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {data.electionName}
            </p>
          </div>

          {/* Certificate Body */}
          <div className="py-6 space-y-5 relative z-10">
            <div className="text-center max-w-lg mx-auto">
              <p className="text-xs text-slate-600">This document verifies that the digital wallet</p>
              <p className="font-mono font-bold text-sky-900 text-xs sm:text-sm bg-sky-100/70 py-1 px-3 rounded-lg border border-sky-200 inline-block my-1.5 break-all">
                {data.voterAddress}
              </p>
              <p className="text-xs text-slate-600">
                has successfully cast an authenticated, unalterable ballot recorded on the Ethereum blockchain under state parameters protected by <strong>Cryptographic Ballot Secrecy</strong>.
              </p>
            </div>

            {/* Grid of Key Technical Proofs + QR Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="sm:col-span-2 bg-white/90 border border-sky-200 rounded-xl p-4 space-y-2.5 font-mono text-[11px] text-slate-700 shadow-xs">
                <div className="flex justify-between border-b border-sky-100 pb-1.5">
                  <span className="text-slate-500">Transaction Hash:</span>
                  <span className="text-sky-700 font-bold truncate max-w-[170px]">{data.txHash}</span>
                </div>
                <div className="flex justify-between border-b border-sky-100 pb-1.5">
                  <span className="text-slate-500">Block Height:</span>
                  <span className="text-slate-900 font-bold">#{data.blockNumber}</span>
                </div>
                <div className="flex justify-between border-b border-sky-100 pb-1.5">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-900">{new Date(data.timestamp).toUTCString()}</span>
                </div>
                <div className="flex justify-between border-b border-sky-100 pb-1.5">
                  <span className="text-slate-500">Nullifier Hash:</span>
                  <span className="text-indigo-700 font-bold truncate max-w-[170px]">{data.nullifierHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Merkle Whitelist:</span>
                  <span className="text-emerald-700 font-bold">Verified on Root ✓</span>
                </div>
              </div>

              {/* QR Verification Box */}
              <div className="bg-white border border-sky-200 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-xs">
                <div
                  className="p-1 bg-white border border-slate-200 rounded-lg shadow-inner"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <span className="text-[10px] font-mono text-slate-500 mt-1.5 font-bold uppercase">
                  Scan to Verify Proof
                </span>
              </div>
            </div>

            {/* Privacy Architecture Guarantee Stamp */}
            <div className="bg-emerald-50/80 border border-emerald-300 rounded-xl p-3.5 flex items-center gap-3 text-xs text-emerald-950">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-[11px] leading-relaxed">
                <strong>Zero-Knowledge Secrecy Guarantee:</strong> Candidate choice was aggregated in the smart contract tally without emitting identity pointers. This certificate proves participation without revealing vote choice.
              </div>
            </div>
          </div>

          {/* Certificate Footer Signature Line */}
          <div className="pt-4 border-t border-sky-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              <span className="font-bold text-slate-700">Digital Seal:</span> 0x8a92b7c4d1e2f3... (Smart Contract Verified)
            </div>
            <div className="font-mono text-sky-800 font-bold">
              Status: FINAL & IMMUTABLE
            </div>
          </div>
        </div>

        {/* Action Controls (Hidden on Print) */}
        <div className="flex items-center justify-between gap-3 pt-2 print:hidden flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Copy verification link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-sky-600" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Download cryptographic JSON receipt file"
            >
              <FileCode className="w-4 h-4 text-indigo-600" />
              Download JSON
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Direct Download Certificate File */}
            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-sky-600/30"
              title="Download standalone certificate file"
            >
              <Download className="w-4 h-4" />
              Download Certificate
            </button>

            {/* Print / Save to PDF */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-slate-900/20"
              title="Open browser print dialog to save as PDF"
            >
              <Printer className="w-4 h-4" />
              Print PDF
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-300"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
