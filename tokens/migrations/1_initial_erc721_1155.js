// const ERC721Rarible = artifacts.require('ERC721Rarible')
const ERC1155Rarible = artifacts.require('ERC1155Rarible')

module.exports = async function (deployer) {
    // await deployer.deploy(ERC721Rarible)
    await deployer.deploy(ERC1155Rarible)
    
    // const ERC721_Rarible = await ERC721Rarible.deployed()
    // await ERC721_Rarible.__ERC721Rarible_init("Deedy", "DDD", "ipfs://", "")

    const ERC1155_Rarible = await ERC1155Rarible.deployed()
    await ERC1155_Rarible.__ERC1155Rarible_init("Deedy", "DDDD", "ipfs:/", "")
}