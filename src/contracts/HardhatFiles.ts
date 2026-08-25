export const HARDHAT_CONFIG_CODE = `require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};
`;

export const HARDHAT_DEPLOY_CODE = `const hre = require("hardhat");

async function main() {
  console.log("==================================================");
  console.log(" Deploying Blockchain-Based Voting System Contract");
  console.log("==================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account (Admin):", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  const electionName = "2026 Decentralized University Council Election";
  const electionDescription = "Annual governance election for academic senate delegates.";

  const VotingSystem = await hre.ethers.getContractFactory("VotingSystem");
  const votingSystem = await VotingSystem.deploy(electionName, electionDescription);
  await votingSystem.waitForDeployment();

  const contractAddress = await votingSystem.getAddress();
  console.log("\\n>>> VotingSystem deployed successfully to:", contractAddress);
  console.log("Election Name:", electionName);
  console.log("Admin Address:", deployer.address);

  // Optional: Pre-populate seed candidates
  console.log("\\nRegistering initial candidates...");
  let tx = await votingSystem.addCandidate("Alice Vance", "Forward Tech Party", "Focusing on decentralized campus compute and open-access labs.");
  await tx.wait();
  console.log("Added Candidate 1: Alice Vance (Forward Tech Party)");

  tx = await votingSystem.addCandidate("Bob Miller", "Green Campus Alliance", "Advocating for 100% renewable energy and carbon offsets.");
  await tx.wait();
  console.log("Added Candidate 2: Bob Miller (Green Campus Alliance)");

  tx = await votingSystem.addCandidate("Charlie Davis", "Student Rights Union", "Prioritizing tuition transparency and student wellness grants.");
  await tx.wait();
  console.log("Added Candidate 3: Charlie Davis (Student Rights Union)");

  console.log("\\n[Setup Complete] Contract is ready in NOT_STARTED state.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`;

export const HARDHAT_TEST_CODE = `const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingSystem Smart Contract Test Suite", function () {
  let VotingSystem;
  let votingContract;
  let admin, voter1, voter2, voter3, unregisteredVoter, attacker;

  beforeEach(async function () {
    [admin, voter1, voter2, voter3, unregisteredVoter, attacker] = await ethers.getSigners();

    VotingSystem = await ethers.getContractFactory("VotingSystem");
    votingContract = await VotingSystem.deploy(
      "Decentralized University Council Election",
      "Educational voting simulation with ballot privacy"
    );
    await votingContract.waitForDeployment();
  });

  describe("1. Deployment & Initialization", function () {
    it("Test 1: Should set the deploying address as election admin", async function () {
      expect(await votingContract.admin()).to.equal(admin.address);
    });

    it("Test 2: Should initialize state as NOT_STARTED (0)", async function () {
      expect(await votingContract.state()).to.equal(0);
    });

    it("Test 3: Should set the correct election name and description", async function () {
      expect(await votingContract.electionName()).to.equal("Decentralized University Council Election");
      expect(await votingContract.electionDescription()).to.equal("Educational voting simulation with ballot privacy");
    });
  });

  describe("2. Candidate Registration", function () {
    it("Test 4: Admin can add candidates successfully and emit CandidateAdded event", async function () {
      await expect(votingContract.connect(admin).addCandidate("Alice Vance", "Tech Party", "AI & Open Source"))
        .to.emit(votingContract, "CandidateAdded")
        .withArgs(1, "Alice Vance", "Tech Party");

      const candidate = await votingContract.getCandidate(1);
      expect(candidate.name).to.equal("Alice Vance");
      expect(candidate.party).to.equal("Tech Party");
      expect(candidate.voteCount).to.equal(0);
    });

    it("Test 5: Non-admin cannot add candidate (reverts)", async function () {
      await expect(
        votingContract.connect(attacker).addCandidate("Fake Candidate", "Malicious Party", "Exploit")
      ).to.be.revertedWith("VotingSystem: Caller is not the election admin");
    });

    it("Test 6: Reject candidate with empty name", async function () {
      await expect(
        votingContract.connect(admin).addCandidate("", "No Name Party", "Bio")
      ).to.be.revertedWith("VotingSystem: Candidate name cannot be empty");
    });
  });

  describe("3. Voter Registration", function () {
    it("Test 7: Admin can register eligible voter", async function () {
      await expect(votingContract.connect(admin).registerVoter(voter1.address))
        .to.emit(votingContract, "VoterRegistered")
        .withArgs(voter1.address);

      const voter = await votingContract.voters(voter1.address);
      expect(voter.isRegistered).to.be.true;
      expect(voter.hasVoted).to.be.false;
    });

    it("Test 8: Rejects duplicate voter registration", async function () {
      await votingContract.connect(admin).registerVoter(voter1.address);
      await expect(
        votingContract.connect(admin).registerVoter(voter1.address)
      ).to.be.revertedWith("VotingSystem: Voter is already registered");
    });

    it("Test 9: Rejects registration of zero address", async function () {
      await expect(
        votingContract.connect(admin).registerVoter(ethers.ZeroAddress)
      ).to.be.revertedWith("VotingSystem: Cannot register zero address");
    });

    it("Test 10: Admin can batch register multiple voters", async function () {
      await votingContract.connect(admin).registerMultipleVoters([voter1.address, voter2.address, voter3.address]);
      expect(await votingContract.registeredVoterCount()).to.equal(3);
    });
  });

  describe("4. State Transitions & Access Control", function () {
    it("Test 11: Rejects voting when election is NOT_STARTED", async function () {
      await votingContract.connect(admin).addCandidate("Alice", "Tech", "Bio");
      await votingContract.connect(admin).registerVoter(voter1.address);

      await expect(
        votingContract.connect(voter1).vote(1)
      ).to.be.revertedWith("VotingSystem: Invalid election state for this action");
    });

    it("Test 12: Cannot start election with less than 2 candidates", async function () {
      await votingContract.connect(admin).addCandidate("Solo Candidate", "Solo", "Bio");
      await expect(
        votingContract.connect(admin).startElection()
      ).to.be.revertedWith("VotingSystem: Must have at least 2 candidates to start");
    });

    it("Test 13: Admin starts election successfully and emits ElectionStarted", async function () {
      await votingContract.connect(admin).addCandidate("Alice", "Tech", "Bio");
      await votingContract.connect(admin).addCandidate("Bob", "Green", "Bio");
      
      await expect(votingContract.connect(admin).startElection())
        .to.emit(votingContract, "ElectionStarted");

      expect(await votingContract.state()).to.equal(1); // ACTIVE
    });

    it("Test 14: Cannot add candidates or register voters after election starts", async function () {
      await votingContract.connect(admin).addCandidate("Alice", "Tech", "Bio");
      await votingContract.connect(admin).addCandidate("Bob", "Green", "Bio");
      await votingContract.connect(admin).startElection();

      await expect(
        votingContract.connect(admin).addCandidate("Late Candidate", "Late", "Bio")
      ).to.be.revertedWith("VotingSystem: Invalid election state for this action");

      await expect(
        votingContract.connect(admin).registerVoter(voter1.address)
      ).to.be.revertedWith("VotingSystem: Invalid election state for this action");
    });
  });

  describe("5. Voting Logic & Ballot Privacy", function () {
    beforeEach(async function () {
      await votingContract.connect(admin).addCandidate("Alice Vance", "Tech Party", "Bio");
      await votingContract.connect(admin).addCandidate("Bob Miller", "Green Party", "Bio");
      await votingContract.connect(admin).addCandidate("Charlie Davis", "Union Party", "Bio");
      await votingContract.connect(admin).registerVoter(voter1.address);
      await votingContract.connect(admin).registerVoter(voter2.address);
      await votingContract.connect(admin).registerVoter(voter3.address);
      await votingContract.connect(admin).startElection();
    });

    it("Test 15: Registered voter can cast vote successfully (Privacy: candidateId hidden in event)", async function () {
      const tx = await votingContract.connect(voter1).vote(1);
      await expect(tx)
        .to.emit(votingContract, "VoteRecorded")
        .withArgs(voter1.address, (await ethers.provider.getBlock(tx.blockNumber)).timestamp);

      const candidate = await votingContract.getCandidate(1);
      expect(candidate.voteCount).to.equal(1);
      expect(await votingContract.totalVotes()).to.equal(1);

      const voter = await votingContract.voters(voter1.address);
      expect(voter.hasVoted).to.be.true;
    });

    it("Test 16: Rejects double voting attempt by same voter", async function () {
      await votingContract.connect(voter1).vote(1);
      await expect(
        votingContract.connect(voter1).vote(2)
      ).to.be.revertedWith("VotingSystem: You have already cast your vote");
    });

    it("Test 17: Rejects vote from unregistered address", async function () {
      await expect(
        votingContract.connect(unregisteredVoter).vote(1)
      ).to.be.revertedWith("VotingSystem: You are not registered to vote");
    });

    it("Test 18: Rejects vote for non-existent candidate ID", async function () {
      await expect(
        votingContract.connect(voter1).vote(99)
      ).to.be.revertedWith("VotingSystem: Invalid candidate ID");
    });
  });

  describe("6. Election Closure & Winner Calculation", function () {
    beforeEach(async function () {
      await votingContract.connect(admin).addCandidate("Alice Vance", "Tech", "Bio");
      await votingContract.connect(admin).addCandidate("Bob Miller", "Green", "Bio");
      await votingContract.connect(admin).registerVoter(voter1.address);
      await votingContract.connect(admin).registerVoter(voter2.address);
      await votingContract.connect(admin).registerVoter(voter3.address);
      await votingContract.connect(admin).startElection();
    });

    it("Test 19: Winner can only be fetched after election ENDED, accurately returns highest vote", async function () {
      await votingContract.connect(voter1).vote(1);
      await votingContract.connect(voter2).vote(1);
      await votingContract.connect(voter3).vote(2);

      // Cannot call getWinner while ACTIVE
      await expect(votingContract.getWinner()).to.be.revertedWith("VotingSystem: Winner can only be declared after election ends");

      await votingContract.connect(admin).endElection();
      expect(await votingContract.state()).to.equal(2); // ENDED

      const [winningId, winningName, winningVotes, isTie] = await votingContract.getWinner();
      expect(winningId).to.equal(1);
      expect(winningName).to.equal("Alice Vance");
      expect(winningVotes).to.equal(2);
      expect(isTie).to.be.false;
    });

    it("Test 20: Accurately detects and reports a TIE between candidates", async function () {
      await votingContract.connect(voter1).vote(1); // Alice 1
      await votingContract.connect(voter2).vote(2); // Bob 1
      await votingContract.connect(admin).endElection();

      const [winningId, winningName, winningVotes, isTie] = await votingContract.getWinner();
      expect(isTie).to.be.true;
      expect(winningName).to.equal("Tie between top candidates");
      expect(winningVotes).to.equal(1);
    });
  });
});
`;

export interface TestCaseResult {
  id: number;
  suite: string;
  name: string;
  action: string;
  expectedResult: string;
  expectedRevert?: string;
  gasEstimated: number;
  status: 'passed' | 'failed' | 'running' | 'pending';
  durationMs: number;
  outputLog: string;
}

export const TEST_CASES_SPEC: Omit<TestCaseResult, 'status' | 'durationMs' | 'outputLog'>[] = [
  {
    id: 1,
    suite: "1. Deployment & Initialization",
    name: "Deployer is assigned as Election Admin",
    action: "Deploy contract with deployer signer",
    expectedResult: "admin() == deployer.address",
    gasEstimated: 852400
  },
  {
    id: 2,
    suite: "1. Deployment & Initialization",
    name: "Initial state is NOT_STARTED (0)",
    action: "Read state() mapping",
    expectedResult: "state() == 0",
    gasEstimated: 23100
  },
  {
    id: 3,
    suite: "1. Deployment & Initialization",
    name: "Election name & metadata stored correctly",
    action: "Read electionName() & electionDescription()",
    expectedResult: "Matches constructor arguments",
    gasEstimated: 28400
  },
  {
    id: 4,
    suite: "2. Candidate Registration",
    name: "Admin adds candidate & emits CandidateAdded event",
    action: "admin.addCandidate('Alice', 'Tech', 'Bio')",
    expectedResult: "Candidate 1 registered, voteCount = 0, event emitted",
    gasEstimated: 78920
  },
  {
    id: 5,
    suite: "2. Candidate Registration",
    name: "Non-admin cannot add candidates",
    action: "attacker.addCandidate('Fake', 'Attacker', 'Bio')",
    expectedResult: "Revert with 'Caller is not the election admin'",
    expectedRevert: "VotingSystem: Caller is not the election admin",
    gasEstimated: 24100
  },
  {
    id: 6,
    suite: "2. Candidate Registration",
    name: "Rejects candidate with empty name string",
    action: "admin.addCandidate('', 'Party', 'Bio')",
    expectedResult: "Revert with 'Candidate name cannot be empty'",
    expectedRevert: "VotingSystem: Candidate name cannot be empty",
    gasEstimated: 23900
  },
  {
    id: 7,
    suite: "3. Voter Registration",
    name: "Admin registers eligible voter",
    action: "admin.registerVoter(voter1.address)",
    expectedResult: "voters[voter1].isRegistered == true, event emitted",
    gasEstimated: 45200
  },
  {
    id: 8,
    suite: "3. Voter Registration",
    name: "Rejects duplicate voter registration",
    action: "admin.registerVoter(voter1.address) twice",
    expectedResult: "Revert with 'Voter is already registered'",
    expectedRevert: "VotingSystem: Voter is already registered",
    gasEstimated: 26800
  },
  {
    id: 9,
    suite: "3. Voter Registration",
    name: "Rejects registration of zero address",
    action: "admin.registerVoter(address(0))",
    expectedResult: "Revert with 'Cannot register zero address'",
    expectedRevert: "VotingSystem: Cannot register zero address",
    gasEstimated: 22400
  },
  {
    id: 10,
    suite: "3. Voter Registration",
    name: "Admin batch registers multiple voter addresses",
    action: "admin.registerMultipleVoters([v1, v2, v3])",
    expectedResult: "registeredVoterCount == 3",
    gasEstimated: 92400
  },
  {
    id: 11,
    suite: "4. State Transitions",
    name: "Voting rejected before election starts",
    action: "voter1.vote(1) in state NOT_STARTED",
    expectedResult: "Revert with 'Invalid election state for this action'",
    expectedRevert: "VotingSystem: Invalid election state for this action",
    gasEstimated: 24300
  },
  {
    id: 12,
    suite: "4. State Transitions",
    name: "Cannot start election without >= 2 candidates",
    action: "admin.startElection() with 1 candidate",
    expectedResult: "Revert with 'Must have at least 2 candidates to start'",
    expectedRevert: "VotingSystem: Must have at least 2 candidates to start",
    gasEstimated: 25100
  },
  {
    id: 13,
    suite: "4. State Transitions",
    name: "Admin starts election -> ACTIVE (1)",
    action: "admin.startElection() with candidates",
    expectedResult: "state() == 1, startTime set, event emitted",
    gasEstimated: 51200
  },
  {
    id: 14,
    suite: "4. State Transitions",
    name: "Cannot register candidates or voters once ACTIVE",
    action: "admin.addCandidate(...) or admin.registerVoter(...)",
    expectedResult: "Reverts with 'Invalid election state'",
    expectedRevert: "VotingSystem: Invalid election state for this action",
    gasEstimated: 24800
  },
  {
    id: 15,
    suite: "5. Voting & Ballot Privacy",
    name: "Eligible voter casts vote & privacy preserved",
    action: "voter1.vote(1)",
    expectedResult: "voter1.hasVoted == true, cand1.voteCount +1, VoteRecorded(voter1, time) emitted without candId",
    gasEstimated: 68400
  },
  {
    id: 16,
    suite: "5. Voting & Ballot Privacy",
    name: "Double voting is strictly rejected",
    action: "voter1.vote(2) after voting once",
    expectedResult: "Revert with 'You have already cast your vote'",
    expectedRevert: "VotingSystem: You have already cast your vote",
    gasEstimated: 27100
  },
  {
    id: 17,
    suite: "5. Voting & Ballot Privacy",
    name: "Unregistered voter rejected",
    action: "unregistered.vote(1)",
    expectedResult: "Revert with 'You are not registered to vote'",
    expectedRevert: "VotingSystem: You are not registered to vote",
    gasEstimated: 26900
  },
  {
    id: 18,
    suite: "5. Voting & Ballot Privacy",
    name: "Invalid candidate ID rejected",
    action: "voter2.vote(99)",
    expectedResult: "Revert with 'Invalid candidate ID'",
    expectedRevert: "VotingSystem: Invalid candidate ID",
    gasEstimated: 27500
  },
  {
    id: 19,
    suite: "6. Closure & Results",
    name: "Election ended -> declares single winner",
    action: "admin.endElection() -> getWinner()",
    expectedResult: "Returns candidate with max votes and isTie == false",
    gasEstimated: 49800
  },
  {
    id: 20,
    suite: "6. Closure & Results",
    name: "Detects and cleanly handles TIE condition",
    action: "Both candidates get equal votes -> getWinner()",
    expectedResult: "isTie == true, winningName == 'Tie between top candidates'",
    gasEstimated: 46200
  }
];
