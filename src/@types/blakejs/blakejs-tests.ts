import blake from 'blakejs';

blake.blake2bHex(new Uint8Array([1, 2, 3, 4, 5]));
blake.blake2sHex(Buffer.from([1, 2, 3, 4, 5]));
