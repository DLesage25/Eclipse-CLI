import { injectable } from 'inversify';
import { KeyChain } from '../eclipse/keychain/keychain';

@injectable()
export class KeyChainMock implements KeyChain {
    public async getKey(): Promise<string | null> {
        return '';
    }
    public async setKey(name: string, account: string, value: string) {
        return;
    }
    public async deleteKey(name: string, account: string) {
        return true;
    }
}
