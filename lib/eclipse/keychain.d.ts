export declare class KeyChain {
    getKey(service: string, account: string): Promise<string | null>;
    setKey(service: string, account: string, password: string): Promise<void>;
    deleteKey(service: string, account: string): Promise<boolean>;
}
