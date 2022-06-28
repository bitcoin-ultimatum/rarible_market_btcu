const TestERC20 = artifacts.require("TestERC20")
const TransferProxy = artifacts.require("TransferProxy")

const ExchangeV2 = artifacts.require("ExchangeV2")
const ERC1155_V2 = artifacts.require("ERC1155Rarible")

const ERC20TransferProxy = artifacts.require("ERC20TransferProxy")
const RoyaltiesRegistry = artifacts.require("RoyaltiesRegistry")

const ERC1155LazyMintTransferProxy = artifacts.require("ERC1155LazyMintTransferProxy")

const { Order, Asset, sign, signMint } = require("../order");

const ZERO = "0x0000000000000000000000000000000000000000";

const { ERC20, ETH, ERC1155, enc, id, ORDER_DATA_V1 } = require("../assets");

const { generateTokenId } = require('./utils')

contract("Exchange with LazyMint proxies", accounts => {
	let testing;
	let transferProxy;
	let lazyTransferProxy;
	let erc20TransferProxy;
	let t1;
	let erc1155_v2;
	let protocol = accounts[9];
	let community = accounts[8];

	beforeEach(async () => {
		transferProxy = await TransferProxy.new();
		await transferProxy.__TransferProxy_init();
		erc20TransferProxy = await ERC20TransferProxy.new();
		await erc20TransferProxy.__ERC20TransferProxy_init();
		royaltiesRegistry = await RoyaltiesRegistry.new();

	
		testing = await ExchangeV2.new();
		await testing.__ExchangeV2_init(transferProxy.address, erc20TransferProxy.address, 300, 300, community, royaltiesRegistry.address);

		await transferProxy.addOperator(testing.address);
		await erc20TransferProxy.addOperator(testing.address);

		lazyTransferProxy = await ERC1155LazyMintTransferProxy.new()
		await lazyTransferProxy.__OperatorRole_init()
		await lazyTransferProxy.addOperator(testing.address)

		await testing.setTransferProxy(id("ERC1155_LAZY"), lazyTransferProxy.address)

		erc1155_v2 = await ERC1155_V2.new();
		erc1155_v2.__ERC1155Rarible_init("DEEDY", "DDD", "ipfs:/", "");
		
		t1 = await TestERC20.new();

		await testing.setWalletForToken(t1.address, protocol);

		erc1155_v2 = await ERC1155_V2.new();
		erc1155_v2.__ERC1155Rarible_init("DEEDY", "DDD", "ipfs:/", "");

		await erc1155_v2.setDefaultApproval(transferProxy.address, true, { gas: 100000 })
		await erc1155_v2.setDefaultApproval(lazyTransferProxy.address, true, { gas: 100000 })
	});

	describe("matchOrders", () => {

		it("lazy mint works for ERC-1155", async () => {
			await t1.mint(accounts[2], 100);
			await t1.mint(accounts[3], 100);
			await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[2] });
			await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[3] });

			let tokenGeneralId = 1
			let tokenId = generateTokenId(accounts[1], tokenGeneralId)

			const uri = "uri"
			const supply = 1

			assert.equal(await erc1155_v2.balanceOf(accounts[2], tokenId), 0);

			const mintHash = await erc1155_v2.mintHash([
				tokenId, 
				uri, 
				supply, 
				creators([accounts[1]]), 
				[{account: accounts[6], value: 1000}, {account: accounts[7], value: 500}], 
				[]
			])

			const mintSig = await web3.eth.accounts.sign(mintHash, "0x729dd2e81d4928831a476232064da64dc12d7117db1e80e6cdec83a47b804aa4")

			const mintRes = mintSig.signature.substring(2)
			const mintR  =  "0x"  + mintRes.substring(0, 64)
			const mintS  =  "0x"  + mintRes.substring(64, 128)
			const mintV  =  parseInt(mintRes.substring(128, 130), 16)
			
			const encodedMintData = await erc1155_v2.encode([
				tokenId, 
				uri, 
				supply, 
				creators([accounts[1]]), 
				[{account: accounts[6], value: 1000}, {account: accounts[7], value: 500}], 
				[{v: mintV, r: mintR, s: mintS}]
			])

			// sell
			const left = Order(accounts[1], Asset(id("ERC1155_LAZY"), encodedMintData, 1), ZERO, Asset(ETH, "0x", "1000000000000000000"), 7859568, 0, 0, "0xffffffff", "0x")
			// buy
			const right = Order(accounts[2], Asset(ETH, "0x", "1000000000000000000"), ZERO, Asset(id("ERC1155_LAZY"), encodedMintData, 1), 7859568, 0, 0, "0xffffffff", "0x")

			const leftHash = await testing.orderHash(left)
			const rightHash = await testing.orderHash(right)

			const leftSignature = await web3.eth.accounts.sign(leftHash, "0x729dd2e81d4928831a476232064da64dc12d7117db1e80e6cdec83a47b804aa4")

			const leftRes = leftSignature.signature.substring(2)
			const leftR  =  "0x"  + leftRes.substring(0, 64)
			const leftS  =  "0x"  + leftRes.substring(64, 128)
			const leftV  =  parseInt(leftRes.substring(128, 130), 16)

			const rightSignature = await web3.eth.accounts.sign(rightHash, "0x42fe6ba2961c72ce51bab33c8b709592ce34d30341ebd896ebec7609ebbf08a5")
			const rightRes = rightSignature.signature.substring(2)
			const rightR  =  "0x"  + rightRes.substring(0, 64)
			const rightS  =  "0x"  + rightRes.substring(64, 128)
			const rightV  =  parseInt(rightRes.substring(128, 130), 16)

			await testing.matchOrders(
				left, 
				right, 
				[leftV, rightV],
				[leftR, leftS, rightR, rightS], 
				{ 
					from: accounts[2],
					value: "1000000000000000000"
				}
			)

			assert.equal(await erc1155_v2.balanceOf(accounts[2], tokenId), 1);
			assert.equal(await erc1155_v2.balanceOf(accounts[1], tokenId), 0);

		})
	})

	function creators(list) {
		const value = 10000 / list.length
		return list.map(account => ({ account, value }))
	}
})