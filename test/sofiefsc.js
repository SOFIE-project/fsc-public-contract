const SofieFSC = artifacts.require("SofieFSC");
const truffleAssert = require('truffle-assertions')
const Web3 = require('web3')
const utils = require('../utils')
const chai = require("chai")

contract("SofieFSC", accounts => {
    const sha3 = Web3.utils.sha3
    let sofieContract;
    let owner = accounts[0]
    let user1 = accounts[1]
    let user2 = accounts[2]
    let spy = accounts[3]

    let boxId = "E2801130200020D4DB8D00AB"
    let sessionId = "0x62fbbb911e0b356a0187d25ceee1e6d864f3fb1f6793871f2aa7a4c8f805b69d"
    let signatures = [
        sha3("0x6c0ef8fe3645f9ece16c279f965c2bdcc09b3f1a45741237aeddc4a634397b92"),
        sha3("0xbfa18edad13606bf7296e4d95932120b5b641d8546a0dac50ba5c5b1c87152da" + "{\"establishmentDate\":\"2018-05-02\",\"location\":\"Kiato, Greece\",\"productType\":\"Grapes\",\"name\":\"Integrated Farm 1\",\"ripeningLevel\":\"1789.2\",\"fertilizers\":[{\"name\":\"Limestone\",\"quantity\":\"1kg\"}]}"),
        sha3("0xc1889680f4dea520b5208f0f52bed4be47fa7a7df8039a61c3e12d80d43980b4" + "{\"transportId\":\"0x46ff9921da43e9b388eaa5fc7b1166abc9965641a82d188da2cdf782ef6058e6\"}"),
        sha3("0xad996cb5f0d9189d0edc29565af1cdda6554968bfd2850a679eec2b4cd274f11" + "{\"warehouseId\":\"0x1d30661da8693b09cf5824149e94d64ef412879cfca9f4d501362afb94d67b2b\",\"minTemp\":27.49,\"maxTemp\":27.62,\"avgTemp\":27.52}"),
        sha3("0xf9d32b3d2757f660fd61c0fa76c6e4a5ad72bb4ec6637bc8a480db7f44fd456ca" + "{\"roomId\":\"RoomA\"}"),
        sha3("0xd91a48c34fa872fede2d9381fc6d09772db3ac4def707499e6ed7da9d445a11a" + "{\"packetizeDate\":\"2019-09-20T08:15:00.000Z\"}"),
        sha3("0xa198a5d20d2ee3257f48d80203efa003533911602e2a8acfcf223f68a04e931a" + "{\"minTemp\":20,\"avgTemp\":28,\"maxTemp\":36,\"minHumidity\":25,\"avgHumidity\":45.1,\"maxHumidity\":65,\"transportId\":\"0x46ff9921da43e9b388eaa5fc7b1166abc9965641a82d188da2cdf782ef6058e6\"}"),
        sha3("0x54c279b85212a4a27e75a54f479f4ded45532e00920d0415410d7c351aeee8af" + "{\"supermarket\":\"Supermarket, Athens\",\"minTemp\":27.87,\"maxTemp\":27.99,\"avgTemp\":27.89}"),
    ]

    it("should allow the registration of a user by the owner", async () => {
        let tx = await sofieContract.registerUser(user2, {from: owner})

        truffleAssert.eventEmitted(tx, 'LogUserRegistered', (ev) => {
            return ev.user === user2
        })
    })

    it("should not allow the registration of a user by a third party", async () => {
        await truffleAssert.reverts(
            sofieContract.registerUser(user2, {from: spy}),
            "Only the contract owner can call this function"
        );
    })

    it("should allow the removal of a registered user by the owner", async () => {
        let tx = await sofieContract.removeUser(user1, {from: owner})

        truffleAssert.eventEmitted(tx, 'LogUserRemoved', (ev) => {
            return ev.user === user1
        })
    })

    it("should not allow the removal of a registered user by a third party", async () => {
        await truffleAssert.reverts(
            sofieContract.removeUser(user1, {from: spy}),
            "Only the contract owner can call this function"
        );
    })

    it("should allow the registration of a box session signature by the owner", async () => {
        let tx = await sofieContract.registerSessionSignatures(boxId, sessionId, signatures, {from: owner})

        truffleAssert.eventEmitted(tx, 'LogBoxSessionSignatures', (ev) => {
            return ev.boxId === boxId && ev.sessionId == sessionId && ev.hash == utils.boxSignatureHash(boxId, sessionId, signatures)
        })
    })

    it("should allow the registration of a box session signature by a user", async () => {
        let tx = await sofieContract.registerSessionSignatures(boxId, sessionId, signatures, {from: user1})

        truffleAssert.eventEmitted(tx, 'LogBoxSessionSignatures', (ev) => {
            return ev.boxId === boxId && ev.sessionId == sessionId && ev.hash == utils.boxSignatureHash(boxId, sessionId, signatures)
        })
    })

    it("should not allow the registration of a box session signature by a third party", async () => {
        await truffleAssert.reverts(
            sofieContract.registerSessionSignatures(boxId, sessionId, signatures, {from: spy}),
            "Only contract owner or registered users can call this function"
        )
    })

    it("should retrieve the stored signatures of a box session", async () => {
        let tx = await sofieContract.registerSessionSignatures(boxId, sessionId, signatures, {from: owner})
        let result = await sofieContract.getSessionSignatures.call(boxId, sessionId)

        chai.expect(result[0]).to.eql(signatures)

        assert.equal(
            result[1],
            utils.boxSignatureHash(boxId, sessionId, signatures),
            "Hash match"
        )
    })

    beforeEach(async () => {
        sofieContract = await SofieFSC.new({from: owner})
        await sofieContract.registerUser(user1, {from: owner})
    })

    afterEach(async () => {
        await sofieContract.kill({from: owner})
    })
})