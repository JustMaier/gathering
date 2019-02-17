// Type definitions for pull-handshake 1.1.4
// Project: https://github.com/pull-stream/pull-handshake
// Definitions by: Jaco Greeff <https://github.com/jacogr>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="node"/>

declare module 'pull-handshake' {
type Options = {
    timeout: number
};

export type Handshake = {
    handshake: {
        abort: () => void;
        read: (length: number, cb: (error: Error, buffer: Buffer) => void) => void;
        write: (buffer: Buffer) => void;
    }
};

export type PullHandshake = (options?: Options, errorHandler?: (error?: Error) => void) => Handshake;

const handshake: PullHandshake;

export default handshake;
}
