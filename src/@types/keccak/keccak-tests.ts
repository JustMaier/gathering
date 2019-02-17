import createKeccak from 'keccak';

const context = createKeccak('keccak256');

context.update(Buffer.from([1, 2, 3, 4, 5]));
context.update('hello world');
context.digest();
