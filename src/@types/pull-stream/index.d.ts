// Type definitions for pull-stream 3.6.8
// Project: https://github.com/pull-stream/pull-stream
// Definitions by: Jaco Greeff <https://github.com/jacogr>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="node"/>

declare module 'pull-stream' {
    export type PullStream = {
        // FIXME this should be actual streams, not 'any'
        (...streams: Array<any>): void;

        collect: (cb: (error: Error | null, values: Array<Buffer>) => any) => void,
        drain: (handler: (message: Buffer) => void, errorHandler?: (error: Error) => boolean) => void;
        values: (values: Array<string | Buffer>) => void;
        map: (mapper: (x: any) => any) => any;
		asyncMap: (mapper: (x: any, cb: (err?: Error, data?: any) => void) => void) => void;
		once: (value: any) => void;
    };

    const pull: PullStream;

    export default pull;
}

declare module 'pull-catch' {
    export default function Catch(handler: (error: Error) => void): any;
}
