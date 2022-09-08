import { injectable } from 'inversify';
import keytar from 'keytar';

@injectable()
export class KeyChain {
    public async getKey(
        service: string,
        account: string
    ): Promise<string | null> {
        return keytar.getPassword(service, account);
    }

    public async setKey(service: string, account: string, password: string) {
        return keytar.setPassword(service, account, password);
    }
}
