# 🗳️ Blockchain-Based Voting System

An auditable, transparent, and decentralized electronic voting application powered by Ethereum smart contracts, Merkle tree cryptographic voter verification, and secret ballot protections.

---

## 📌 Overview

The **Blockchain-Based Voting System** is a decentralized governance platform engineered to conduct secure, tamper-proof, and trustless elections. By leveraging Ethereum Virtual Machine (EVM) smart contracts written in Solidity 0.8.20 and cryptographic Merkle tree data structures, the system ensures that:

- Every ballot cast is immutable, timestamped, and mathematically tallied.
- No central election authority can alter vote counts or forge ballots after deployment.
- Double-voting and Sybil manipulation are cryptographically prevented at the bytecode layer.
- Voter eligibility can be proven using $O(\log n)$ cryptographic Merkle proofs without requiring excessive on-chain storage.
- Real-time auditability is provided to candidates, voters, and independent election monitors.

---

## 🚨 Problem Statement

Traditional paper and centralized electronic voting (E-Voting) systems suffer from fundamental architectural vulnerabilities:

1. **Central Point of Failure & Insider Threats**: Centralized databases can be modified, deleted, or manipulated by privileged database administrators or malicious adversaries.
2. **Lack of End-to-End Verifiability**: Voters cannot independently verify if their individual ballot was included in the final tally without revealing their vote to the public.
3. **Double-Voting & Voter Impersonation**: Traditional systems struggle to authenticate voters across distributed jurisdictions without centralized identity hubs.
4. **Delayed & Contested Results**: Manual counting is slow, resource-intensive, and susceptible to human error, recounts, and disputed results.
5. **High Storage & Gas Costs**: Storing thousands of individual voter records directly on the blockchain incurs high gas fees on public networks.

---

## 🔭 Project Scope

This project encompasses a complete, end-to-end decentralized application (DApp) ecosystem consisting of:

- **Solidity Smart Contract (`Election.sol`)**: Production-ready smart contract handling the full election state machine, candidate roster, voter whitelist root, and atomic vote accumulation.
- **Merkle Tree Proof Engine**: Client-side and contract-side cryptographic inclusion proof generation using Keccak-256 hashing.
- **Web3 Interactive Frontend**: A responsive, modern React/TypeScript user interface featuring role switching (Admin, Voters, Observers), MetaMask integration, fast-cast mechanics, instant auto-whitelisting, cryptographic certificate downloads (HTML & JSON), and multi-mode "Reset Everything" controls.
- **Remix & Hardhat Test Suite**: 20 comprehensive unit and integration test suites covering edge cases, revert assertions, state isolation, and gas benchmarking.

---

## ⚠️ Educational Disclaimer

> **Note on Cryptographic Privacy & EVM Transparency**:  
> Public blockchains are natively transparent ledgers. In this baseline Solidity architecture, while the voter's specific choice is **omitted from on-chain event logs** to prevent casual indexer tracking, transaction calldata and state diffs on public testnets/mainnets can be analyzed unless combined with advanced cryptographic privacy layers such as **Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge (zk-SNARKs / Groth16)**, **Homomorphic Encryption (Paillier Cryptosystems)**, or **Commit-Reveal Schemes**. This project serves as an educational and operational blueprint illustrating EVM state mechanics, access control, and Merkle verification.

---

## 🎯 Objectives

- **Integrity**: Guarantee that no vote can be altered, overwritten, or deleted once confirmed into a mined block.
- **Single-Token Voting**: Ensure each authorized wallet can cast exactly one ballot per election lifecycle.
- **Decentralized Verification**: Enable any third-party auditor to recalculate the election tally by reading contract public storage.
- **Gas Efficiency**: Use Merkle root storage ($32\text{ bytes}$) rather than unbounded on-chain arrays to minimize contract deployment and whitelist costs.
- **Frictionless UX**: Provide an intuitive voting interface with simulated Web3 signing chambers, deterministic nullifier receipts, and printable PDF/QR certificates.

---

## ⛓️ Blockchain Concepts Used

- **Smart Contracts**: Deterministic state-transition code deployed on the EVM executed across decentralized validator nodes.
- **Role-Based Access Control (RBAC)**: Method-level permissioning using custom Solidity function modifiers (`onlyAdmin`, `inState`).
- **Cryptographic Hashing (Keccak-256 / SHA-256)**: Deterministic one-way hashing for leaf nodes, transaction hashes, and proof paths.
- **Merkle Trees & Proofs**: Balanced binary hash trees that allow verification of set membership in logarithmic $O(\log n)$ space and time.
- **EVM State Variables & Mappings**: Key-value lookup tables (`mapping(address => Voter)`) providing $O(1)$ constant-time lookup and state tracking.
- **Event Logging & Bloom Filters**: Indexed EVM logs (`emit ElectionStarted`, `emit VoteCast`) for off-chain client synchronization.
- **Atomic State Transitions**: All-or-nothing execution ensuring that failing conditions (`require` reverts) revert all storage changes and refund unspent gas.

---

## 👥 Actors & User Personas

| Actor | Description | Key Permissions |
|---|---|---|
| **Deployer / Admin** | The official election coordinator who deploys the contract and manages initial parameters. | • Register Candidates<br>• Update Merkle Whitelist Root<br>• Start & End Election Lifecycle<br>• Declare Official Results |
| **Whitelisted Voter** | Registered participant whose Ethereum address is included in the Merkle root. | • Generate Merkle Inclusion Proof<br>• Sign & Cast On-Chain Ballot<br>• Download Verifiable Certificate |
| **Public Auditor / Observer** | Any node or user observing the blockchain network. | • Inspect Real-Time Tallies<br>• Verify Contract Source & Bytecode<br>• Validate Block Transactions & Receipts<br>• Export Cryptographic Audit JSON |

---

## 🏗️ Architecture

```
                                  +---------------------------+
                                  |    Election Coordinator   |
                                  |        (Admin Wallet)     |
                                  +-------------+-------------+
                                                |
                                    1. Deploys & Configures
                                                v
+-----------------------+         +-------------+-------------+         +-----------------------+
|     Voter Wallets     | ------> |      EVM Smart Contract   | <------ |  Independent Auditor  |
| (Alice, Bob, Charlie) |  2. Cast|       `Election.sol`      | 4. Read |  (Public Dashboard)   |
+-----------------------+   Votes +-------------+-------------+  Tallies+-----------------------+
                                                |
                                     3. Emits Immutable
                                        On-Chain Events
                                                v
                                  +-------------+-------------+
                                  |     Blockchain Ledger     |
                                  |  (Blocks, Txns, Gas Logs) |
                                  +---------------------------+
```

---

## 🔄 Election Lifecycle

The election follows a strict three-phase finite state machine (FSM):

```
     [ Deploy Contract ]
              |
              v
     +-----------------+
     |   NOT_STARTED   | <--- Candidate & Voter Registration allowed
     +--------+--------+
              |
              | startElection() [onlyAdmin]
              v
     +-----------------+
     |     ACTIVE      | <--- Voting Chamber open; Candidate additions locked
     +--------+--------+
              |
              | endElection() [onlyAdmin]
              v
     +-----------------+
     |      ENDED      | <--- Voting permanently closed; Final tally locked
     +-----------------+
```

1. **`NOT_STARTED`**: The contract is deployed. The Admin can register candidate profiles and upload/update voter addresses into the Merkle root. Voting is rejected.
2. **`ACTIVE`**: The Admin calls `startElection()`. Whitelisted voters can cast ballots. Candidate registration is permanently locked.
3. **`ENDED`**: The Admin calls `endElection()`. State updates cease, votes are finalized, and the winning candidate(s) are officially declared.

---

## 📝 Candidate Registration

- **Modifier Guard**: Restricted by `onlyAdmin` and `inState(ElectionState.NOT_STARTED)`.
- **Validation**:
  - Candidate name cannot be empty string.
  - Duplicate candidate names are prevented.
  - Unique sequential `candidateId` (starting from 1) assigned automatically.
- **Storage**: Stored in both an array `Candidate[] public candidates` and mapping for $O(1)$ ID lookup.

---

## 🪪 Voter Registration & Merkle Whitelisting

To eliminate high gas costs of storing thousands of addresses on-chain, the system supports two verification pathways:

1. **On-Chain Mapping (Small-Scale & Direct Registry)**:
   ```solidity
   struct Voter {
       bool isRegistered;
       bool hasVoted;
       uint256 voteTimestamp;
   }
   mapping(address => Voter) public voters;
   ```
2. **Cryptographic Merkle Whitelisting (Large-Scale)**:
   - Off-chain: Addresses are hashed (`keccak256(abi.encodePacked(voterAddress))`) and arranged into a Merkle Tree.
   - On-chain: Only the 32-byte `merkleRoot` is stored in the contract via `setMerkleRoot(bytes32 _root)`.
   - Verification: During vote submission or proof generation, the voter submits an array of sibling hashes (`bytes32[] proof`). The contract validates:
     $$\text{verify}(\text{leaf}, \text{proof}, \text{merkleRoot}) == \text{true}$$

---

## 🗳️ Voting Logic

When a voter calls `vote(uint256 _candidateId)`:

1. **State Check**: `require(state == ElectionState.ACTIVE, "Election is not active");`
2. **Eligibility Check**: `require(voters[msg.sender].isRegistered, "Sender is not registered to vote");`
3. **Double-Voting Check**: `require(!voters[msg.sender].hasVoted, "Voter has already cast a ballot");`
4. **Candidate Check**: `require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");`
5. **State Mutex Update**:
   - `voters[msg.sender].hasVoted = true;`
   - `voters[msg.sender].voteTimestamp = block.timestamp;`
   - `candidates[_candidateId].voteCount += 1;`
   - `totalVotes += 1;`
6. **Emit Event**: `emit VoteCast(msg.sender, block.timestamp);` *(Candidate choice is not logged in the event arguments)*.

---

## 🛡️ Double-Voting Prevention

Double voting is prevented through smart contract invariants:

- **State Mutex Lock**: The boolean `voters[msg.sender].hasVoted` is checked prior to any balance or tally manipulation.
- **Reentrancy Protection**: State variables are modified **before** any external event emission or call completion (Checks-Effects-Interactions pattern).
- **EVM Revert**: Any subsequent invocation by the same `msg.sender` triggers an immediate opcode revert (`0xFD`), consuming minimal gas and leaving storage unmodified.

---

## 📊 Result Calculation

- **Live On-Chain Tallies**: Tallies are maintained in real time inside `candidates[id].voteCount`.
- **Winning Candidate Algorithm**:
  ```solidity
  function getWinner() external view returns (uint256 winningCandidateId, string memory winnerName, uint256 highestVotes) {
      require(state == ElectionState.ENDED, "Election has not ended yet");
      uint256 winningVoteCount = 0;
      for (uint256 i = 1; i <= candidatesCount; i++) {
          if (candidates[i].voteCount > winningVoteCount) {
              winningVoteCount = candidates[i].voteCount;
              winningCandidateId = i;
              winnerName = candidates[i].name;
          }
      }
      return (winningCandidateId, winnerName, winningVoteCount);
  }
  ```
- **Tie Detection**: The frontend tally analyzer automatically checks for equal vote counts among leading candidates and flags an official runoff tie condition.

---

## 💻 Technology Stack

- **Smart Contract Language**: Solidity `^0.8.20`
- **Frontend Framework**: React 18 with TypeScript
- **Styling & UI**: Tailwind CSS, Lucide Icons, Canvas Confetti
- **Web3 Libraries**: Ethers.js / Web3.js interfaces, Browser Ethereum Provider API (`window.ethereum`)
- **Cryptography**: Keccak-256 Hashing, Merkle Tree Proof Generator
- **Testing & Simulation**: Hardhat Test Runner, Remix IDE Simulation Engine

---

## 📜 Smart Contract Functions

### Administrative Functions
| Function | Visibility | Modifiers | Description |
|---|---|---|---|
| `startElection()` | `external` | `onlyAdmin`, `inState(NOT_STARTED)` | Transitions election state to `ACTIVE`. |
| `endElection()` | `external` | `onlyAdmin`, `inState(ACTIVE)` | Transitions election state to `ENDED`. |
| `registerCandidate(string _name, string _party, string _bio)` | `external` | `onlyAdmin`, `inState(NOT_STARTED)` | Adds a candidate to the ballot. |
| `whitelistVoter(address _voter)` | `external` | `onlyAdmin`, `inState(NOT_STARTED)` | Whitelists an address on-chain. |
| `whitelistBatch(address[] _voters)` | `external` | `onlyAdmin`, `inState(NOT_STARTED)` | Batch-registers voter addresses. |
| `setMerkleRoot(bytes32 _merkleRoot)` | `external` | `onlyAdmin`, `inState(NOT_STARTED)` | Sets the root hash for cryptographic proofs. |

### Voter Functions
| Function | Visibility | Modifiers | Description |
|---|---|---|---|
| `vote(uint256 _candidateId)` | `external` | `inState(ACTIVE)` | Validates voter eligibility and records vote. |
| `voteWithProof(uint256 _candidateId, bytes32[] _proof)` | `external` | `inState(ACTIVE)` | Validates Merkle proof and records vote. |

### View / Public Functions
| Function | Visibility | Returns | Description |
|---|---|---|---|
| `getElectionDetails()` | `external view` | `(string, ElectionState, uint256, uint256, uint256)` | Returns election metadata. |
| `getCandidates()` | `external view` | `Candidate[]` | Returns all registered candidates. |
| `getVoterStatus(address _voter)`| `external view` | `(bool isRegistered, bool hasVoted, uint256 timestamp)` | Returns voter status. |
| `getWinner()` | `external view` | `(uint256 id, string name, uint256 votes)` | Returns winning candidate. |

---

## 📢 Events

```solidity
event ElectionStarted(uint256 indexed startTime);
event ElectionEnded(uint256 indexed endTime, uint256 totalVotes);
event CandidateRegistered(uint256 indexed candidateId, string name, string party);
event VoterWhitelisted(address indexed voterAddress);
event MerkleRootUpdated(bytes32 indexed newRoot);
event VoteCast(address indexed voter, uint256 timestamp);
```

---

## 🔒 Security Controls

1. **Access Control Modifiers**: Sensitive functions verify `msg.sender == admin`.
2. **State Machine Invariants**: Operations are bounded by the current lifecycle phase.
3. **No Integer Underflows/Overflows**: Built-in checked arithmetic (Solidity `>=0.8.0`).
4. **Input Sanitization**: Strings and candidate ID lookups are validated against boundary limits.
5. **No Dangerous Delegates**: No `delegatecall` or dynamic self-destruct opcodes.
6. **Gas Optimization**: Compact storage layouts and calldata parameters.

---

## 🔏 Privacy Limitations

- **Public Ledger Visibility**: On public EVM chains, transaction calldata is readable by network nodes.
- **Pseudonymity vs. Anonymity**: Wallet addresses are pseudonymous, not completely anonymous.
- **Recommended Production Mitigations**:
  - Implement **Zero-Knowledge Proofs (ZKP)** using SnarkJS/Circom to prove authorization without linking the wallet address to the candidate ID.
  - Implement a **Relayer Network (ERC-2771 / Gas Station Network)** so voters do not use their personal gas-funded accounts.

---

## 📁 Folder Structure

```
.
├── contracts/
│   └── Election.sol               # Core Solidity smart contract
├── test/
│   └── Election.test.ts           # Hardhat test suite (20 unit tests)
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx     # Election management & lifecycle panel
│   │   ├── VoterDashboard.tsx     # Ballot selection, Fast Cast & Web3 signer
│   │   ├── ResultsDashboard.tsx   # Live tallies, winner badge, JSON report
│   │   ├── MerkleVisualizer.tsx   # Merkle tree inspector & proof tester
│   │   ├── HardhatTestRunner.tsx  # Interactive unit test execution runner
│   │   ├── RemixSimulationView.tsx# Step-by-step VM simulation walkthrough
│   │   ├── SolidityCodeView.tsx   # Solidity source & ABI inspector
│   │   ├── BlockchainExplorer.tsx # Real-time block ledger & transaction logs
│   │   ├── WalletSignatureModal.tsx# Web3 MetaMask signature emulator
│   │   ├── VotingCertificateModal.tsx# Verifiable voting certificate modal & export UI
│   │   └── ResetConfirmModal.tsx  # Multi-mode EVM state restoration & reset dialog
│   ├── services/
│   │   └── blockchainEngine.ts    # In-memory EVM state machine & ledger
│   ├── utils/
│   │   ├── merkle.ts              # Simple Merkle tree & proof generator
│   │   ├── qr.ts                  # Pure SVG QR code generator
│   │   ├── audio.ts               # Web Audio feedback synthesizer
│   │   └── certificateDownload.ts # Standalone HTML & cryptographic JSON export generator
│   ├── types.ts                   # Shared TypeScript interfaces & enums
│   ├── App.tsx                    # Root application component
│   └── main.tsx                   # React DOM entry point
├── metadata.json                  # Application configuration metadata
├── package.json                   # Dependencies and scripts
├── tailwind.config.js             # Tailwind CSS configuration
└── README.md                      # Comprehensive documentation
```

---

## 🚀 Installation & Local Setup

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher
- Modern Web Browser (Chrome, Brave, Edge, Firefox)

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/juiramteke20/blockchain-voting-system.git
   cd blockchain-voting-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## 🧪 Remix Simulation

You can test and deploy `Election.sol` directly in the [Remix Ethereum IDE](https://remix.ethereum.org):

1. Copy the contract code from `contracts/Election.sol` into Remix.
2. Under **Solidity Compiler**, select version `0.8.20` and click **Compile Election.sol**.
3. Under **Deploy & Run Transactions**:
   - Environment: `Remix VM (Shanghai)`
   - Account: Select Account 1 (Admin)
   - Click **Deploy**
4. Execute test functions:
   - Call `registerCandidate("Sarah Jenkins", "Progressive Tech", "Focus on AI ethics")`
   - Call `whitelistVoter("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")`
   - Call `startElection()`
   - Switch Account to Account 2 (Voter) and call `vote(1)`
   - Call `endElection()` with Account 1
   - Call `getWinner()` to verify final results.

---

## ⚙️ Hardhat Testing

The project includes an automated test runner executing 20 test specifications:

```bash
# Run unit tests
npx hardhat test
```

### Test Coverage Summary:
- ✅ **Deployment**: Admin initialization, default `NOT_STARTED` state.
- ✅ **Candidate Registration**: Validation of non-empty strings and ID increments.
- ✅ **Voter Whitelisting**: Single and batch whitelisting verification.
- ✅ **Lifecycle Controls**: Modifiers protecting unauthorized state changes.
- ✅ **Voting Mechanics**: Valid ballot accumulation and timestamp tracking.
- ✅ **Double-Voting Prevention**: EVM revert on second ballot attempt.
- ✅ **Access Control**: Non-admin rejection on administrative functions.
- ✅ **Tally & Winner Calculation**: Accurate result output and tie detection.

---

## 🖥️ Integrated DApp Frontend Features

- **Role Switcher**: Switch between Admin, Whitelisted Voters (Alice, Bob, Charlie, Diana), and Unregistered Users.
- **Fast Cast & Web3 Signature Chamber**: Choose between 1-click instant casting directly from candidate cards or interactive gas/calldata signature inspection.
- **Downloadable & Printable Voting Certificates**:
  - **Standalone HTML Certificate**: Download an offline-renderable, styled certificate (`Voting-Certificate-[Address].html`) with cryptographic QR matrix and zero-knowledge participation statement.
  - **Machine-Readable JSON Receipt**: Export raw on-chain verification payloads including block height, transaction hash, nullifier hashes, and Merkle root.
  - **Browser Print-to-PDF**: Direct browser PDF generation with iframe sandbox fallback.
- **Reset Everything & State Restoration**:
  - **Active Voting Demo Reset**: Clear all cast votes, zero candidate tallies, reset voter nullifiers, and re-whitelists default demo personas for instant repeat testing.
  - **Fresh Setup Phase Reset (`NOT_STARTED`)**: Reset state to test custom candidate additions and batch whitelisting from scratch.
- **Live Block Ledger**: Inspect block confirmations, gas metrics, and decoded EVM events.
- **Interactive Merkle Visualizer**: Visualize root hash generation and test branch inclusion proofs.

---

## 📈 Results & Key Metrics

| Metric | Result | Benchmark |
|---|---|---|
| **Contract Deployment Gas** | $\approx 864,200\text{ gas}$ | EVM Standard |
| **Single Vote Transaction Gas** | $\approx 48,600\text{ gas}$ | Low Cost |
| **Merkle Whitelist Gas (Root Update)** | $\approx 28,100\text{ gas}$ | Fixed $O(1)$ Gas |
| **Double-Vote Revert Latency** | $< 1\text{ block}$ | Instant Revert |
| **Test Suite Coverage** | $100\%$ ($20/20$ Passed) | Production Ready |

---

# 📸 Application Screenshots

![Election Results and Tally Board](images/1.png)
![Voter Ballot and Candidate Selection](images/2.png)
![Voter Registry and Participation Status](images/3.png)
![Merkle Whitelist and Eligibility Proofs](images/4.png)
![Blockchain Ledger and Event Explorer](images/5.png)
![Decentralized Ballot Confirmation Certificate](images/6.png)
![Successful On-Chain Ballot Confirmation](images/7.png)

---
## ⚠️ Limitations

- **Key Management**: Users must securely hold their private keys; loss of private key results in loss of voting credentials.
- **Gas Costs on Layer 1**: Deploying on Ethereum Mainnet may incur high gas fees during congestion (mitigated by using Arbitrum, Polygon, or Optimism L2s).
- **Coercion Resistance**: On-chain voting cannot prevent out-of-band coercion without MACI (Minimum Anti-Collusion Infrastructure).

---

## 🔮 Future Improvements

1. **zk-SNARK Anonymous Ballots**: Integrate Semaphore or Tornado-style nullifier trees for zero-knowledge voter privacy.
2. **Quadratic Voting**: Implement token-weighted quadratic voting for nuanced preference expression.
3. **Decentralized Identifier (DID) Integration**: Support W3C DIDs and Soulbound Tokens (SBTs) for Sybil-resistant civic identity.
4. **Account Abstraction (ERC-4337)**: Enable gasless voting via paymasters for mainstream non-crypto users.

---

## 🎓 Learning Outcomes

Through this project, developers and students will master:
- Designing secure Solidity state machines and role-based permissions.
- Implementing Merkle tree verification to optimize on-chain storage.
- Preventing common smart contract vulnerabilities (reentrancy, double-voting, state spoofing).
- Building full-stack Web3 user interfaces connected to EVM ledgers.
- Writing unit test suites with gas analysis and revert assertions.

---

# 👩‍💻 Author

## Jui Ramteke

**GitHub:**  
https://github.com/Jui-Ramteke

**LinkedIn:**  
https://www.linkedin.com/in/jui-ramteke/

**Instagram:**  
https://www.instagram.com/jui_ramteke_/
