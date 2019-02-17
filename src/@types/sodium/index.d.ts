// Type definitions for sodium 2.0.3
// Project: https://github.com/paixaop/node-sodium
// Definitions by: Jaco Greeff <https://github.com/jacogr>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="node"/>

declare module 'sodium' {
type SodiumKeyPair = {
    getPublicKey (): {
        baseBuffer: Buffer
    }
}
type Sodium = {
    Key: {
        Sign: {
            fromSeed (seed: Buffer): SodiumKeyPair
        }
    }
}

const sodium: Sodium;

export default sodium;
}
