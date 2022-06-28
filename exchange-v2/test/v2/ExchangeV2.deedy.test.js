const ExchangeV2 = artifacts.require("ExchangeV2")
const TestERC20 = artifacts.require("TestERC20")
const ERC1155_V2 = artifacts.require("ERC1155Rarible")
const TransferProxy = artifacts.require("TransferProxy")
const ERC20TransferProxy = artifacts.require("ERC20TransferProxy")
const RoyaltiesRegistry = artifacts.require("RoyaltiesRegistry")

const { Order, Asset, sign } = require("../order")
const ZERO = "0x0000000000000000000000000000000000000000"
const { ETH, ERC20, ERC721, ERC1155, ORDER_DATA_V1, TO_MAKER, TO_TAKER, PROTOCOL, ROYALTY, ORIGIN, PAYOUT, enc, id } = require("../assets")

const { generateTokenId } = require('./utils')

contract("ExchangeV2, sellerFee + buyerFee =  6%,", accounts => {
	let testing;
	let transferProxy;
	let erc20TransferProxy;
	let t1;
	let community = accounts[8];
	let royaltiesRegistry;
	let tokenId;
	const zeroWord = "0x0000000000000000000000000000000000000000000000000000000000000000";

	beforeEach(async () => {
		transferProxy = await TransferProxy.new();
		await transferProxy.__TransferProxy_init();
		erc20TransferProxy = await ERC20TransferProxy.new();
		await erc20TransferProxy.__ERC20TransferProxy_init();
		royaltiesRegistry = await RoyaltiesRegistry.new();
		
		testing = await ExchangeV2.new();
		await testing.__ExchangeV2_init(transferProxy.address, erc20TransferProxy.address, 0, 0, community, royaltiesRegistry.address);

		await transferProxy.addOperator(testing.address);
		await erc20TransferProxy.addOperator(testing.address);
		
		t1 = await TestERC20.new();
		t2 = await TestERC20.new();

		erc1155_v2 = await ERC1155_V2.new();
		erc1155_v2.__ERC1155Rarible_init("DEEDY", "DDD", "ipfs:/", "");

		await erc1155_v2.setDefaultApproval(transferProxy.address, true, { gas: 100000 })

	});
	describe("matchOrders", () => {

		it("From ERC20(DataV1) to ERC1155(RoyalytiV2, DataV1) Protocol, Origin fees, Royalties ", async () => {

			const { left, right } = await prepare20DV1_1155V2Orders()

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
					from: accounts[2] 
				}
			)

			assert.equal(await t1.balanceOf(accounts[1]), 20)
			assert.equal(await t1.balanceOf(accounts[2]), 100)

			assert.equal(await erc1155_v2.balanceOf(accounts[1], tokenId), 1)
			assert.equal(await erc1155_v2.balanceOf(accounts[2], tokenId), 0)
		})

		async function prepare20DV1_1155V2Orders(t1Amount = 120, t2Amount = 1) {
			await t1.mint(accounts[1], t1Amount);
			
			let tokenGeneralId = 1
			tokenId = generateTokenId(accounts[2] , tokenGeneralId)

			await erc1155_v2.mintAndTransfer(
				[
					tokenId, 
					"uri",
					t2Amount,
					[{ account: accounts[2], value: 10000 }],
					[],
					[zeroWord]
				], 
				accounts[2],
				t2Amount, // amount to be minted
				{ 
					from: accounts[2] 
				}
			)
			
			await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[1] })

			const left = Order(accounts[1], Asset(ERC20, enc(t1.address), 100), ZERO, Asset(ERC1155, enc( erc1155_v2.address, tokenId), 1), 1, 0, 0, "0xffffffff", "0x")

			const right = Order(accounts[2], Asset(ERC1155, enc( erc1155_v2.address, tokenId), 1), ZERO, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x")

			return { left, right }
		}
	})
})
