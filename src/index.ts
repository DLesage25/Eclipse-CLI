import 'reflect-metadata';
require('dotenv').config();
console.log(process.env);

import { Container } from 'inversify';
import { AuthFile } from './eclipse/auth/authFile';
import { Eclipse } from './eclipse/eclipse';
import { Options } from './eclipse/options';
import { Auth } from './eclipse/auth/auth';

export function index(): Eclipse {
    const container: Container = new Container();

    container.bind<Eclipse>('Eclipse').to(Eclipse).inSingletonScope();
    container.bind<Options>('Options').to(Options).inSingletonScope();
    container.bind<AuthFile>('AuthFile').to(AuthFile).inSingletonScope();
    container.bind<Auth>('Auth').to(Auth).inSingletonScope();

    return container.get<Eclipse>('Eclipse');
}

index();
