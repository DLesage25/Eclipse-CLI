import { KeyChain } from 'eclipse/keychain/keychain';
import { ApiConfig, CoreConfig } from 'eclipse/types/CoreConfig.type';
import { inject, injectable } from 'inversify';

@injectable()
export class CoreConfigMock {
    constructor(private keychain: any) {}

    public async get(): Promise<CoreConfig | null> {
        return null;
    }

    public async set(config: CoreConfig): Promise<void> {
        return;
    }

    public async delete() {
        return true;
    }
    public async initialize({
        ECLIPSE_AUTH_TARGET_AUDIENCE,
        ECLIPSE_AUTH_CLIENT_ID,
        ECLIPSE_AUTH_DOMAIN,
    }: ApiConfig): Promise<boolean> {
        return true;
    }
}
