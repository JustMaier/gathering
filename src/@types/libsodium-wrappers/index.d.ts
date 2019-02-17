// Type definitions for libsodium 0.7.3
// Project: https://github.com/jedisct1/libsodium.js
// Definitions by: Jaco Greeff <https://github.com/jacogr>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="node"/>

declare module 'libsodium-wrappers' {
type LibSodium = {
    ready: Promise<any>;
}

const sodium: LibSodium;

export default sodium;
}
