// const ERC721Rarible = artifacts.require('ERC721Rarible')
const ERC1155Rarible = artifacts.require('ERC1155Rarible')

const def = {
	// erc721LazyProxy: "0x0000000000000000000000000000000000000000",
	erc1155LazyProxy: "0xBA9966a3E4a3FB0397339c26704456114E45dca2",
	oldTransferProxy: "0xBA9966a3E4a3FB0397339c26704456114E45dca2"
}

const bsc = {
	// erc721LazyProxy: "0x2B16bbB8A8bD6fb5281B8E99784Cec2b12DAd950",
	erc1155LazyProxy: "0xBA9966a3E4a3FB0397339c26704456114E45dca2",
	oldTransferProxy: "0xBA9966a3E4a3FB0397339c26704456114E45dca2"
}

const polygon = {
	// erc721LazyProxy: "0xEB220bcE32923BBa9d890b8AD3D6Bde8b5F8f2F9",
	erc1155LazyProxy: "0xBA9966a3E4a3FB0397339c26704456114E45dca2",
	oldTransferProxy: "0xBA9966a3E4a3FB0397339c26704456114E45dca2"
}

const development = {
	// erc721LazyProxy: "0xeE9D9945C17622B420D5f1f16adB0668227C7e9d",
	erc1155LazyProxy: "0xBA9966a3E4a3FB0397339c26704456114E45dca2",
	oldTransferProxy: "0xBA9966a3E4a3FB0397339c26704456114E45dca2"
}

const mumbai = {
	// erc721LazyProxy: "0x33A3689dBfEC1f4Fa29F20192240b5411d6E7D78",
	erc1155LazyProxy: "0x6aCd79CB0B5F78Dcf90312e38B917A5436c104a7",
	oldTransferProxy: "0x74FE0Ec6797216651a21D781a5470d8BB2e1513A"
}

let settings = {
	"default": def,
	"bsc": bsc,
	"polygon": polygon,
	"development": development,
	"mumbai": mumbai
};

function getSettings(network) {
	if (settings[network] !== undefined) {
		return settings[network]
	} else {
		return settings["default"]
	}
}

module.exports = async function (deployer, network) {
	const { erc1155LazyProxy, oldTransferProxy } = getSettings(network)

	// const erc721 = await ERC721Rarible.deployed()
	// await erc721.setDefaultApproval(erc721LazyProxy, true, { gas: 100000 })
	// await erc721.setDefaultApproval(oldTransferProxy, true, { gas: 100000 })

	const erc1155 = await ERC1155Rarible.deployed()
	await erc1155.setDefaultApproval(erc1155LazyProxy, true, { gas: 100000 })
	await erc1155.setDefaultApproval(oldTransferProxy, true, { gas: 100000 })
}