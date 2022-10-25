import { Project } from 'eclipse/types/Project.type';
import 'reflect-metadata';

import { ApiMock } from '../../mocks/api.mock';
import { FileUtilMock } from '../../mocks/fileUtil.mock';
import { LoggerMock } from '../../mocks/logger.mock';
import { ProjectConfigMock } from '../../mocks/projectConfig.mock';
import { SecretsMock } from '../../mocks/secrets.mock';
import { ShellMock } from '../../mocks/shell.mock';
import Projects from './projects';

const mockProjectSelectionPromptMock = jest.fn();
jest.mock(
    '../prompts/projectSelection.prompt',
    () => () => mockProjectSelectionPromptMock()
);

const mockSingleProjectActionPrompt = jest.fn();
jest.mock(
    '../prompts/singleProjectAction.prompt',
    () => () => mockSingleProjectActionPrompt()
);

describe('projects', () => {
    const apiMock = new ApiMock();
    const loggerMock = new LoggerMock();
    const secretsMock = new SecretsMock();
    const envFileMock = new FileUtilMock('');
    const projectConfigMock = new ProjectConfigMock();
    const shellMock = new ShellMock();

    const projects = new Projects(
        // @ts-ignore
        apiMock,
        loggerMock,
        secretsMock,
        envFileMock,
        projectConfigMock,
        shellMock
    );

    describe('projectSelection', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('returns early if not projects are found and logs a warning', async () => {
            jest.spyOn(apiMock, 'getProjects').mockResolvedValueOnce([]);
            jest.spyOn(loggerMock, 'warning');

            await projects.projectSelection();

            expect(apiMock.getProjects).toHaveBeenCalled();
            expect(loggerMock.warning).toHaveBeenCalled();
        });

        it('returns early if selected project is not found and logs a warning', async () => {
            jest.spyOn(apiMock, 'getProjects').mockResolvedValueOnce([
                { _id: '123' },
            ] as Project[]);
            jest.spyOn(loggerMock, 'warning');
            mockProjectSelectionPromptMock.mockResolvedValueOnce({
                projectId: '234',
                action: 'test',
            });

            await projects.projectSelection();

            expect(apiMock.getProjects).toHaveBeenCalled();
            expect(loggerMock.warning).toHaveBeenCalled();
        });

        it('returns project action if selected project is found', async () => {
            jest.spyOn(apiMock, 'getProjects').mockResolvedValueOnce([
                { _id: '123' },
            ] as Project[]);
            jest.spyOn(loggerMock, 'warning');
            jest.spyOn(projects as any, 'projectActions');
            mockProjectSelectionPromptMock.mockResolvedValueOnce({
                projectId: '123',
                action: 'test',
            });

            await projects.projectSelection();

            expect(apiMock.getProjects).toHaveBeenCalled();
            expect(projects['projectActions']).toHaveBeenCalledWith('test', {
                _id: '123',
            } as Project);
        });
    });

    describe('getProject', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should get projects and return first item in array', async () => {
            jest.spyOn(apiMock, 'getProjects').mockResolvedValueOnce([
                { _id: '123' },
            ] as Project[]);

            const result = await projects['getProject']('123');

            expect(apiMock.getProjects).toHaveBeenCalled();
            expect(result).toEqual({
                _id: '123',
            } as Project);
        });
    });

    describe('promptSingleProjectActions', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should return early and log an error if no project is found for user', async () => {
            jest.spyOn(projects as any, 'getProject').mockResolvedValueOnce(
                null
            );
            jest.spyOn(loggerMock, 'error');

            await projects['promptSingleProjectActions']('123');

            expect(projects['getProject']).toHaveBeenCalled();
            expect(loggerMock.error).toHaveBeenCalled();
        });

        it('should return given project action with selected project', async () => {
            jest.spyOn(projects as any, 'getProject').mockResolvedValueOnce({
                _id: '123',
            });
            jest.spyOn(projects as any, 'projectActions');
            mockSingleProjectActionPrompt.mockResolvedValueOnce({
                action: 'test',
            });

            await projects['promptSingleProjectActions']('123');

            expect(projects['getProject']).toHaveBeenCalled();
            expect(projects['projectActions']).toHaveBeenCalledWith('test', {
                _id: '123',
            } as Project);
        });
    });

    describe('viewProjectSecrets', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should return early if no secrets are found and log a warning', async () => {
            jest.spyOn(secretsMock, 'getPartialSecrets');
            jest.spyOn(loggerMock, 'warning');

            await projects.viewProjectSecrets({ _id: '123' } as Project);

            expect(secretsMock.getPartialSecrets).toHaveBeenCalled();
            expect(loggerMock.warning).toHaveBeenCalled();
        });

        it('should log all formatted secrets if found', async () => {
            jest.spyOn(secretsMock, 'getPartialSecrets').mockResolvedValueOnce({
                test: 'true',
            });
            jest.spyOn(loggerMock, 'success');

            await projects.viewProjectSecrets({ _id: '123' } as Project);

            expect(secretsMock.getPartialSecrets).toHaveBeenCalled();
            expect(loggerMock.success).toHaveBeenCalledWith('test=true\n');
        });
    });

    describe('printSecrets', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should return early if no secrets are found and log a warning', async () => {
            jest.spyOn(secretsMock, 'getPartialSecrets');
            jest.spyOn(loggerMock, 'warning');

            await projects['printSecrets']({ _id: '123' } as Project);

            expect(secretsMock.getPartialSecrets).toHaveBeenCalled();
            expect(loggerMock.warning).toHaveBeenCalled();
        });

        it('should log all formatted secrets if found', async () => {
            jest.spyOn(secretsMock, 'getPartialSecrets').mockResolvedValueOnce({
                test: 'true',
            });
            jest.spyOn(envFileMock, 'createOrUpdate');

            await projects['printSecrets']({ _id: '123' } as Project);

            expect(secretsMock.getPartialSecrets).toHaveBeenCalled();
            expect(envFileMock.createOrUpdate).toHaveBeenCalledWith({
                test: 'true',
            });
        });
    });

    describe('projectDirectoryMenu', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should return early if project config is not found', async () => {
            jest.spyOn(
                projectConfigMock,
                'checkIfExists'
            ).mockResolvedValueOnce(false);
            jest.spyOn(projectConfigMock, 'readConfigFile');

            await projects.projectDirectoryMenu();

            expect(projectConfigMock.checkIfExists).toHaveBeenCalled();
            expect(projectConfigMock.readConfigFile).not.toHaveBeenCalled();
        });

        it('should return early if config file is malformed', async () => {
            jest.spyOn(
                projectConfigMock,
                'checkIfExists'
            ).mockResolvedValueOnce(true);
            jest.spyOn(
                projectConfigMock,
                'readConfigFile'
            ).mockResolvedValueOnce({});
            jest.spyOn(loggerMock, 'error');

            const result = await projects.projectDirectoryMenu();

            expect(projectConfigMock.checkIfExists).toHaveBeenCalled();
            expect(projectConfigMock.readConfigFile).toHaveBeenCalled();
            expect(loggerMock.error).toHaveBeenCalled();
            expect(result).toBeFalsy();
        });

        it('should return prompt for single project actions if on project directory and correct config found', async () => {
            jest.spyOn(projects as any, 'promptSingleProjectActions');

            jest.spyOn(
                projectConfigMock,
                'checkIfExists'
            ).mockResolvedValueOnce(true);
            jest.spyOn(
                projectConfigMock,
                'readConfigFile'
            ).mockResolvedValueOnce({
                PROJECT: '123',
            });

            const result = await projects.projectDirectoryMenu();

            expect(projectConfigMock.checkIfExists).toHaveBeenCalled();
            expect(projectConfigMock.readConfigFile).toHaveBeenCalled();
            expect(projects['promptSingleProjectActions']).toHaveBeenCalledWith(
                '123'
            );
            expect(result).toBeTruthy();
        });
    });

    describe('checkIfOnProjectDirectory', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should return checkifexists result', async () => {
            jest.spyOn(
                projectConfigMock,
                'checkIfExists'
            ).mockResolvedValueOnce(true);

            const result = await projects.checkIfOnProjectDirectory();

            expect(projectConfigMock.checkIfExists).toHaveBeenCalled();
            expect(result).toBeTruthy();
        });
    });

    describe('getCurrentProject', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should return early if config file is malformed', async () => {
            jest.spyOn(
                projectConfigMock,
                'readConfigFile'
            ).mockResolvedValueOnce({});
            jest.spyOn(loggerMock, 'error');

            await projects.getCurrentProject();

            expect(projectConfigMock.readConfigFile).toHaveBeenCalled();
            expect(loggerMock.error).toHaveBeenCalled();
        });
        it('should return early if config file is malformed', async () => {
            jest.spyOn(
                projectConfigMock,
                'readConfigFile'
            ).mockResolvedValueOnce({
                PROJECT: '123',
            });
            jest.spyOn(projects as any, 'getProject');

            await projects.getCurrentProject();

            expect(projectConfigMock.readConfigFile).toHaveBeenCalled();
            expect(projects['getProject']).toHaveBeenCalledWith('123');
        });
    });

    describe('getCurrentProjectSecrets', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should return early if no project is found', async () => {
            jest.spyOn(projects, 'getCurrentProject').mockResolvedValueOnce(
                undefined
            );
            jest.spyOn(secretsMock, 'getPartialSecrets');

            await projects.getCurrentProjectSecrets();

            expect(projects.getCurrentProject).toHaveBeenCalled();
            expect(secretsMock.getPartialSecrets).not.toHaveBeenCalled();
        });
        it('should return early if no secrets are found', async () => {
            jest.spyOn(projects, 'getCurrentProject').mockResolvedValueOnce({
                _id: '123',
            } as Project);
            jest.spyOn(
                secretsMock,
                'getPartialSecrets'
            ).mockResolvedValueOnce();
            jest.spyOn(loggerMock, 'warning');

            await projects.getCurrentProjectSecrets();

            expect(projects.getCurrentProject).toHaveBeenCalled();
            expect(secretsMock.getPartialSecrets).toHaveBeenCalled();
            expect(loggerMock.warning).toHaveBeenCalled();
        });

        it('should return secrets if project and secrets found', async () => {
            jest.spyOn(projects, 'getCurrentProject').mockResolvedValueOnce({
                _id: '123',
            } as Project);
            jest.spyOn(secretsMock, 'getPartialSecrets').mockResolvedValueOnce({
                test: 'true',
            });

            const result = await projects.getCurrentProjectSecrets();

            expect(projects.getCurrentProject).toHaveBeenCalled();
            expect(secretsMock.getPartialSecrets).toHaveBeenCalled();
            expect(result).toEqual({
                test: 'true',
            });
        });
    });

    describe('injectLocalProjectSecrets', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        it('should initialize shell with no secrets if none found', async () => {
            jest.spyOn(
                projects,
                'getCurrentProjectSecrets'
            ).mockResolvedValueOnce(undefined);
            jest.spyOn(shellMock, 'initialize');

            await projects.injectLocalProjectSecrets('npm', ['start']);

            expect(projects.getCurrentProjectSecrets).toHaveBeenCalled();
            expect(shellMock.initialize).toHaveBeenCalledWith(
                'npm',
                ['start'],
                {}
            );
        });

        it('should initialize shell no secrets if found', async () => {
            jest.spyOn(
                projects,
                'getCurrentProjectSecrets'
            ).mockResolvedValueOnce({
                test: 'true',
            });
            jest.spyOn(shellMock, 'initialize');

            await projects.injectLocalProjectSecrets('npm', ['start']);

            expect(projects.getCurrentProjectSecrets).toHaveBeenCalled();
            expect(shellMock.initialize).toHaveBeenCalledWith(
                'npm',
                ['start'],
                {
                    test: 'true',
                }
            );
        });
    });
});
