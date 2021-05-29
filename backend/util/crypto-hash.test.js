const cryptoHash=require('./crypto-hash');
describe('Cryptohash Checking', () => {
    it('Checking the SHA-256 Encrypting Algorithm produces correct value or not',()=>{
        expect(cryptoHash("puneeth")).toEqual('520511056ef4c76d5884ae2b510c45fbd959384a3683665fda42bae44f3e96b8');
    });
    it("Checking the Order of input produces same output or not",()=>{
        expect(cryptoHash("one","two","three")).toEqual(cryptoHash("three","one","two"));
    });
    it("changing the hash when the properties of one of the object changes",()=>{
        let foo={};
        const originalHash=cryptoHash(foo);
        foo['1']=1;
        const newHash=cryptoHash(foo);
        expect(newHash).not.toEqual(originalHash);
    });
    
});
