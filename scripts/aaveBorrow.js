const { getNamedAccounts, ethers } = require("hardhat")
const {getWeth, AMOUNT} = require("../scripts/getWeth")
async function main() {
    // the protocol treats everything as an ERC20 token
    await getWeth()

    const {deployer} = await getNamedAccounts()
    // abi, address
    // Lending Pool Address Provider: 0xb53c1a33016b2dc2ff3653530bff1848a515c8c5
    // Lending Pool: ^
    const lendingPool = await getLendingPool(deployer) // signer
    console.log(`LendingPool address ${lendingPool.address}`)

    // deposit!
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" // mainnet
    // approve
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)
    console.log("Depositing...")
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("Deposited!")

    let {availableBorrowsETH, totalDebtETH} = await getBorrowUserData(lendingPool, deployer)
    // Borrow Time!
    // how much we have borrowed, how much we have in collateral, how much we can borrow
    // availableBorrowsETH ?? what the conversion rate on DAI is? 
    // Tỉ lệ chuyển đổi sang DAI token?
    const daiPrice = await getDaiPrice()
    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber())
    // 95% is LTV (Loan-to-value ratio)
    console.log(`You can borrow ${amountDaiToBorrow} DAI`)
    const amountDaiToBorrowWei = ethers.utils.parseEther(
        amountDaiToBorrow.toString()
    )
    const daiTokenAddress = "0x6b175474e89094c44da98b954eedeac495271d0f" // dai token address on mainnet
    await borrowDai(
        daiTokenAddress,
        lendingPool,
        amountDaiToBorrowWei,
        deployer
    )
    await getBorrowUserData(lendingPool, deployer)
    await repay(amountDaiToBorrowWei, daiTokenAddress, lendingPool, deployer)
    await getBorrowUserData(lendingPool, deployer)
}

async function repay(amount, daiAddress, lendingPool, account) {
    await approveErc20(daiAddress, lendingPool.address, amount, account)
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account)
    await repayTx.wait(1)
    console.log("Repaid")
}

async function borrowDai(
    daiAddress,
    lendingPool,
    amountDaiToBorrowWei,
    account
) {
    const borrowTx = await lendingPool.borrow(
        daiAddress,
        amountDaiToBorrowWei,
        1, // interestRateMode - the type of borrow debt. Stable: 1, Variable: 2
        0, // referralCode (mã giới thiệu) - referral code for our referral program. Use 0 for no referral code.
        account
    )
    await borrowTx.wait(1)
    console.log("You've borrowed!")          
}

// Price Feed Addresses: DAI/ETH mainnet - https://docs.chain.link/data-feeds/price-feeds/addresses
async function getDaiPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
        )
    // don't need to connect this to the deployer account
    // we're NOT going to BE sending any transactions
    // just read from the contract
    // reading don't need the signer

    const price = (await daiEthPriceFeed.latestRoundData())[1] // 0: roundId 1: answer
    console.log(`The DAI/ETH price is ${price.toString()}`)
    // 08/05/2023: daiPrice: 541975566541698(Wei) = 0.000541975566541698ETH
    // ETH: $1,854.95
    // daiPrice ~= 1.01 usd
    return price
}

async function getBorrowUserData(lendingPool, account){
    const {totalCollateralETH, totalDebtETH, availableBorrowsETH} = await lendingPool.getUserAccountData(account)
    // số ETH thế chấp (deposited), số ETH đang nợ (borrowed), số ETH còn có thể vay thêm (available borrow)
    console.log(`You have ${totalCollateralETH} worth of ETH deposited`)
    console.log(`You have ${totalDebtETH} worth of ETH borrowed`)
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH`)
    return {availableBorrowsETH, totalDebtETH}
}


async function getLendingPool(account) {
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xb53c1a33016b2dc2ff3653530bff1848a515c8c5",
        account,
    )
    const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account,
    )
    return lendingPool
}

async function approveErc20(
    erc20Address,
    spenderAddress,
    amountToSpend,
    account
    ) {
        const erc20Token = await ethers.getContractAt(
            "IERC20",
            erc20Address,
            account
        )
        const tx = await erc20Token.approve(spenderAddress, amountToSpend)
        await tx.wait(1)
        console.log("Approved!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
