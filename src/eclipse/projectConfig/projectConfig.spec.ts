import 'reflect-metadata';
import { FileUtilMock } from '../../mocks/fileUtil.mock';
import { LoggerMock } from '../../mocks/logger.mock';
import ProjectConfig from './projectConfig';

describe('projectConfig', () => {
    const loggerMock = new LoggerMock();
    const fileUtilMock = new FileUtilMock('');
    //@ts-ignore
    const projectConfig = new ProjectConfig(loggerMock, fileUtilMock);

    describe('createConfigFile', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });
        it('should create or update config file', async () => {
            jest.spyOn(fileUtilMock, 'createOrUpdate');

            await projectConfig.createConfigFile('projectId');

            expect(fileUtilMock.createOrUpdate).toHaveBeenCalledWith({
                PROJECT: 'projectId',
            });
        });
    });

    describe('readConfigFile', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });
        it('should create or update config file', async () => {
            jest.spyOn(fileUtilMock, 'readIntoObject').mockResolvedValueOnce({
                PROJECT: 'projectId',
            });

            const result = await projectConfig.readConfigFile();

            expect(fileUtilMock.readIntoObject).toHaveBeenCalled();
            expect(result).toEqual({
                PROJECT: 'projectId',
            });
        });
    });

    describe('checkIfExists', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });
        it('should create or update config file', async () => {
            jest.spyOn(fileUtilMock, 'find').mockResolvedValueOnce(true);

            const result = await projectConfig.checkIfExists();

            expect(fileUtilMock.find).toHaveBeenCalled();
            expect(result).toEqual(true);
        });
    });
});
