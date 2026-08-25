export interface RemixSimulationStep {
  step: number;
  title: string;
  account: string;
  accountRole: string;
  action: string;
  expectedResult: string;
  statusType: 'success' | 'revert' | 'info';
  codeOrCommand: string;
  transactionLog: string;
  screenshotTip: string;
}

export const REMIX_SIMULATION_STEPS: RemixSimulationStep[] = [
  {
    step: 1,
    title: "Open Remix IDE",
    account: "-",
    accountRole: "Browser Environment",
    action: "Navigate to https://remix.ethereum.org in your web browser.",
    expectedResult: "Remix IDE workspace loads with File Explorer, Solidity Compiler, and Deploy tabs ready.",
    statusType: "info",
    codeOrCommand: "https://remix.ethereum.org",
    transactionLog: "[INFO] Workspace initialized. Solidity environment ready.",
    screenshotTip: "Capture File Explorer showing empty contracts directory."
  },
  {
    step: 2,
    title: "Create VotingSystem.sol",
    account: "-",
    accountRole: "Developer",
    action: "In contracts/ folder, click New File and name it VotingSystem.sol.",
    expectedResult: "contracts/VotingSystem.sol created in File Explorer.",
    statusType: "info",
    codeOrCommand: "touch contracts/VotingSystem.sol",
    transactionLog: "[INFO] Created contracts/VotingSystem.sol",
    screenshotTip: "Capture contracts/ folder with VotingSystem.sol opened in editor."
  },
  {
    step: 3,
    title: "Paste Solidity Code",
    account: "-",
    accountRole: "Developer",
    action: "Paste complete VotingSystem.sol source code into the editor tab.",
    expectedResult: "Solidity code formatted with NatSpec documentation, modifiers, and structs.",
    statusType: "info",
    codeOrCommand: "// SPDX-License-Identifier: MIT pragma solidity ^0.8.20;",
    transactionLog: "[INFO] Code pasted. 180+ lines formatted.",
    screenshotTip: "Capture editor showing contract declaration and modifiers."
  },
  {
    step: 4,
    title: "Compile Contract",
    account: "-",
    accountRole: "Compiler",
    action: "Open Solidity Compiler tab (0.8.20+) and click 'Compile VotingSystem.sol'.",
    expectedResult: "Green checkmark on compiler icon. Zero errors, zero fatal warnings.",
    statusType: "success",
    codeOrCommand: "solc --optimize --bin --abi VotingSystem.sol",
    transactionLog: "[SUCCESS] Compilation finished successfully. ABI and Bytecode generated.",
    screenshotTip: "Capture green checkmark on compiler icon and compilation details."
  },
  {
    step: 5,
    title: "Deploy Contract via Remix VM",
    account: "Account 1 (0x5B3...eddC4)",
    accountRole: "ADMIN (Deployer)",
    action: "Select 'Remix VM (Cancun / Shanghai)', set constructor args: ('2026 Student Election', 'Annual Vote'), click Transact.",
    expectedResult: "Contract deployed at new address (e.g. 0xd9145CCE52D386f254917e481eB44e9943F39138). Admin = Account 1.",
    statusType: "success",
    codeOrCommand: "constructor('2026 Student Election', 'Annual Vote')",
    transactionLog: "[TX 0x7f2a...10] create VotingSystem | Gas: 864,200 | Status: 1 (Success) | Admin: 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    screenshotTip: "Capture Deployed Contracts panel showing VotingSystem buttons & getter variables."
  },
  {
    step: 6,
    title: "Admin Adds Candidate A",
    account: "Account 1 (0x5B3...eddC4)",
    accountRole: "ADMIN",
    action: "Call addCandidate('Alice Vance', 'Tech Party', 'Decentralized Campus Labs').",
    expectedResult: "Candidate 1 created. Event CandidateAdded(1, 'Alice Vance', 'Tech Party') emitted.",
    statusType: "success",
    codeOrCommand: "addCandidate('Alice Vance', 'Tech Party', 'Decentralized Campus Labs')",
    transactionLog: "[TX 0x11a4...c9] addCandidate | Gas: 78,412 | Event: CandidateAdded(id=1, name='Alice Vance')",
    screenshotTip: "Capture Remix terminal expanding tx logs showing CandidateAdded event."
  },
  {
    step: 7,
    title: "Admin Adds Candidate B",
    account: "Account 1 (0x5B3...eddC4)",
    accountRole: "ADMIN",
    action: "Call addCandidate('Bob Miller', 'Green Party', '100% Solar Campus Initiative').",
    expectedResult: "Candidate 2 created. Event CandidateAdded(2, 'Bob Miller', 'Green Party') emitted.",
    statusType: "success",
    codeOrCommand: "addCandidate('Bob Miller', 'Green Party', '100% Solar Campus Initiative')",
    transactionLog: "[TX 0x22b5...d0] addCandidate | Gas: 78,412 | Event: CandidateAdded(id=2, name='Bob Miller')",
    screenshotTip: "Capture candidateCount getter returning 2."
  },
  {
    step: 8,
    title: "Admin Adds Candidate C",
    account: "Account 1 (0x5B3...eddC4)",
    accountRole: "ADMIN",
    action: "Call addCandidate('Charlie Davis', 'Student Union', 'Tuition Transparency').",
    expectedResult: "Candidate 3 created. candidateCount becomes 3.",
    statusType: "success",
    codeOrCommand: "addCandidate('Charlie Davis', 'Student Union', 'Tuition Transparency')",
    transactionLog: "[TX 0x33c6...e1] addCandidate | Gas: 78,412 | Event: CandidateAdded(id=3, name='Charlie Davis')",
    screenshotTip: "Capture candidates(3) call showing Charlie Davis details."
  },
  {
    step: 9,
    title: "Register Voters A, B, and C",
    account: "Account 1 (0x5B3...eddC4)",
    accountRole: "ADMIN",
    action: "Call registerVoter(Account 2), registerVoter(Account 3), registerVoter(Account 4).",
    expectedResult: "Three VoterRegistered events emitted. registeredVoterCount = 3.",
    statusType: "success",
    codeOrCommand: "registerVoter(0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2)...",
    transactionLog: "[TX 0x44d7...f2] registerVoter | VoterRegistered(0xAb84...5cb2)\\n[TX 0x55e8...03] registerVoter | VoterRegistered(0x4B20...E696)\\n[TX 0x66f9...14] registerVoter | VoterRegistered(0x7873...8F49)",
    screenshotTip: "Capture voters(Account 2) call showing isRegistered=true, hasVoted=false."
  },
  {
    step: 10,
    title: "Try Voting Before Election Starts",
    account: "Account 2 (Voter A)",
    accountRole: "VOTER A",
    action: "Switch to Account 2 in Remix dropdown and call vote(1).",
    expectedResult: "TRANSACTION REVERTED: 'VotingSystem: Invalid election state for this action'.",
    statusType: "revert",
    codeOrCommand: "vote(1) [State = NOT_STARTED]",
    transactionLog: "[REVERT 0xaa12...99] Execution reverted: 'VotingSystem: Invalid election state for this action'",
    screenshotTip: "Capture red error log in Remix terminal proving state guard prevented premature vote."
  },
  {
    step: 11,
    title: "Admin Starts Election",
    account: "Account 1 (0x5B3...eddC4)",
    accountRole: "ADMIN",
    action: "Switch back to Account 1 and call startElection().",
    expectedResult: "State transitions to ACTIVE (1). Event ElectionStarted emitted. startTime set to block.timestamp.",
    statusType: "success",
    codeOrCommand: "startElection()",
    transactionLog: "[TX 0x77aa...25] startElection | Gas: 51,200 | Event: ElectionStarted(1771928000) | State -> 1 (ACTIVE)",
    screenshotTip: "Capture state getter returning 1 (ACTIVE)."
  },
  {
    step: 12,
    title: "Voter A Votes for Candidate 1",
    account: "Account 2 (Voter A)",
    accountRole: "VOTER A",
    action: "Switch to Account 2 and call vote(1).",
    expectedResult: "Vote recorded! Candidate 1 voteCount = 1, totalVotes = 1, voters[Account 2].hasVoted = true.",
    statusType: "success",
    codeOrCommand: "vote(1)",
    transactionLog: "[TX 0x88bb...36] vote(1) | Gas: 68,400 | Event: VoteRecorded(voter=0xAb84...5cb2) [Ballot secrecy preserved: candidateId not leaked!]",
    screenshotTip: "Capture terminal showing VoteRecorded event and totalVotes getter = 1."
  },
  {
    step: 13,
    title: "Voter B Votes for Candidate 1",
    account: "Account 3 (Voter B)",
    accountRole: "VOTER B",
    action: "Switch to Account 3 and call vote(1).",
    expectedResult: "Vote recorded! Candidate 1 voteCount = 2, totalVotes = 2.",
    statusType: "success",
    codeOrCommand: "vote(1)",
    transactionLog: "[TX 0x99cc...47] vote(1) | Gas: 68,400 | Event: VoteRecorded(voter=0x4B20...E696)",
    screenshotTip: "Capture candidates(1) voteCount = 2."
  },
  {
    step: 14,
    title: "Voter C Votes for Candidate 2",
    account: "Account 4 (Voter C)",
    accountRole: "VOTER C",
    action: "Switch to Account 4 and call vote(2).",
    expectedResult: "Vote recorded! Candidate 2 voteCount = 1, totalVotes = 3.",
    statusType: "success",
    codeOrCommand: "vote(2)",
    transactionLog: "[TX 0x00dd...58] vote(2) | Gas: 68,400 | Event: VoteRecorded(voter=0x7873...8F49)",
    screenshotTip: "Capture totalVotes returning 3."
  },
  {
    step: 15,
    title: "Voter A Attempts Double Vote",
    account: "Account 2 (Voter A)",
    accountRole: "VOTER A (Exploit Attempt)",
    action: "Account 2 attempts to call vote(2).",
    expectedResult: "TRANSACTION REVERTED: 'VotingSystem: You have already cast your vote'.",
    statusType: "revert",
    codeOrCommand: "vote(2) [Account 2 already voted]",
    transactionLog: "[REVERT 0xbb23...88] Execution reverted: 'VotingSystem: You have already cast your vote'",
    screenshotTip: "Capture double-vote rejection error in Remix console."
  },
  {
    step: 16,
    title: "Unregistered Account Attempts Vote",
    account: "Account 5 (0x617...F822)",
    accountRole: "UNREGISTERED ATTACKER",
    action: "Switch to Account 5 (never registered) and call vote(1).",
    expectedResult: "TRANSACTION REVERTED: 'VotingSystem: You are not registered to vote'.",
    statusType: "revert",
    codeOrCommand: "vote(1) [Unregistered sender]",
    transactionLog: "[REVERT 0xcc34...77] Execution reverted: 'VotingSystem: You are not registered to vote'",
    screenshotTip: "Capture unregistered voter rejection in terminal."
  },
  {
    step: 17,
    title: "Admin Ends Election",
    account: "Account 1 (0x5B3...eddC4)",
    accountRole: "ADMIN",
    action: "Switch back to Account 1 and call endElection().",
    expectedResult: "State transitions to ENDED (2). Event ElectionEnded emitted. endTime recorded.",
    statusType: "success",
    codeOrCommand: "endElection()",
    transactionLog: "[TX 0x11ee...69] endElection | Gas: 49,800 | Event: ElectionEnded(timestamp=1771929800, totalVotes=3) | State -> 2 (ENDED)",
    screenshotTip: "Capture state getter returning 2 (ENDED)."
  },
  {
    step: 18,
    title: "Attempt Vote After Election Ends",
    account: "Account 3 (Voter B)",
    accountRole: "LATE VOTER",
    action: "Attempt to call vote(1) after state is ENDED.",
    expectedResult: "TRANSACTION REVERTED: 'VotingSystem: Invalid election state for this action'.",
    statusType: "revert",
    codeOrCommand: "vote(1) [State = ENDED]",
    transactionLog: "[REVERT 0xdd45...66] Execution reverted: 'VotingSystem: Invalid election state for this action'",
    screenshotTip: "Capture post-closure vote rejection log."
  },
  {
    step: 19,
    title: "View All Candidate Totals",
    account: "Any Account",
    accountRole: "PUBLIC AUDITOR",
    action: "Call getAllCandidates() view function.",
    expectedResult: "Array of candidates returned: Alice Vance (2 votes), Bob Miller (1 vote), Charlie Davis (0 votes).",
    statusType: "info",
    codeOrCommand: "getAllCandidates()",
    transactionLog: "[CALL] getAllCandidates => [ [1, 'Alice Vance', 'Tech', '...', 2], [2, 'Bob Miller', 'Green', '...', 1], [3, 'Charlie Davis', 'Union', '...', 0] ]",
    screenshotTip: "Capture output of getAllCandidates() in Remix UI."
  },
  {
    step: 20,
    title: "Call getWinner() to Declare Result",
    account: "Any Account",
    accountRole: "PUBLIC AUDITOR",
    action: "Call getWinner() view function.",
    expectedResult: "Returns winningId: 1, winningName: 'Alice Vance', winningVotes: 2, isTie: false.",
    statusType: "success",
    codeOrCommand: "getWinner()",
    transactionLog: "[CALL SUCCESS] getWinner => winningId: 1, winningName: 'Alice Vance', winningVotes: 2, isTie: false",
    screenshotTip: "Capture getWinner() returned values showing Alice Vance as verified winner!"
  }
];
