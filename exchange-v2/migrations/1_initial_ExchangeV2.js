const ExchangeV2 = artifacts.require('ExchangeV2')
const ERC20TransferProxy = artifacts.require('ERC20TransferProxy')
const TransferProxy = artifacts.require('TransferProxy')
const RoyaltiesRegistry = artifacts.require('RoyaltiesRegistry')

const rinkeby = {
	communityWallet: "0xeE9D9945C17622B420D5f1f16adB0668227C7e9d",
}

const bsc = {
	communityWallet: "0xeE9D9945C17622B420D5f1f16adB0668227C7e9d",
}

const polygon = {
	communityWallet: "0xeE9D9945C17622B420D5f1f16adB0668227C7e9d",
}

const mainnet = {
	communityWallet: "0xeE9D9945C17622B420D5f1f16adB0668227C7e9d"
}

const development = {
	communityWallet: "0xeE9D9945C17622B420D5f1f16adB0668227C7e9d"
}

const mumbai = {
	communityWallet: "0xeE9D9945C17622B420D5f1f16adB0668227C7e9d",
}

let settings = {
	"rinkeby": rinkeby,
	"bsc": bsc,
	"polygon": polygon,
	"mainnet": mainnet,
	"development": development,
	"mumbai": mumbai
}

function getSettings(network) {
	if (settings[network] !== undefined) {
		return settings[network]
	} else {
		return settings["default"]
	}
}

module.exports = async function (deployer, network) {
	const { communityWallet } = getSettings(network)

	await deployer.deploy(ERC20TransferProxy)
	const eRC20TransferProxy = await ERC20TransferProxy.deployed()
	await eRC20TransferProxy.__ERC20TransferProxy_init()

	await deployer.deploy(TransferProxy)
	const transferProxy = await TransferProxy.deployed()
	await transferProxy.__TransferProxy_init()

	await deployer.deploy(RoyaltiesRegistry)
	const royaltiesRegistry = await RoyaltiesRegistry.deployed()
	await royaltiesRegistry.initializeRoyaltiesRegistry()

	await deployer.deploy(ExchangeV2)
	const exchangeV2 = await ExchangeV2.deployed()
	await exchangeV2.__ExchangeV2_init(transferProxy.address, eRC20TransferProxy.address, 100, 100, communityWallet, royaltiesRegistry.address)

	// await exchangeV2.__ExchangeV2_init("0x74FE0Ec6797216651a21D781a5470d8BB2e1513A", "0x7a20B363FBd9637082B0B6e1FA6D3dB2bf30Bb4a", 100, 100, communityWallet, "0xcFcf0a0015A8A18c352295Fb29fFe086eF0d6813")
};