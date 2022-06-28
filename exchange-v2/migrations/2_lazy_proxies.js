const ExchangeV2 = artifacts.require('ExchangeV2')
// const ERC721LazyMintTransferProxy = artifacts.require("ERC721LazyMintTransferProxy")
const ERC1155LazyMintTransferProxy = artifacts.require("ERC1155LazyMintTransferProxy")

module.exports = async function (deployer) {
  const ex = await ExchangeV2.deployed()

  // await deployer.deploy(ERC721LazyMintTransferProxy, { gas: 1000000 })
  // const erc721p = await ERC721LazyMintTransferProxy.deployed()
  // await erc721p.__OperatorRole_init()
  // await erc721p.addOperator(ex.address)
  // await ex.setTransferProxy("0xd8f960c1", erc721p.address)

  await deployer.deploy(ERC1155LazyMintTransferProxy, { gas: 1000000 })
  const erc1155p = await ERC1155LazyMintTransferProxy.deployed()
  await erc1155p.__OperatorRole_init()
  await erc1155p.addOperator(ex.address) // TODO ADD HERE
  await ex.setTransferProxy("0x1cdfaa40", erc1155p.address)
  // await ex.setTransferProxy("0x1cdfaa40", "0x6aCd79CB0B5F78Dcf90312e38B917A5436c104a7")
}
