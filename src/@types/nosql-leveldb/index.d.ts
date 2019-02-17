// Type definitions for nosql-leveldb 3.0.1
// Project: https://github.com/snowyu/node-nosql-leveldb
// Definitions by: Jaco Greeff <https://github.com/jacogr>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference types="node"/>

declare module 'nosql-leveldb' {
    type LevelDbOptions$Open = {
        createIfMissing?: boolean,
        errorIfExists?: boolean,
        compression?: boolean,
        cacheSize?: boolean
    };

    type LevelDbOptions$Get ={
        asBuffer?: boolean,
        fillCache?: boolean
    };

    type LevelDbOptions$Put ={
        sync?: boolean
    };

    export interface LevelDb {
        openSync (options?: LevelDbOptions$Open): void;
        closeSync (): void;

        delSync (key: Buffer | string): void;
        getSync (key: Buffer | string, options?: LevelDbOptions$Get): Buffer | string;
        putSync (key: Buffer | string, value: Buffer | string, options?: LevelDbOptions$Put): void;
    }


    const leveldb: (location: string) => LevelDb;

    export default leveldb;
}
