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

  describe.skip('Basic tests', () => {
    it("should assert true", async () => {
      expect(true).to.be.true;
    });
    it("should create a new Voting contract instance", async () => {
      votingInstance = await Voting.new({ from: OWNER });
      expect(votingInstance.address).to.be.not.null;
    });
    it("should estimate gas during creation of a new Voting contract instance", async () => {
      const gasEstimation = await Voting.new.estimateGas({from: OWNER});
      assert(gasEstimation);
      console.log(gasEstimation);
    });
  });

  

  describe.skip('Workflow tests', () => {
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
      expectEvent( workflowEvent
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
});
