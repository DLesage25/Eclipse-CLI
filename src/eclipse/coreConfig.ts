import { inject, injectable } from 'inversify';
import { KeyChain } from './keychain';
import { ApiConfig, CoreConfig } from './types/CoreConfig.type';
import { fileNotationToObject, objectToFileNotation } from './utils/fileUtil';

@injectable()
export class CoreConfigModule {
    constructor(@inject('KeyChain') private keychain: KeyChain) {}

    public async get(): Promise<CoreConfig | null> {
        const rawData = await this.keychain.getKey('eclipse', 'core');

        if (!rawData) return null;

        const config = fileNotationToObject<CoreConfig>(rawData);
        return config;
    }

    public async set(config: CoreConfig) {
        const fileFormat = objectToFileNotation(config);
        return this.keychain.setKey('eclipse', 'core', fileFormat);
    }

    public delete() {
        return this.keychain.deleteKey('eclipse', 'core');
    }

    public async initialize({
        ECLIPSE_AUTH_TARGET_AUDIENCE,
        ECLIPSE_AUTH_CLIENT_ID,
        ECLIPSE_AUTH_DOMAIN,
    }: ApiConfig): Promise<boolean> {
        await this.set({
            ECLIPSE_AUTH_SERVER_PORT: 4242,
            ECLIPSE_AUTH_CALLBACK_URL: 'http://localhost:4242',
            ECLIPSE_AUTH_CLIENT_ID,
            ECLIPSE_AUTH_DOMAIN,
            ECLIPSE_AUTH_TARGET_AUDIENCE,
        });
        return true;
    }
}
