import 'reflect-metadata';
import { promises as fs } from 'fs';
import {
    fileNotationToObject,
    FileUtil,
    objectToFileNotation,
} from './fileUtil';

// jest.mock('fs');
describe('fileUtil', () => {
    const fileUtil = new FileUtil('');

    describe('find', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => true);
        });
        it('should return true if file found', async () => {
            fs.stat = jest.fn().mockReturnValueOnce(true);
            jest.spyOn(fileUtil, 'find');

            const result = await fileUtil.find();
            expect(fileUtil.find).toHaveBeenCalled();
            expect(result).toBeTruthy();
        });

        it('should return false if file is not found', async () => {
            fs.stat = jest.fn().mockReturnValueOnce(false);
            jest.spyOn(fileUtil, 'find');

            const result = await fileUtil.find();
            expect(fileUtil.find).toHaveBeenCalled();
            expect(result).toBeFalsy();
        });

        it('should return false if exception raised', async () => {
            fs.stat = jest.fn().mockImplementationOnce(() => {
                throw new Error('test');
            });
            jest.spyOn(fs, 'stat');

            const result = await fileUtil.find();
            expect(fs.stat).toHaveBeenCalled();
            expect(result).toBeFalsy();
        });
    });

    describe('writeFile', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => true);
        });
        it('should return true if file is written', async () => {
            fs.writeFile = jest.fn().mockResolvedValue(true);
            jest.spyOn(fileUtil, 'writeFile');

            const result = await fileUtil.writeFile('');
            expect(fileUtil.writeFile).toHaveBeenCalled();
            expect(result).toBeTruthy();
        });

        it('should return false if error when file is being written', async () => {
            fs.writeFile = jest.fn().mockImplementationOnce(() => {
                throw new Error('test');
            });
            jest.spyOn(fileUtil, 'writeFile');

            const result = await fileUtil.writeFile('');
            expect(fileUtil.writeFile).toHaveBeenCalled();
            expect(result).toBeFalsy();
        });
    });

    describe('createOrUpdate', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => true);
        });
        it('should replace if file exists', async () => {
            fs.stat = jest.fn().mockResolvedValueOnce(true);
            fs.readFile = jest.fn().mockResolvedValueOnce('test=123');
            fs.writeFile = jest.fn().mockResolvedValue(true);
            jest.spyOn(fileUtil, 'writeFile');
            jest.spyOn(fileUtil, 'find');
            jest.spyOn(fileUtil, 'replaceOnFile').mockResolvedValueOnce(true);

            const result = await fileUtil.createOrUpdate({
                data: { test2: 345 },
            });

            expect(fileUtil.find).toHaveBeenCalled();
            expect(fileUtil.replaceOnFile).toHaveBeenCalled();

            expect(result).toBeTruthy();
        });

        it('should write if file does not exist', async () => {
            fs.stat = jest.fn().mockResolvedValueOnce(false);
            fs.writeFile = jest.fn().mockResolvedValue(true);
            jest.spyOn(fileUtil, 'writeFile').mockResolvedValueOnce(true);
            jest.spyOn(fileUtil, 'find');

            const result = await fileUtil.createOrUpdate({
                data: { test2: 345 },
            });

            expect(fileUtil.find).toHaveBeenCalled();
            expect(fileUtil.writeFile).toHaveBeenCalledWith(
                'test2=345\n',
                undefined
            );

            expect(result).toBeTruthy();
        });
    });

    describe('read', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => true);
        });
        it('should read file content', async () => {
            fs.readFile = jest.fn().mockResolvedValueOnce('test');
            jest.spyOn(fileUtil, 'read');

            const result = await fileUtil.read();
            expect(fs.readFile).toHaveBeenCalled();
            expect(result).toEqual('test');
        });

        it('should return empty string if error', async () => {
            fs.readFile = jest.fn().mockImplementationOnce(() => {
                throw new Error('test');
            });

            const result = await fileUtil.read();
            expect(fs.readFile).toHaveBeenCalled();
            expect(result).toEqual('');
        });
    });

    describe('readIntoObject', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => true);
        });
        it('should return file content as object', async () => {
            fs.readFile = jest.fn().mockResolvedValueOnce('test=true');
            jest.spyOn(fileUtil, 'read');

            const result = await fileUtil.readIntoObject();
            expect(fs.readFile).toHaveBeenCalled();
            expect(result).toEqual({ test: true });
        });

        it('should return empty object if error', async () => {
            jest.spyOn(fileUtil, 'read').mockImplementationOnce(() => {
                throw new Error('test');
            });

            let result;
            try {
                result = await fileUtil.readIntoObject();
            } catch (e) {
                expect(fs.readFile).toHaveBeenCalled();
                expect(result).toEqual({});
            }
        });
    });

    describe('replaceOnFile', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.restoreAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => true);
        });
        it('should replace file content', async () => {
            fs.readFile = jest.fn().mockResolvedValueOnce('test=true');
            fs.writeFile = jest.fn().mockResolvedValueOnce(true);

            jest.spyOn(fileUtil, 'read');
            jest.spyOn(fileUtil, 'writeFile');

            const result = await fileUtil.replaceOnFile({
                test: 'false',
                test2: 'true',
            });
            expect(fs.readFile).toHaveBeenCalled();
            expect(fs.writeFile).toHaveBeenCalled();
            expect(fileUtil.writeFile).toHaveBeenCalledWith(
                'test=false\ntest2=true\n'
            );
            expect(result).toBeTruthy();
        });

        it('should return false if error', async () => {
            jest.spyOn(fileUtil, 'read').mockImplementationOnce(() => {
                throw new Error('test');
            });

            jest.spyOn(fileUtil, 'read');

            const result = await fileUtil.replaceOnFile({
                test: 'false',
                test2: 'true',
            });
            expect(fileUtil.read).toHaveBeenCalled();
            expect(result).toBeFalsy();
        });
    });

    describe('utilityFunctions', () => {
        const fileNotation = 'test=test\ntest2=test2\n';
        const object = {
            test: 'test',
            test2: 'test2',
        };
        const fileNotationWithNumber = 'test=123\ntest2=345\n';
        const objectWithNumber = {
            test: 123,
            test2: 345,
        };
        describe('fileNotationToObject', () => {
            it('should translate file notation to object', () => {
                const result = fileNotationToObject(fileNotation);
                expect(result).toEqual(object);
            });

            it('should translate file notation to object with preserved number types', () => {
                const result = fileNotationToObject(fileNotationWithNumber);
                expect(result).toEqual(objectWithNumber);
            });
        });

        describe('objectToFileNotation', () => {
            it('should translate object to file notation', () => {
                const result = objectToFileNotation(object);
                expect(result).toEqual(fileNotation);
            });

            it('should translate object to file notation with numbers', () => {
                const result = objectToFileNotation(objectWithNumber);
                expect(result).toEqual(fileNotationWithNumber);
            });
        });
    });
});
