const Voting = artifacts.require("Voting");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect, assert } = require('chai');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Voting", accounts => {

  const OWNER = accounts[0];
  const VOTER1 = accounts[1];
  const VOTER2 = accounts[2];
  const VOTER3 = accounts[3];
  const VOTER4 = accounts[4];
  const NONVOTER1 = accounts[5];

  let votingInstance;

  describe('Basic tests', () => {
    it("should assert true", async () => {
      expect(true).to.be.true;
    });
    it("should create a new Voting contract instance", async () => {
      votingInstance = await Voting.new({ from: OWNER });
      expect(votingInstance.address).to.be.not.null;
    });
  });

  describe('Function getVoter tests', () => {
    before(async () => {
      votingInstance = await Voting.new({ from: OWNER });
    });
    it("should require 1 parameter", async () => {
      await expectRevert(votingInstance.getVoter(), 'Invalid number of parameters for "getVoter". Got 0 expected 1!');
    });
    it("should require a voter to be registered", async () => {
      await expectRevert(votingInstance.getVoter(VOTER1, { from: VOTER1 }), "You're not a voter");
    });
    it("should return a voter when added", async () => {
      await votingInstance.addVoter(VOTER1, { from: OWNER });
      let response = await votingInstance.getVoter(VOTER1, { from: VOTER1 });
      expect(response.isRegistered).to.be.equal(true);
      expect(response.hasVoted).to.be.equal(false);
      expect(response.votedProposalId).to.be.bignumber.equal(new BN(0));
    });
    it("should return not registered for any address not added as voter", async () => {
      let response = await votingInstance.getVoter(NONVOTER1, { from: VOTER1 });
      expect(response.isRegistered).to.be.equal(false);
      expect(response.hasVoted).to.be.equal(false);
      expect(response.votedProposalId).to.be.bignumber.equal(new BN(0));
    });
  });

  describe('Function addVoter tests', () => {
    before(async () => {
      votingInstance = await Voting.new({ from: OWNER });
    });
    it("should require 1 parameter", async () => {
      await expectRevert(votingInstance.addVoter(), 'Invalid number of parameters for "addVoter". Got 0 expected 1!');
    });
    it("should revert when not owner", async () => {
      await expectRevert(votingInstance.addVoter(VOTER2, { from: VOTER1 }), "Ownable: caller is not the owner");
    });
    it("should register a voter successfully and emit event", async () => {
      let addVoter = await votingInstance.addVoter(VOTER1, { from: OWNER });
      expectEvent(addVoter
        , 'VoterRegistered'
        , {
          voterAddress: VOTER1
        });
      let response = await votingInstance.getVoter(VOTER1, { from: VOTER1 });
      expect(response.isRegistered).to.be.equal(true);
    });
    it("should revert if same voter added", async () => {
      await expectRevert(votingInstance.addVoter(VOTER1, { from: OWNER })
        , "Already registered");
    });
    it("should revert when not RegisteringVoters workflow status", async () => {
      await votingInstance.startProposalsRegistering({ from: OWNER });
      await expectRevert(votingInstance.addVoter(VOTER2, { from: OWNER }), "Voters registration is not open yet");
    });
  });

  describe('Function addProposal tests', () => {
    before(async () => {
      votingInstance = await Voting.new({ from: OWNER });
      await votingInstance.addVoter(VOTER1, { from: OWNER });
      await votingInstance.addVoter(VOTER2, { from: OWNER });
    });
    it("should require 1 parameter", async () => {
      await expectRevert(votingInstance.addProposal()
        , 'Invalid number of parameters for "addProposal". Got 0 expected 1!');
    });
    it("should revert when not ProposalsRegistrationStarted workflow status", async () => {
      await expectRevert(votingInstance.addProposal("test proposal", { from: VOTER1 })
        , "Proposals are not allowed yet");
    });
    it("should revert when not a voter", async () => {
      await votingInstance.startProposalsRegistering({ from: OWNER })
      await expectRevert(votingInstance.addProposal("test proposal", { from: NONVOTER1 })
        , "You're not a voter");
    });
    it("should revert when empty description", async () => {
      await expectRevert(votingInstance.addProposal("", { from: VOTER1 })
        , "Vous ne pouvez pas ne rien proposer");
    });
    it("should add proposal and emit ProposalRegistered event", async () => {
      let proposalDescription = 'First proposal';
      let proposalExpectId = new BN(1);
      let addProposal = await votingInstance.addProposal(proposalDescription, { from: VOTER1 })
      expectEvent(addProposal
        , 'ProposalRegistered'
        , {
          proposalId: proposalExpectId
        });
      let proposal = await votingInstance.getOneProposal(proposalExpectId, { from: VOTER1 });
      expect(proposal.description).to.equal(proposalDescription);
      expect(proposal.voteCount).to.be.bignumber.equal(new BN(0));
    });
  });

  describe('Workflow tests', () => {
    before(async () => {
      votingInstance = await Voting.new({ from: OWNER });
    });
    it("workflow status should be set to RegisteringVoters at the beginning", async () => {
      let workflowStatus = await votingInstance.workflowStatus.call();
      expect(workflowStatus).to.be.bignumber.equal(BN(Voting.WorkflowStatus.RegisteringVoters));
    });
    it("workflow status change from RegisteringVoters to ProposalsRegistrationStarted should revert when not owner", async () => {
      await expectRevert(votingInstance.startProposalsRegistering({ from: VOTER1 })
        , "caller is not the owner"
      );
      // TODO OTHER VOTERS
      await expectRevert(votingInstance.startProposalsRegistering({ from: NONVOTER1 })
        , "caller is not the owner"
      );
    });
    it("workflow status should change from RegisteringVoters to ProposalsRegistrationStarted", async () => {
      let workflowEvent = await votingInstance.startProposalsRegistering({ from: OWNER });
      expectEvent(workflowEvent
        , 'WorkflowStatusChange'
        , {
          previousStatus: BN(Voting.WorkflowStatus.RegisteringVoters)
          , newStatus: BN(Voting.WorkflowStatus.ProposalsRegistrationStarted)
        });
    });
    it("workflow status should be set to ProposalsRegistrationStarted", async () => {
      let workflowStatus = await votingInstance.workflowStatus.call();
      expect(workflowStatus).to.be.bignumber.equal(BN(Voting.WorkflowStatus.ProposalsRegistrationStarted));
    });
    it("workflow status change from to ProposalsRegistrationStarted to ProposalsRegistrationStarted should revert", async () => {
      let workflowEvent = votingInstance.startProposalsRegistering({ from: OWNER });
      await expectRevert(workflowEvent
        , "Registering proposals cant be started now"
      );
    });

    // TODO Other workflow status change with same logic
  });

  describe('set Vote tests', () => {
    // TODO
  });
});
