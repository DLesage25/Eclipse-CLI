import 'reflect-metadata';
import os from 'os';

import { Container } from 'inversify';
import { FileUtil } from './eclipse/utils/fileUtil';
import { Eclipse } from './eclipse/eclipse';
import { Options } from './eclipse/options';
import { Auth } from './eclipse/auth/auth';
import { Logger } from './eclipse/utils/logger';
import { API } from './eclipse/api';
import { Projects } from './eclipse/projects';

require('dotenv').config();

export function index(): Eclipse {
    const container: Container = new Container();

    container.bind<Eclipse>('Eclipse').to(Eclipse).inSingletonScope();
    container.bind<Options>('Options').to(Options).inSingletonScope();
    container
        .bind<FileUtil>('AuthFile')
        .toDynamicValue(() => new FileUtil(`${os.homedir()}/.eclipserc`));
    container.bind<Auth>('Auth').to(Auth).inSingletonScope();
    container.bind<Logger>('Logger').to(Logger).inSingletonScope();
    container.bind<API>('API').to(API).inSingletonScope();
    container.bind<Projects>('Projects').to(Projects).inSingletonScope();

    return container.get<Eclipse>('Eclipse');
}

index();
