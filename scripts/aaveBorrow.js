const { getNamedAccounts, ethers } = require("hardhat")
const {getWeth} = require("../scripts/getWeth")
async function main() {
    // the protocol treats everything as an ERC20 token
    await getWeth()

    const {deployer} = await getNamedAccounts()
    // abi, address
}

async function getLendingPool() {
    const lendingPoolAddressesProvider = await ethers.getContractAt("ILendingPoolAddressesProvider")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })