import { KeyChain } from './keychain';
import { ApiConfig, CoreConfig } from './types/CoreConfig.type';
export declare class CoreConfigModule {
    private keychain;
    constructor(keychain: KeyChain);
    get(): Promise<CoreConfig | null>;
    set(config: CoreConfig): Promise<void>;
    delete(): Promise<boolean>;
    initialize({ ECLIPSE_AUTH_TARGET_AUDIENCE, ECLIPSE_AUTH_CLIENT_ID, ECLIPSE_AUTH_DOMAIN, }: ApiConfig): Promise<boolean>;
}
