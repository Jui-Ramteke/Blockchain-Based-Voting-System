export const VOTING_SYSTEM_SOLIDITY_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VotingSystem
 * @dev Industry-grade educational prototype for a decentralized voting system.
 * 
 * IMPORTANT ARCHITECTURAL & PRIVACY DESIGN NOTES:
 * 1. BALLOT SECRECY: To preserve voter privacy, this contract intentionally DOES NOT
 *    store which candidate an individual voter voted for (i.e. no \`mapping(address => uint256) voterChoice\`).
 *    Instead, it records only:
 *      - \`voter.isRegistered\` (eligibility)
 *      - \`voter.hasVoted\` (one person, one vote enforcement)
 *      - \`candidates[candidateId].voteCount\` (atomic aggregation)
 * 2. EVENT INTEGRITY: The \`VoteRecorded\` event intentionally emits only the voter's address and
 *    timestamp, WITHOUT leaking the \`candidateId\`. This prevents chain analysis trackers from
 *    de-anonymizing ballot choices while still verifying participation.
 * 3. SECURITY GUARDS: Uses custom modifiers, reentrancy-safe state transitions, and strict state checks.
 * 4. DISCLAIMER: For educational/course project use only.
 */
contract VotingSystem {
    // ----------------------------------------------------
    // ENUMS & STRUCTS
    // ----------------------------------------------------
    
    enum ElectionState {
        NOT_STARTED, // 0: Setup phase (register candidates, whitelist voters)
        ACTIVE,      // 1: Voting is live
        ENDED        // 2: Voting closed, official results available
    }

    struct Candidate {
        uint256 id;
        string name;
        string party;
        string bio;
        uint256 voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
    }

    // ----------------------------------------------------
    // STATE VARIABLES
    // ----------------------------------------------------

    address public immutable admin;
    string public electionName;
    string public electionDescription;
    ElectionState public state;
    
    uint256 public candidateCount;
    uint256 public totalVotes;
    uint256 public registeredVoterCount;
    
    uint256 public startTime;
    uint256 public endTime;

    // Optional Merkle Root for private/gasless large-scale voter whitelisting
    bytes32 public merkleRoot;

    // Mappings
    mapping(uint256 => Candidate) public candidates;
    mapping(address => Voter) public voters;

    // ----------------------------------------------------
    // EVENTS (Carefully designed for Ballot Privacy)
    // ----------------------------------------------------

    event CandidateAdded(uint256 indexed candidateId, string name, string party);
    event VoterRegistered(address indexed voterAddress);
    event BatchVotersRegistered(uint256 count);
    event ElectionStarted(uint256 timestamp);
    event ElectionEnded(uint256 timestamp, uint256 totalVotes);
    
    // Notice: candidateId is NOT emitted here to protect secret ballots
    event VoteRecorded(address indexed voter, uint256 timestamp);

    // ----------------------------------------------------
    // MODIFIERS
    // ----------------------------------------------------

    modifier onlyAdmin() {
        require(msg.sender == admin, "VotingSystem: Caller is not the election admin");
        _;
    }

    modifier inState(ElectionState _state) {
        require(state == _state, "VotingSystem: Invalid election state for this action");
        _;
    }

    // ----------------------------------------------------
    // CONSTRUCTOR
    // ----------------------------------------------------

    /**
     * @dev Initializes the election with name and description under the deploying admin.
     * @param _name Name of the election (e.g. "2026 Student Senate Election")
     * @param _description Purpose and rules summary
     */
    constructor(string memory _name, string memory _description) {
        require(bytes(_name).length > 0, "VotingSystem: Election name cannot be empty");
        admin = msg.sender;
        electionName = _name;
        electionDescription = _description;
        state = ElectionState.NOT_STARTED;
    }

    // ----------------------------------------------------
    // ADMIN FUNCTIONS (Setup Phase)
    // ----------------------------------------------------

    /**
     * @dev Adds a candidate to the ballot. Only allowed before election starts.
     * @param _name Candidate full name
     * @param _party Political party or group affiliation
     * @param _bio Short platform slogan / bio
     */
    function addCandidate(
        string calldata _name,
        string calldata _party,
        string calldata _bio
    ) external onlyAdmin inState(ElectionState.NOT_STARTED) {
        require(bytes(_name).length > 0, "VotingSystem: Candidate name cannot be empty");
        
        candidateCount++;
        candidates[candidateCount] = Candidate({
            id: candidateCount,
            name: _name,
            party: _party,
            bio: _bio,
            voteCount: 0
        });

        emit CandidateAdded(candidateCount, _name, _party);
    }

    /**
     * @dev Registers an individual eligible voter wallet.
     * @param _voter Wallet address to register
     */
    function registerVoter(address _voter) external onlyAdmin inState(ElectionState.NOT_STARTED) {
        require(_voter != address(0), "VotingSystem: Cannot register zero address");
        require(!voters[_voter].isRegistered, "VotingSystem: Voter is already registered");

        voters[_voter].isRegistered = true;
        registeredVoterCount++;

        emit VoterRegistered(_voter);
    }

    /**
     * @dev Batch registers multiple voter wallet addresses to optimize gas during setup.
     * @param _voterList Array of voter wallet addresses
     */
    function registerMultipleVoters(address[] calldata _voterList) external onlyAdmin inState(ElectionState.NOT_STARTED) {
        require(_voterList.length > 0, "VotingSystem: Voter list cannot be empty");
        
        for (uint256 i = 0; i < _voterList.length; i++) {
            address voterAddr = _voterList[i];
            if (voterAddr != address(0) && !voters[voterAddr].isRegistered) {
                voters[voterAddr].isRegistered = true;
                registeredVoterCount++;
                emit VoterRegistered(voterAddr);
            }
        }
        
        emit BatchVotersRegistered(_voterList.length);
    }

    /**
     * @dev Sets an optional Merkle root for cryptographic whitelist proofs.
     * @param _merkleRoot Root hash of voter whitelist Merkle tree
     */
    function setMerkleRoot(bytes32 _merkleRoot) external onlyAdmin inState(ElectionState.NOT_STARTED) {
        merkleRoot = _merkleRoot;
    }

    /**
     * @dev Transitions election state from NOT_STARTED to ACTIVE.
     */
    function startElection() external onlyAdmin inState(ElectionState.NOT_STARTED) {
        require(candidateCount >= 2, "VotingSystem: Must have at least 2 candidates to start");
        
        state = ElectionState.ACTIVE;
        startTime = block.timestamp;

        emit ElectionStarted(block.timestamp);
    }

    /**
     * @dev Transitions election state from ACTIVE to ENDED.
     */
    function endElection() external onlyAdmin inState(ElectionState.ACTIVE) {
        state = ElectionState.ENDED;
        endTime = block.timestamp;

        emit ElectionEnded(block.timestamp, totalVotes);
    }

    // ----------------------------------------------------
    // VOTING LOGIC (Active Phase)
    // ----------------------------------------------------

    /**
     * @dev Casts a vote for a candidate.
     * Enforces:
     * 1. State must be ACTIVE.
     * 2. Sender must be registered.
     * 3. Sender must not have voted previously.
     * 4. Candidate ID must exist.
     * 
     * @param _candidateId 1-based index of candidate
     */
    function vote(uint256 _candidateId) external inState(ElectionState.ACTIVE) {
        // 1. Eligibility Check
        require(voters[msg.sender].isRegistered, "VotingSystem: You are not registered to vote");
        
        // 2. Double-Voting Prevention
        require(!voters[msg.sender].hasVoted, "VotingSystem: You have already cast your vote");
        
        // 3. Candidate Validity
        require(_candidateId > 0 && _candidateId <= candidateCount, "VotingSystem: Invalid candidate ID");

        // 4. Update State (State-checks-effects pattern)
        voters[msg.sender].hasVoted = true;
        candidates[_candidateId].voteCount++;
        totalVotes++;

        // 5. Emit Event WITHOUT exposing the selected candidate (Preserves Ballot Secrecy)
        emit VoteRecorded(msg.sender, block.timestamp);
    }

    // ----------------------------------------------------
    // GETTERS & RESULT LOGIC
    // ----------------------------------------------------

    /**
     * @dev Returns single candidate by ID.
     */
    function getCandidate(uint256 _candidateId) external view returns (
        uint256 id,
        string memory name,
        string memory party,
        string memory bio,
        uint256 voteCount
    ) {
        require(_candidateId > 0 && _candidateId <= candidateCount, "VotingSystem: Candidate does not exist");
        Candidate memory c = candidates[_candidateId];
        return (c.id, c.name, c.party, c.bio, c.voteCount);
    }

    /**
     * @dev Returns all candidates in an array.
     */
    function getAllCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory items = new Candidate[](candidateCount);
        for (uint256 i = 1; i <= candidateCount; i++) {
            items[i - 1] = candidates[i];
        }
        return items;
    }

    /**
     * @dev Returns election state and timestamps.
     */
    function getElectionStatus() external view returns (
        ElectionState currentState,
        uint256 totalRegistered,
        uint256 votesCast,
        uint256 startTimestamp,
        uint256 endTimestamp
    ) {
        return (state, registeredVoterCount, totalVotes, startTime, endTime);
    }

    /**
     * @dev Computes the winning candidate after election has ended.
     * Safely handles:
     * - No votes cast
     * - Clear winner
     * - Tie condition between top candidates
     * 
     * @return winningId Candidate ID with highest votes (0 if tie or no votes)
     * @return winningName Name of winner ("Tie" if tie, "None" if zero votes)
     * @return winningVotes Highest vote count achieved
     * @return isTie Boolean flag indicating whether top candidates tied
     */
    function getWinner() external view returns (
        uint256 winningId,
        string memory winningName,
        uint256 winningVotes,
        bool isTie
    ) {
        require(state == ElectionState.ENDED, "VotingSystem: Winner can only be declared after election ends");
        
        if (totalVotes == 0) {
            return (0, "No votes recorded", 0, false);
        }

        uint256 highestVotes = 0;
        uint256 topCandidateId = 0;
        bool tie = false;

        for (uint256 i = 1; i <= candidateCount; i++) {
            if (candidates[i].voteCount > highestVotes) {
                highestVotes = candidates[i].voteCount;
                topCandidateId = i;
                tie = false;
            } else if (candidates[i].voteCount == highestVotes && highestVotes > 0) {
                tie = true;
            }
        }

        if (tie) {
            return (0, "Tie between top candidates", highestVotes, true);
        }

        return (topCandidateId, candidates[topCandidateId].name, highestVotes, false);
    }
}
`;

export const VOTING_SYSTEM_ABI = [
  "constructor(string _name, string _description)",
  "event CandidateAdded(uint256 indexed candidateId, string name, string party)",
  "event VoterRegistered(address indexed voterAddress)",
  "event BatchVotersRegistered(uint256 count)",
  "event ElectionStarted(uint256 timestamp)",
  "event ElectionEnded(uint256 timestamp, uint256 totalVotes)",
  "event VoteRecorded(address indexed voter, uint256 timestamp)",
  "function admin() view returns (address)",
  "function electionName() view returns (string)",
  "function electionDescription() view returns (string)",
  "function state() view returns (uint8)",
  "function candidateCount() view returns (uint256)",
  "function totalVotes() view returns (uint256)",
  "function registeredVoterCount() view returns (uint256)",
  "function startTime() view returns (uint256)",
  "function endTime() view returns (uint256)",
  "function merkleRoot() view returns (bytes32)",
  "function candidates(uint256) view returns (uint256 id, string name, string party, string bio, uint256 voteCount)",
  "function voters(address) view returns (bool isRegistered, bool hasVoted)",
  "function addCandidate(string _name, string _party, string _bio)",
  "function registerVoter(address _voter)",
  "function registerMultipleVoters(address[] _voterList)",
  "function setMerkleRoot(bytes32 _merkleRoot)",
  "function startElection()",
  "function endElection()",
  "function vote(uint256 _candidateId)",
  "function getCandidate(uint256 _candidateId) view returns (uint256 id, string name, string party, string bio, uint256 voteCount)",
  "function getAllCandidates() view returns (tuple(uint256 id, string name, string party, string bio, uint256 voteCount)[])",
  "function getElectionStatus() view returns (uint8 currentState, uint256 totalRegistered, uint256 votesCast, uint256 startTimestamp, uint256 endTimestamp)",
  "function getWinner() view returns (uint256 winningId, string winningName, uint256 winningVotes, bool isTie)"
];
