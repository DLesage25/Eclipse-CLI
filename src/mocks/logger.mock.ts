import { Logger } from 'eclipse/utils/logger';
import { injectable } from 'inversify';

@injectable()
export class LoggerMock implements Logger {
    public verticalSeparator(): void {
        return;
    }

    public message(msg: string): void {
        return;
    }

    public success(msg: string): void {
        return;
    }

    public warning(msg: string): void {
        return;
    }

    public error(msg: string): void {
        return;
    }

    public banner(msg: string, options: any): void {
        return;
    }
}
