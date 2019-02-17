// @ts-ignore
import crypto from 'libp2p-crypto';

crypto.keys.generateKeyPair('ed25519', 512, (error, privKey) => {
  privKey.public.hash((error, digest) => {
    // const peerId = new PeerId(digest, privKey);
  });
});
