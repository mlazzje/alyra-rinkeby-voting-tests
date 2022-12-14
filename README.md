# Alyra Rinkeby Voting tests
Alyra Project - Voting smart contract tests - Project #2

## Environnement

```
Truffle v5.6.2 (core: 5.6.2)
Ganache v7.4.4
Solidity - 0.8.17 (solc-js)
Node v16.18.0
Web3.js v1.7.4
```

## Init

Start ganache and run this command

```
truffle test test/voting.test.js --network development
```

## Tests effectués

- Fonction basique et test de déploiement
- Fonction getVoter
- Fonction addVoter + évènement VoterRegistered
- Fonction addProposal + évènement ProposalRegistered
- Changement de workflow + évènement WorkflowStatusChange (uniquement le premier statut et le premier changement)

## Tests à effectuer

- Tous les changements de workflow
- Fonction setVote + évènement Voted
- Variable winningProposalID

## Résultats attendus des tests et estimation du gas

```
Contract: Voting
    Basic tests
      ✓ should assert true (0ms)
      ✓ should create a new Voting contract instance (83ms, 2076814 gas)
    Function getVoter tests
      ✓ should require 1 parameter (244ms)
      ✓ should require a voter to be registered (36ms)
      ✓ should return a voter when added (71ms, 47020 gas)
      ✓ should return not registered for any address not added as voter (21ms)
    Function addVoter tests
      ✓ should require 1 parameter (5ms)
      ✓ should revert when not owner (28ms)
      ✓ should register a voter successfully and emit event (101ms, 47020 gas)
      ✓ should revert if same voter added (38ms)
      ✓ should revert when not RegisteringVoters workflow status (126ms, 89132 gas)
    Function addProposal tests
      ✓ should require 1 parameter (5ms)
      ✓ should revert when not ProposalsRegistrationStarted workflow status (17ms)
      ✓ should revert when not a voter (105ms, 89132 gas)
      ✓ should revert when empty description (19ms)
      ✓ should add proposal and emit ProposalRegistered event (88ms, 55528 gas)
    Workflow tests
      ✓ workflow status should be set to RegisteringVoters at the beginning (19ms)
      ✓ workflow status change from RegisteringVoters to ProposalsRegistrationStarted should revert when not owner (37ms)
      ✓ workflow status should change from RegisteringVoters to ProposalsRegistrationStarted (77ms, 89132 gas)
      ✓ workflow status should be set to ProposalsRegistrationStarted (8ms)
      ✓ workflow status change from to ProposalsRegistrationStarted to ProposalsRegistrationStarted should revert (13ms)

·------------------------------------------|----------------------------|-------------|----------------------------·
|   Solc version: 0.8.17+commit.8df45f5f   ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 6718946 gas  │
···········································|····························|·············|·····························
|  Methods                                                                                                         │
·············|·····························|··············|·············|·············|··············|··············
|  Contract  ·  Method                     ·  Min         ·  Max        ·  Avg        ·  # calls     ·  eur (avg)  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  addProposal                ·           -  ·          -  ·      55528  ·           1  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  addVoter                   ·           -  ·          -  ·      47020  ·           8  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  startProposalsRegistering  ·           -  ·          -  ·      89132  ·           7  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Deployments                             ·                                          ·  % of limit  ·             │
···········································|··············|·············|·············|··············|··············
|  Voting                                  ·           -  ·          -  ·    2076814  ·      30.9 %  ·          -  │
·------------------------------------------|--------------|-------------|-------------|--------------|-------------·

21 passing (6s)

```