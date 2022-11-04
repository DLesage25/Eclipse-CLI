import 'reflect-metadata';

import { ApiMock } from '../../mocks/api.mock';
import { AuthMock } from '../../mocks/auth.mock';
import { CommandsMock } from '../../mocks/commands.mock';
import { CoreConfigMock } from '../../mocks/coreConfig.mock';
import { LoggerMock } from '../../mocks/logger.mock';
import { ProjectsMock } from '../../mocks/projects.mock';
import Main from './main';

describe('main', () => {
    const authMock = new AuthMock();
    const loggerMock = new LoggerMock();
    const apiMock = new ApiMock();
    const projectsMock = new ProjectsMock();
    const coreConfigMock = new CoreConfigMock('');
    const commandsMock = new CommandsMock();

    const main = new Main(
        // @ts-ignore
        authMock,
        loggerMock,
        apiMock,
        projectsMock,
        coreConfigMock,
        commandsMock
    );

    describe('execute', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should return early true if core config does not exist', async () => {
            jest.spyOn(console, 'clear');
            jest.spyOn(main as any, 'showIntroLog');
            jest.spyOn(main as any, 'checkForCoreConfig').mockResolvedValueOnce(
                false
            );

            jest.spyOn(authMock, 'checkIfAuthFlowRequired');

            const result = await main.execute();

            expect(main['checkForCoreConfig']).toHaveBeenCalled();
            expect(authMock.checkIfAuthFlowRequired).not.toHaveBeenCalled();
            expect(result).toBeTruthy();
        });

        it('should return early true if user could not be logged in', async () => {
            process.argv = ['--arg1', '1', '--arg2', 'hello'];

            jest.spyOn(console, 'clear');
            jest.spyOn(main as any, 'showIntroLog');
            jest.spyOn(main as any, 'checkForCoreConfig').mockResolvedValueOnce(
                true
            );
            jest.spyOn(
                authMock,
                'checkIfAuthFlowRequired'
            ).mockResolvedValueOnce(false);
            jest.spyOn(apiMock, 'Initialize');

            const result = await main.execute();

            expect(main['checkForCoreConfig']).toHaveBeenCalled();
            expect(authMock.checkIfAuthFlowRequired).toHaveBeenCalled();
            expect(apiMock.Initialize).not.toHaveBeenCalled();
            expect(result).toBeFalsy();
        });

        it('should initialize api and show top level menu if not on project directory', async () => {
            jest.spyOn(console, 'clear');
            jest.spyOn(main as any, 'showIntroLog');
            jest.spyOn(main as any, 'checkForCoreConfig').mockResolvedValueOnce(
                true
            );
            jest.spyOn(
                authMock,
                'checkIfAuthFlowRequired'
            ).mockResolvedValueOnce(true);
            jest.spyOn(apiMock, 'Initialize');
            jest.spyOn(
                projectsMock,
                'checkIfOnProjectDirectory'
            ).mockResolvedValueOnce(false);
            jest.spyOn(main as any, 'showTopLevelMenu').mockImplementationOnce(
                () => true
            );

            const result = await main.execute();

            expect(main['checkForCoreConfig']).toHaveBeenCalled();
            expect(authMock.checkIfAuthFlowRequired).toHaveBeenCalled();
            expect(apiMock.Initialize).toHaveBeenCalled();
            expect(projectsMock.checkIfOnProjectDirectory).toHaveBeenCalled();
            expect(main['showTopLevelMenu']).toHaveBeenCalled();
            expect(result).toBeTruthy();
        });

        it('should initialize api and show project menu if on project directory', async () => {
            jest.spyOn(console, 'clear');
            jest.spyOn(main as any, 'showIntroLog');
            jest.spyOn(main as any, 'checkForCoreConfig').mockResolvedValueOnce(
                true
            );
            jest.spyOn(
                authMock,
                'checkIfAuthFlowRequired'
            ).mockResolvedValueOnce(true);
            jest.spyOn(apiMock, 'Initialize');
            jest.spyOn(
                projectsMock,
                'checkIfOnProjectDirectory'
            ).mockResolvedValueOnce(true);
            jest.spyOn(projectsMock, 'projectDirectoryMenu');

            const result = await main.execute();

            expect(main['checkForCoreConfig']).toHaveBeenCalled();
            expect(authMock.checkIfAuthFlowRequired).toHaveBeenCalled();
            expect(apiMock.Initialize).toHaveBeenCalled();
            expect(projectsMock.checkIfOnProjectDirectory).toHaveBeenCalled();
            expect(projectsMock.projectDirectoryMenu).toHaveBeenCalled();
            expect(result).toBeTruthy();
        });

        it('should initialize api and process command if post arguments present', async () => {
            process.argv = ['', '', 'ls'];

            jest.spyOn(console, 'clear');
            jest.spyOn(main as any, 'showIntroLog');
            jest.spyOn(main as any, 'checkForCoreConfig').mockResolvedValueOnce(
                true
            );
            jest.spyOn(
                authMock,
                'checkIfAuthFlowRequired'
            ).mockResolvedValueOnce(true);
            jest.spyOn(apiMock, 'Initialize');
            jest.spyOn(
                projectsMock,
                'checkIfOnProjectDirectory'
            ).mockResolvedValueOnce(true);
            jest.spyOn(commandsMock, 'processCommand').mockImplementationOnce(
                async () => true
            );

            const result = await main.execute();

            expect(main['checkForCoreConfig']).toHaveBeenCalled();
            expect(authMock.checkIfAuthFlowRequired).toHaveBeenCalled();
            expect(apiMock.Initialize).toHaveBeenCalled();
            expect(projectsMock.checkIfOnProjectDirectory).toHaveBeenCalled();
            expect(commandsMock.processCommand).toHaveBeenCalledWith(
                ['ls'],
                true
            );
            expect(result).toBeTruthy();
        });
    });
});
