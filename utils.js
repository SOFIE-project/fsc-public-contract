const web3 = require('web3')

// Simulate solidity sha3 with array values
// Taken from https://github.com/ethereumjs/ethereumjs-abi/issues/27#issuecomment-450572127
function boxSignatureHash(boxId, sessionId, signatures) {
    let packedSignatures = []
    signatures.map((sig, index) => {
        packedSignatures[index] = {t: 'bytes', v: web3.utils.leftPad(sig, 64)}
    })

    return web3.utils.soliditySha3(
        {t: 'string', v: boxId},
        {t: 'string', v: sessionId},
        ...packedSignatures,
    )
}

exports.boxSignatureHash = boxSignatureHash