import { Auth } from './auth/auth';
import { CoreConfigModule } from './coreConfig';
import { CreateSecretDto } from './dtos/createSecret.dto';
import { ApiConfig } from './types/CoreConfig.type';
import { Project } from './types/Project.type';
import { RevealedSecret } from './types/Secret.type';
import { Logger } from './utils/logger';
export declare class API {
    private auth;
    private logger;
    private coreConfig;
    private _http;
    constructor(auth: Auth, logger: Logger, coreConfig: CoreConfigModule);
    Initialize(): Promise<void>;
    getCliValues(): Promise<ApiConfig>;
    getUser(): Promise<any>;
    getProjects(projectId?: string): Promise<Project[]>;
    getSecrets(projectId: string): Promise<RevealedSecret[]>;
    createSecret(createSecretDto: CreateSecretDto): Promise<any>;
    deleteSecret(secretId: string): Promise<void | null>;
}
