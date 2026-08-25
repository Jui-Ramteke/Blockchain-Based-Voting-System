import { Candidate, ElectionInfo, ElectionState, Voter, BlockchainTransaction, BlockchainEvent, DemoAccount } from '../types';
import { SimpleMerkleTree, hashVoter } from '../utils/merkle';
import { BrowserProvider, Contract, ethers } from 'ethers';
import { VOTING_SYSTEM_ABI } from '../contracts/VotingSystemSol';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'Election Admin (Authority)',
    role: 'ADMIN',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    balanceEth: '100.00',
    avatar: '👑',
  },
  {
    name: 'Voter 1 (Alice Vance)',
    role: 'VOTER',
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    balanceEth: '10.50',
    avatar: '👩‍💻',
  },
  {
    name: 'Voter 2 (Bob Miller)',
    role: 'VOTER',
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    balanceEth: '12.00',
    avatar: '👨‍🔬',
  },
  {
    name: 'Voter 3 (Charlie Davis)',
    role: 'VOTER',
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    balanceEth: '8.75',
    avatar: '🧑‍🎨',
  },
  {
    name: 'Voter 4 (Diana Prince)',
    role: 'VOTER',
    address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    balanceEth: '15.20',
    avatar: '👩‍⚖️',
  },
  {
    name: 'Unregistered User (Mallory)',
    role: 'UNREGISTERED',
    address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
    balanceEth: '2.00',
    avatar: '🕵️',
  },
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 1,
    name: 'Dr. Elena Rostova',
    party: 'Decentralized Science & AI Alliance',
    bio: 'Championing decentralized research computing grants, open peer-review journals on IPFS, and student cloud credits.',
    voteCount: 0,
    avatarColor: 'from-blue-600 to-indigo-600',
  },
  {
    name: 'Marcus Thorne',
    id: 2,
    party: 'Green Campus & Clean Tech Union',
    bio: '100% renewable campus computing nodes, carbon offsets for blockchain labs, and student eco-innovation fellowships.',
    voteCount: 0,
    avatarColor: 'from-emerald-600 to-teal-700',
  },
  {
    id: 3,
    name: 'Amina Al-Mansoor',
    party: 'Privacy Rights & ZK-Identity Coalition',
    bio: 'Advocating for self-sovereign student credentials, zero-knowledge voting privacy, and academic tuition transparency.',
    voteCount: 0,
    avatarColor: 'from-amber-600 to-orange-600',
  },
];

export class BlockchainVotingEngine {
  contractAddress: string = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  election: ElectionInfo;
  candidates: Map<number, Candidate> = new Map();
  voters: Map<string, Voter> = new Map();
  transactions: BlockchainTransaction[] = [];
  events: BlockchainEvent[] = [];
  currentBlockNumber: number = 1042;
  merkleTree: SimpleMerkleTree;

  // Real Web3 Provider link (if connected to MetaMask)
  isLiveWeb3: boolean = false;
  liveProvider: BrowserProvider | null = null;
  liveContract: Contract | null = null;

  constructor() {
    this.election = {
      admin: DEMO_ACCOUNTS[0].address.toLowerCase(),
      name: '2026 University Council Blockchain Election',
      description: 'Annual democratic election for faculty and student representatives powered by Solidity smart contract verification and secret ballot protection.',
      state: ElectionState.ACTIVE,
      startTime: Date.now() - 3600000,
      endTime: 0,
      totalVotes: 0,
      useMerkleWhitelist: true,
      merkleRoot: '',
    };

    // Populate initial candidates
    INITIAL_CANDIDATES.forEach((c) => this.candidates.set(c.id, { ...c }));

    // Whitelist initial voters A, B, C, D
    const initialVoterAddrs = [
      DEMO_ACCOUNTS[1].address.toLowerCase(),
      DEMO_ACCOUNTS[2].address.toLowerCase(),
      DEMO_ACCOUNTS[3].address.toLowerCase(),
      DEMO_ACCOUNTS[4].address.toLowerCase(),
    ];

    this.merkleTree = new SimpleMerkleTree(initialVoterAddrs);
    this.election.merkleRoot = this.merkleTree.getRoot();

    initialVoterAddrs.forEach((addr) => {
      this.voters.set(addr, {
        address: addr,
        isRegistered: true,
        hasVoted: false,
        registrationTime: Date.now() - 3600000,
      });
    });

    // Record deployment transaction
    this.recordTransaction({
      hash: this.generateTxHash(),
      blockNumber: this.currentBlockNumber,
      from: this.election.admin,
      to: this.contractAddress,
      method: 'deployContract',
      params: { name: this.election.name, description: this.election.description },
      timestamp: Date.now() - 7200000,
      status: 'SUCCESS',
      gasUsed: 864200,
      eventsEmitted: [],
    });

    // Record startElection transaction
    this.recordTransaction({
      hash: this.generateTxHash(),
      blockNumber: this.currentBlockNumber + 1,
      from: this.election.admin,
      to: this.contractAddress,
      method: 'startElection',
      params: { candidates: this.candidates.size },
      timestamp: Date.now() - 3600000,
      status: 'SUCCESS',
      gasUsed: 51200,
      eventsEmitted: [
        {
          name: 'ElectionStarted',
          data: { timestamp: Math.floor((Date.now() - 3600000) / 1000) },
          blockNumber: this.currentBlockNumber + 1,
          txHash: this.generateTxHash(),
        },
      ],
    });
  }

  private generateTxHash(): string {
    return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  private recordTransaction(tx: BlockchainTransaction) {
    this.transactions.unshift(tx);
    this.currentBlockNumber++;
    if (tx.eventsEmitted && tx.eventsEmitted.length > 0) {
      this.events.unshift(...tx.eventsEmitted);
    }
  }

  // ----------------------------------------------------
  // ADMIN ACTIONS
  // ----------------------------------------------------

  addCandidate(from: string, name: string, party: string, bio: string): { success: boolean; error?: string; tx?: BlockchainTransaction } {
    const normalizedFrom = from.toLowerCase();
    const gas = 78400;

    // Check admin
    if (normalizedFrom !== this.election.admin.toLowerCase()) {
      const tx: BlockchainTransaction = {
        hash: this.generateTxHash(),
        blockNumber: this.currentBlockNumber,
        from: normalizedFrom,
        to: this.contractAddress,
        method: 'addCandidate',
        params: { name, party },
        timestamp: Date.now(),
        status: 'REVERTED',
        gasUsed: 24100,
        revertReason: 'VotingSystem: Caller is not the election admin',
        eventsEmitted: [],
      };
      this.recordTransaction(tx);
      return { success: false, error: tx.revertReason, tx };
    }

    // Check state
    if (this.election.state !== ElectionState.NOT_STARTED) {
      const tx: BlockchainTransaction = {
        hash: this.generateTxHash(),
        blockNumber: this.currentBlockNumber,
        from: normalizedFrom,
        to: this.contractAddress,
        method: 'addCandidate',
        params: { name, party },
        timestamp: Date.now(),
        status: 'REVERTED',
        gasUsed: 24100,
        revertReason: 'VotingSystem: Invalid election state for this action',
        eventsEmitted: [],
      };
      this.recordTransaction(tx);
      return { success: false, error: tx.revertReason, tx };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: 'VotingSystem: Candidate name cannot be empty' };
    }

    const newId = this.candidates.size + 1;
    const colors = [
      'from-purple-600 to-indigo-600',
      'from-rose-600 to-pink-700',
      'from-cyan-600 to-blue-700',
      'from-amber-500 to-emerald-600',
    ];
    const candidate: Candidate = {
      id: newId,
      name: name.trim(),
      party: party.trim() || 'Independent',
      bio: bio.trim() || 'Committed to academic and governance excellence.',
      voteCount: 0,
      avatarColor: colors[newId % colors.length],
    };

    this.candidates.set(newId, candidate);

    const txHash = this.generateTxHash();
    const event: BlockchainEvent = {
      name: 'CandidateAdded',
      data: { candidateId: newId, name: candidate.name, party: candidate.party },
      blockNumber: this.currentBlockNumber,
      txHash,
    };

    const tx: BlockchainTransaction = {
      hash: txHash,
      blockNumber: this.currentBlockNumber,
      from: normalizedFrom,
      to: this.contractAddress,
      method: 'addCandidate',
      params: { id: newId, name: candidate.name, party: candidate.party },
      timestamp: Date.now(),
      status: 'SUCCESS',
      gasUsed: gas,
      eventsEmitted: [event],
    };

    this.recordTransaction(tx);
    return { success: true, tx };
  }

  registerVoter(from: string, voterAddress: string): { success: boolean; error?: string; tx?: BlockchainTransaction } {
    const normalizedFrom = from.toLowerCase();
    const targetAddress = voterAddress.trim().toLowerCase();

    if (normalizedFrom !== this.election.admin.toLowerCase()) {
      const tx: BlockchainTransaction = {
        hash: this.generateTxHash(),
        blockNumber: this.currentBlockNumber,
        from: normalizedFrom,
        to: this.contractAddress,
        method: 'registerVoter',
        params: { voterAddress: targetAddress },
        timestamp: Date.now(),
        status: 'REVERTED',
        gasUsed: 24100,
        revertReason: 'VotingSystem: Caller is not the election admin',
        eventsEmitted: [],
      };
      this.recordTransaction(tx);
      return { success: false, error: tx.revertReason, tx };
    }

    if (this.election.state !== ElectionState.NOT_STARTED) {
      const tx: BlockchainTransaction = {
        hash: this.generateTxHash(),
        blockNumber: this.currentBlockNumber,
        from: normalizedFrom,
        to: this.contractAddress,
        method: 'registerVoter',
        params: { voterAddress: targetAddress },
        timestamp: Date.now(),
        status: 'REVERTED',
        gasUsed: 24100,
        revertReason: 'VotingSystem: Invalid election state for this action',
        eventsEmitted: [],
      };
      this.recordTransaction(tx);
      return { success: false, error: tx.revertReason, tx };
    }

    if (!targetAddress || targetAddress === '0x0000000000000000000000000000000000000000') {
      return { success: false, error: 'VotingSystem: Cannot register zero address' };
    }

    if (!ethers.isAddress(targetAddress)) {
      return { success: false, error: 'VotingSystem: Invalid Ethereum address format' };
    }

    if (this.voters.has(targetAddress) && this.voters.get(targetAddress)?.isRegistered) {
      return { success: false, error: 'VotingSystem: Voter is already registered' };
    }

    this.voters.set(targetAddress, {
      address: targetAddress,
      isRegistered: true,
      hasVoted: false,
      registrationTime: Date.now(),
    });

    // Update Merkle Tree
    this.refreshMerkleTree();

    const txHash = this.generateTxHash();
    const event: BlockchainEvent = {
      name: 'VoterRegistered',
      data: { voterAddress: targetAddress },
      blockNumber: this.currentBlockNumber,
      txHash,
    };

    const tx: BlockchainTransaction = {
      hash: txHash,
      blockNumber: this.currentBlockNumber,
      from: normalizedFrom,
      to: this.contractAddress,
      method: 'registerVoter',
      params: { voterAddress: targetAddress },
      timestamp: Date.now(),
      status: 'SUCCESS',
      gasUsed: 46200,
      eventsEmitted: [event],
    };

    this.recordTransaction(tx);
    return { success: true, tx };
  }

  registerMultipleVoters(from: string, addresses: string[]): { success: boolean; addedCount: number; error?: string; tx?: BlockchainTransaction } {
    const normalizedFrom = from.toLowerCase();
    if (normalizedFrom !== this.election.admin.toLowerCase()) {
      return { success: false, addedCount: 0, error: 'VotingSystem: Caller is not the election admin' };
    }
    if (this.election.state !== ElectionState.NOT_STARTED) {
      return { success: false, addedCount: 0, error: 'VotingSystem: Invalid election state for this action' };
    }

    let addedCount = 0;
    const events: BlockchainEvent[] = [];
    const txHash = this.generateTxHash();

    addresses.forEach((raw) => {
      const addr = raw.trim().toLowerCase();
      if (ethers.isAddress(addr) && addr !== '0x0000000000000000000000000000000000000000') {
        if (!this.voters.has(addr) || !this.voters.get(addr)?.isRegistered) {
          this.voters.set(addr, {
            address: addr,
            isRegistered: true,
            hasVoted: false,
            registrationTime: Date.now(),
          });
          addedCount++;
          events.push({
            name: 'VoterRegistered',
            data: { voterAddress: addr },
            blockNumber: this.currentBlockNumber,
            txHash,
          });
        }
      }
    });

    this.refreshMerkleTree();

    const tx: BlockchainTransaction = {
      hash: txHash,
      blockNumber: this.currentBlockNumber,
      from: normalizedFrom,
      to: this.contractAddress,
      method: 'registerMultipleVoters',
      params: { count: addedCount },
      timestamp: Date.now(),
      status: 'SUCCESS',
      gasUsed: 42000 + addedCount * 25000,
      eventsEmitted: events,
    };

    this.recordTransaction(tx);
    return { success: true, addedCount, tx };
  }

  private refreshMerkleTree() {
    const registered = Array.from(this.voters.values())
      .filter((v) => v.isRegistered)
      .map((v) => v.address);
    this.merkleTree = new SimpleMerkleTree(registered);
    this.election.merkleRoot = this.merkleTree.getRoot();
  }

  whitelistVoterDirectly(address: string) {
    const addr = address.toLowerCase();
    const existing = this.voters.get(addr);
    this.voters.set(addr, {
      address: addr,
      isRegistered: true,
      hasVoted: existing?.hasVoted ?? false,
      voteTimestamp: existing?.voteTimestamp,
      txHash: existing?.txHash,
      registrationTime: existing?.registrationTime ?? Date.now(),
    });
    this.refreshMerkleTree();
  }

  startElection(from: string): { success: boolean; error?: string; tx?: BlockchainTransaction } {
    const normalizedFrom = from.toLowerCase();
    if (normalizedFrom !== this.election.admin.toLowerCase()) {
      return { success: false, error: 'VotingSystem: Caller is not the election admin' };
    }
    if (this.election.state !== ElectionState.NOT_STARTED) {
      return { success: false, error: 'VotingSystem: Invalid election state for this action' };
    }
    if (this.candidates.size < 2) {
      return { success: false, error: 'VotingSystem: Must have at least 2 candidates to start' };
    }

    this.election.state = ElectionState.ACTIVE;
    this.election.startTime = Date.now();

    const txHash = this.generateTxHash();
    const event: BlockchainEvent = {
      name: 'ElectionStarted',
      data: { timestamp: Math.floor(this.election.startTime / 1000) },
      blockNumber: this.currentBlockNumber,
      txHash,
    };

    const tx: BlockchainTransaction = {
      hash: txHash,
      blockNumber: this.currentBlockNumber,
      from: normalizedFrom,
      to: this.contractAddress,
      method: 'startElection',
      params: { candidates: this.candidates.size },
      timestamp: Date.now(),
      status: 'SUCCESS',
      gasUsed: 51200,
      eventsEmitted: [event],
    };

    this.recordTransaction(tx);
    return { success: true, tx };
  }

  endElection(from: string): { success: boolean; error?: string; tx?: BlockchainTransaction } {
    const normalizedFrom = from.toLowerCase();
    if (normalizedFrom !== this.election.admin.toLowerCase()) {
      return { success: false, error: 'VotingSystem: Caller is not the election admin' };
    }
    if (this.election.state !== ElectionState.ACTIVE) {
      return { success: false, error: 'VotingSystem: Invalid election state for this action' };
    }

    this.election.state = ElectionState.ENDED;
    this.election.endTime = Date.now();

    const txHash = this.generateTxHash();
    const event: BlockchainEvent = {
      name: 'ElectionEnded',
      data: { timestamp: Math.floor(this.election.endTime / 1000), totalVotes: this.election.totalVotes },
      blockNumber: this.currentBlockNumber,
      txHash,
    };

    const tx: BlockchainTransaction = {
      hash: txHash,
      blockNumber: this.currentBlockNumber,
      from: normalizedFrom,
      to: this.contractAddress,
      method: 'endElection',
      params: { totalVotes: this.election.totalVotes },
      timestamp: Date.now(),
      status: 'SUCCESS',
      gasUsed: 49800,
      eventsEmitted: [event],
    };

    this.recordTransaction(tx);
    return { success: true, tx };
  }

  // ----------------------------------------------------
  // VOTING LOGIC
  // ----------------------------------------------------

  vote(from: string, candidateId: number): { success: boolean; error?: string; tx?: BlockchainTransaction; txHash?: string } {
    const normalizedFrom = from.toLowerCase();

    // 1. Auto-start if in NOT_STARTED phase for frictionless voting
    if (this.election.state === ElectionState.NOT_STARTED) {
      this.election.state = ElectionState.ACTIVE;
      this.election.startTime = Date.now();
      const startTxHash = this.generateTxHash();
      this.recordTransaction({
        hash: startTxHash,
        blockNumber: this.currentBlockNumber,
        from: this.election.admin,
        to: this.contractAddress,
        method: 'startElection',
        params: { autoStarted: true },
        timestamp: Date.now(),
        status: 'SUCCESS',
        gasUsed: 51200,
        eventsEmitted: [
          {
            name: 'ElectionStarted',
            data: { timestamp: Math.floor(Date.now() / 1000) },
            blockNumber: this.currentBlockNumber,
            txHash: startTxHash,
          },
        ],
      });
    } else if (this.election.state === ElectionState.ENDED) {
      const reason = 'VotingSystem: Election has already ended. Please reset or reopen the election to cast more ballots.';
      const tx: BlockchainTransaction = {
        hash: this.generateTxHash(),
        blockNumber: this.currentBlockNumber,
        from: normalizedFrom,
        to: this.contractAddress,
        method: 'vote',
        params: { candidateId },
        timestamp: Date.now(),
        status: 'REVERTED',
        gasUsed: 24300,
        revertReason: reason,
        eventsEmitted: [],
      };
      this.recordTransaction(tx);
      return { success: false, error: reason, tx, txHash: tx.hash };
    }

    // 2. Auto-whitelist any voting wallet on the fly if not registered yet
    let voter = this.voters.get(normalizedFrom);
    if (!voter || !voter.isRegistered) {
      this.whitelistVoterDirectly(normalizedFrom);
      voter = this.voters.get(normalizedFrom);
    }

    // 3. Double-Voting Prevention
    if (voter && voter.hasVoted) {
      const reason = 'VotingSystem: You have already cast your vote (Double-voting prevented by EVM state mutex)';
      const tx: BlockchainTransaction = {
        hash: this.generateTxHash(),
        blockNumber: this.currentBlockNumber,
        from: normalizedFrom,
        to: this.contractAddress,
        method: 'vote',
        params: { candidateId },
        timestamp: Date.now(),
        status: 'REVERTED',
        gasUsed: 27100,
        revertReason: reason,
        eventsEmitted: [],
      };
      this.recordTransaction(tx);
      return { success: false, error: reason, tx, txHash: tx.hash };
    }

    // 4. Candidate Existence Check
    const candidate = this.candidates.get(candidateId);
    if (!candidate) {
      const reason = 'VotingSystem: Invalid candidate ID selected';
      const tx: BlockchainTransaction = {
        hash: this.generateTxHash(),
        blockNumber: this.currentBlockNumber,
        from: normalizedFrom,
        to: this.contractAddress,
        method: 'vote',
        params: { candidateId },
        timestamp: Date.now(),
        status: 'REVERTED',
        gasUsed: 27500,
        revertReason: reason,
        eventsEmitted: [],
      };
      this.recordTransaction(tx);
      return { success: false, error: reason, tx, txHash: tx.hash };
    }

    // 5. Apply State Updates (Atomic increment)
    if (voter) {
      voter.hasVoted = true;
      voter.voteTimestamp = Date.now();
    }
    candidate.voteCount++;
    this.election.totalVotes++;

    const txHash = this.generateTxHash();
    if (voter) {
      voter.txHash = txHash;
    }

    // BALLOT SECRECY: We emit only (voter, timestamp), deliberately omitting candidateId!
    const event: BlockchainEvent = {
      name: 'VoteRecorded',
      data: { voter: normalizedFrom, timestamp: Math.floor(Date.now() / 1000) },
      blockNumber: this.currentBlockNumber,
      txHash,
    };

    const tx: BlockchainTransaction = {
      hash: txHash,
      blockNumber: this.currentBlockNumber,
      from: normalizedFrom,
      to: this.contractAddress,
      method: 'vote',
      params: { [normalizedFrom]: 'Voted (Protected by ballot secrecy)' },
      timestamp: Date.now(),
      status: 'SUCCESS',
      gasUsed: 68400,
      eventsEmitted: [event],
    };

    this.recordTransaction(tx);
    return { success: true, tx, txHash };
  }

  // ----------------------------------------------------
  // RESULT CALCULATION
  // ----------------------------------------------------

  getWinner(): {
    winningId: number;
    winningName: string;
    winningVotes: number;
    isTie: boolean;
    tiedCandidates: Candidate[];
    winnerCandidate?: Candidate;
  } {
    const list = Array.from(this.candidates.values());
    if (list.length === 0 || this.election.totalVotes === 0) {
      return {
        winningId: 0,
        winningName: 'No votes recorded',
        winningVotes: 0,
        isTie: false,
        tiedCandidates: [],
      };
    }

    let highest = -1;
    list.forEach((c) => {
      if (c.voteCount > highest) highest = c.voteCount;
    });

    const topCandidates = list.filter((c) => c.voteCount === highest && highest > 0);

    if (topCandidates.length > 1) {
      return {
        winningId: 0,
        winningName: 'Tie between top candidates',
        winningVotes: highest,
        isTie: true,
        tiedCandidates: topCandidates,
      };
    }

    if (topCandidates.length === 1) {
      return {
        winningId: topCandidates[0].id,
        winningName: topCandidates[0].name,
        winningVotes: highest,
        isTie: false,
        tiedCandidates: [],
        winnerCandidate: topCandidates[0],
      };
    }

    return {
      winningId: 0,
      winningName: 'None',
      winningVotes: 0,
      isTie: false,
      tiedCandidates: [],
    };
  }

  resetDemo() {
    this.resetEverything(ElectionState.ACTIVE);
  }

  resetEverything(initialState: ElectionState = ElectionState.ACTIVE) {
    this.election.name = 'Decentralized Student Senate General Election 2026';
    this.election.admin = DEMO_ACCOUNTS[0].address;
    this.election.state = initialState;
    this.election.startTime = initialState === ElectionState.ACTIVE ? Date.now() : 0;
    this.election.endTime = 0;
    this.election.totalVotes = 0;

    // Reset Candidates
    this.candidates.clear();
    INITIAL_CANDIDATES.forEach((c) => this.candidates.set(c.id, { ...c, voteCount: 0 }));

    // Reset Voters & Merkle Tree
    this.voters.clear();
    const initialVoterAddrs = [
      DEMO_ACCOUNTS[1].address.toLowerCase(),
      DEMO_ACCOUNTS[2].address.toLowerCase(),
      DEMO_ACCOUNTS[3].address.toLowerCase(),
      DEMO_ACCOUNTS[4].address.toLowerCase(),
    ];
    this.merkleTree = new SimpleMerkleTree(initialVoterAddrs);
    this.election.merkleRoot = this.merkleTree.getRoot();

    initialVoterAddrs.forEach((addr) => {
      this.voters.set(addr, {
        address: addr,
        isRegistered: true,
        hasVoted: false,
        registrationTime: Date.now(),
      });
    });

    // Reset Transactions & Block Ledger
    this.transactions = [];
    this.events = [];
    this.currentBlockNumber = 1050;

    // Add initial deployment block record
    const deployTxHash = this.generateTxHash();
    const deployEvent: BlockchainEvent = {
      name: 'ContractDeployed',
      data: { admin: this.election.admin, state: initialState },
      blockNumber: 1050,
      txHash: deployTxHash,
    };

    const deployTx: BlockchainTransaction = {
      hash: deployTxHash,
      blockNumber: 1050,
      from: this.election.admin,
      to: '0x0000000000000000000000000000000000000000',
      method: 'deploy',
      params: { name: this.election.name, merkleRoot: this.election.merkleRoot },
      timestamp: Date.now() - 3600000,
      status: 'SUCCESS',
      gasUsed: 864200,
      eventsEmitted: [deployEvent],
    };

    this.transactions.push(deployTx);
    this.events.push(deployEvent);

    if (initialState === ElectionState.ACTIVE) {
      const startTxHash = this.generateTxHash();
      const startEvent: BlockchainEvent = {
        name: 'ElectionStarted',
        data: { timestamp: Math.floor(Date.now() / 1000) },
        blockNumber: 1051,
        txHash: startTxHash,
      };
      const startTx: BlockchainTransaction = {
        hash: startTxHash,
        blockNumber: 1051,
        from: this.election.admin,
        to: this.contractAddress,
        method: 'startElection',
        params: { candidates: this.candidates.size },
        timestamp: Date.now() - 1800000,
        status: 'SUCCESS',
        gasUsed: 51200,
        eventsEmitted: [startEvent],
      };
      this.transactions.unshift(startTx);
      this.events.unshift(startEvent);
      this.currentBlockNumber = 1051;
    }
  }
}
