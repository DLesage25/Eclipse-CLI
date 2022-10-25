import { AuthConfig } from 'eclipse/types/AuthConfig.type';
import { injectable } from 'inversify';

@injectable()
export class AuthMock {
    public async checkIfAuthFlowRequired(): Promise<boolean> {
        return true;
    }

    public async initializeAuthFlow(): Promise<boolean> {
        return true;
    }

    public async getConfig(): Promise<AuthConfig | null> {
        return null;
    }

    public async logout() {
        return;
    }
}
