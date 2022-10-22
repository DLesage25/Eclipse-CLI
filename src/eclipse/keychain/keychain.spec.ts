import 'reflect-metadata';

import { KeyChain } from './keychain';
import keytar from 'keytar';

jest.mock('keytar');

describe('Keychain', () => {
    const keychain = new KeyChain();

    beforeEach(() => {
        jest.resetAllMocks();
    });
    describe('getKey', () => {
        it('should retrieve a key from the correct service name and account', async () => {
            await keychain.getKey('service', 'account');

            expect(keytar.getPassword).toHaveBeenCalledTimes(1);
            expect(keytar.getPassword).toHaveBeenCalledWith(
                'service',
                'account'
            );
        });
    });

    describe('setKey', () => {
        it('should store a key with correct service name, account, and password', async () => {
            await keychain.setKey('service', 'account', 'password');

            expect(keytar.setPassword).toHaveBeenCalledTimes(1);
            expect(keytar.setPassword).toHaveBeenCalledWith(
                'service',
                'account',
                'password'
            );
        });
    });

    describe('deleteKey', () => {
        it('should delete a key from the correct service name and account', async () => {
            await keychain.deleteKey('service', 'account');

            expect(keytar.deletePassword).toHaveBeenCalledTimes(1);
            expect(keytar.deletePassword).toHaveBeenCalledWith(
                'service',
                'account'
            );
        });
    });
});
