export enum ElectionState {
  NOT_STARTED = 0,
  ACTIVE = 1,
  ENDED = 2,
}

export interface Candidate {
  id: number;
  name: string;
  party: string;
  bio: string;
  voteCount: number;
  avatarColor: string;
}

export interface Voter {
  address: string;
  name?: string;
  isRegistered: boolean;
  hasVoted: boolean;
  registrationTime?: number;
  voteTimestamp?: number;
  txHash?: string;
}

export interface ElectionInfo {
  admin: string;
  name: string;
  description: string;
  state: ElectionState;
  startTime: number;
  endTime: number;
  totalVotes: number;
  merkleRoot?: string;
  useMerkleWhitelist: boolean;
}

export interface BlockchainTransaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  method: string;
  params: Record<string, any>;
  timestamp: number;
  status: 'SUCCESS' | 'REVERTED';
  gasUsed: number;
  revertReason?: string;
  eventsEmitted: BlockchainEvent[];
}

export interface BlockchainEvent {
  name: 'CandidateAdded' | 'VoterRegistered' | 'ElectionStarted' | 'VoteRecorded' | 'ElectionEnded' | 'ContractDeployed';
  data: Record<string, any>;
  blockNumber: number;
  txHash: string;
}

export interface DemoAccount {
  name: string;
  role: 'ADMIN' | 'VOTER' | 'UNREGISTERED';
  address: string;
  balanceEth: string;
  avatar: string;
}
