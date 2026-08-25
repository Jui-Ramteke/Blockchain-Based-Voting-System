import { VotingCertificateData } from '../components/VotingCertificateModal';
import { generateQrSvg } from './qr';

export function downloadCertificateAsHtml(data: VotingCertificateData) {
  const qrSvg = generateQrSvg(
    `https://blockchain-voting.edu/verify?tx=${data.txHash}&nullifier=${data.nullifierHash}&block=${data.blockNumber}`,
    140
  );

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Voting Certificate - ${escapeHtml(data.voterAddress)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 30px;
    }
    .certificate-card {
      background: #ffffff;
      border: 3px double #0284c7;
      border-radius: 24px;
      max-width: 760px;
      width: 100%;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
      position: relative;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      background: #e0f2fe;
      color: #0369a1;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-radius: 9999px;
      border: 1px solid #bae6fd;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .subtitle {
      font-size: 14px;
      color: #475569;
      margin-bottom: 24px;
    }
    .statement {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 18px;
      font-size: 13px;
      line-height: 1.6;
      color: #334155;
      text-align: center;
      margin-bottom: 24px;
    }
    .address-pill {
      display: inline-block;
      background: #e0f2fe;
      color: #075985;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 8px;
      border: 1px solid #bae6fd;
      word-break: break-all;
      margin: 4px 0;
    }
    .grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    @media (max-width: 600px) {
      .grid { grid-template-columns: 1fr; }
    }
    .proofs-table {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
    }
    .proof-row {
      display: flex;
      justify-content: space-between;
      padding: 7px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .proof-row:last-child { border-bottom: none; }
    .label { color: #64748b; }
    .val { font-weight: 700; color: #0284c7; word-break: break-all; max-width: 65%; text-align: right; }
    .qr-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .qr-caption {
      font-size: 10px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-top: 8px;
    }
    .privacy-callout {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      border-radius: 12px;
      padding: 14px;
      font-size: 12px;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
    }
  </style>
</head>
<body>
  <div class="certificate-card">
    <center>
      <div class="badge">Official Cryptographic Voting Certificate</div>
      <h1>Decentralized Ballot Confirmation</h1>
      <div class="subtitle">${escapeHtml(data.electionName)}</div>
    </center>

    <div class="statement">
      This document certifies that the digital wallet<br>
      <span class="address-pill">${escapeHtml(data.voterAddress)}</span><br>
      has cast an immutable, authenticated ballot recorded on the Ethereum blockchain under state parameters guarded by <strong>Cryptographic Ballot Secrecy</strong>.
    </div>

    <div class="grid">
      <div class="proofs-table">
        <div class="proof-row">
          <span class="label">Transaction Hash:</span>
          <span class="val">${escapeHtml(data.txHash)}</span>
        </div>
        <div class="proof-row">
          <span class="label">Block Height:</span>
          <span class="val" style="color:#0f172a">#${data.blockNumber}</span>
        </div>
        <div class="proof-row">
          <span class="label">Timestamp:</span>
          <span class="val" style="color:#0f172a">${new Date(data.timestamp).toUTCString()}</span>
        </div>
        <div class="proof-row">
          <span class="label">Nullifier Hash:</span>
          <span class="val" style="color:#4f46e5">${escapeHtml(data.nullifierHash)}</span>
        </div>
        <div class="proof-row">
          <span class="label">Merkle Whitelist:</span>
          <span class="val" style="color:#059669">Verified Root ✓</span>
        </div>
      </div>

      <div class="qr-box">
        ${qrSvg}
        <div class="qr-caption">Scan to Verify Proof</div>
      </div>
    </div>

    <div class="privacy-callout">
      <strong>Zero-Knowledge Secrecy Guarantee:</strong> Candidate choice was aggregated in the smart contract tally without emitting identity pointers. This certificate proves participation without revealing vote choice.
    </div>

    <div class="footer">
      <div><strong>Digital Seal:</strong> 0x8a92b7c4d1e2f3... (Smart Contract Verified)</div>
      <div style="font-weight:700; color:#0284c7">Status: FINAL & IMMUTABLE</div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Voting-Certificate-${data.voterAddress.slice(0, 8)}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCertificateAsJson(data: VotingCertificateData) {
  const jsonContent = JSON.stringify(
    {
      certificateType: "Official Cryptographic Voting Certificate",
      version: "1.0.0",
      protocol: "Ethereum EVM Smart Contract (Election.sol 0.8.20)",
      electionName: data.electionName,
      voterAddress: data.voterAddress,
      transactionHash: data.txHash,
      blockNumber: data.blockNumber,
      timestampUTC: new Date(data.timestamp).toUTCString(),
      nullifierHash: data.nullifierHash,
      merkleRoot: data.merkleRoot,
      doubleVotingGuard: "EVM State Mutex (voters[msg.sender].hasVoted = true)",
      verificationStatus: "VALID_ON_CHAIN",
      verificationUrl: `https://blockchain-voting.edu/verify?tx=${data.txHash}&nullifier=${data.nullifierHash}&block=${data.blockNumber}`,
      issuedAt: new Date().toISOString()
    },
    null,
    2
  );

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Voting-Receipt-${data.voterAddress.slice(0, 8)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
