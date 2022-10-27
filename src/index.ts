import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

import { Container } from 'inversify';

import Main from './eclipse/main';
import Auth from './eclipse/auth';
import API from './eclipse/api';
import KeyChain from './eclipse/keychain';
import Shell from './eclipse/shell';
import CoreConfigModule from './eclipse/coreConfig';
import ProjectConfig from './eclipse/projectConfig';
import Projects from './eclipse/projects';
import Secrets from './eclipse/secrets';

import { FileUtil } from './eclipse/utils/fileUtil';
import { Logger } from './eclipse/utils/logger';
import { Commands } from './eclipse/commands';

export function index(): Main {
    const container: Container = new Container();

    container.bind<Main>('Main').to(Main).inSingletonScope();
    container.bind<Auth>('Auth').to(Auth).inRequestScope();
    container.bind<Logger>('Logger').to(Logger).inSingletonScope();
    container.bind<API>('API').to(API).inSingletonScope();
    container.bind<Projects>('Projects').to(Projects).inSingletonScope();
    container.bind<Secrets>('Secrets').to(Secrets).inSingletonScope();
    container.bind<KeyChain>('KeyChain').to(KeyChain).inSingletonScope();
    container.bind<Shell>('Shell').to(Shell).inSingletonScope();
    container.bind<Commands>('Commands').to(Commands).inSingletonScope();
    container
        .bind<CoreConfigModule>('CoreConfig')
        .to(CoreConfigModule)
        .inSingletonScope();
    container
        .bind<ProjectConfig>('ProjectConfig')
        .to(ProjectConfig)
        .inSingletonScope();
    container
        .bind<FileUtil>('EnvFile')
        .toDynamicValue(() => new FileUtil('./.env'));
    container
        .bind<FileUtil>('ConfigFile')
        .toDynamicValue(() => new FileUtil('./.eclipserc'));

    return container.get<Main>('Main');
}

index();
