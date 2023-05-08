*This repo has been revamped to work with Goerli. Due to AaveV2 not being deployed on Goerli, it may not work as intended. Please use a mainnet-fork or local network instead of a testnet.*

# Get Started with AAVE

*APY rate: The annual percentage yield*

1. Deposit collateral || ETH / WETH (Wrapped Ether is basically Ethereum but it's an ERC20 token contract)
2. Borrow another asset: DAI
3. Repay the DAI

## A Fork Blockchain 
- literally takes a copy of an existing blockchain and brings it on our local computer
- doesn't download the entire (toàn bộ) blockchain into our local setup.
- Just make an API call to our Ethereum node

// TradeOffs: đánh đổi

- Pros (advantages): Quick, easy, resemble what's on mainnet
- Cons (disadvantages): We need an API, some contracts are complex to work with

## LendingPool contract
The LendingPool contract is the main contract of the protocol (AAVE). It exposes all the user-oriented actions that can be involed using either Solidity or web3 libraries.

About Methods:
https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool/

Ex: If you deposit 0.02 ETH
You have 0.02 worth of ETH deposited
You have 0 worth of ETH borrowed
You can borrow 0.0165 worth of ETH (82.5%)

Tóm tắt những việc làm trong cái repo này :)) 

- getWeth từ contract (WETH mainnet contract address), contract deposit 0.02 WETH cho deployer, trong balanceOf(deployer) nhận được 0.02 WETH
- Thực hiện các thao tác trên forking mainnet, deposit erc20 token là WETH đã get vào lendingpool
- getLendingPool, approve token mình hiện có với lendingpool
- Thực hiện vay 1 token khác (DAI token), trả token
- Các phương thức trong lendingpool tham khảo link bên trên