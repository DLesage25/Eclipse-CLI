import { Logger } from '../utils/logger';
import { KeyChain } from '../keychain';
import { AuthConfig } from '../types/AuthConfig.type';
import { CoreConfigModule } from '../coreConfig';
export declare class Auth {
    private keyChain;
    private logger;
    private coreConfig;
    private codeVerifier;
    private authConfig;
    constructor(keyChain: KeyChain, logger: Logger, coreConfig: CoreConfigModule);
    checkIfAuthFlowRequired(): Promise<boolean>;
    initializeAuthFlow(): Promise<boolean>;
    getConfig(): Promise<AuthConfig | null>;
    private checkIfTokenExpired;
    private base64URLEncode;
    private sha256;
    private createCodeVerifier;
    private createCodeChallenge;
    private createAuthServer;
    private constructAuthUrl;
    private openAuthPage;
    private handleAuthResponse;
    logout(): Promise<void>;
}
