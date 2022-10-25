export class ProjectConfigMock {
    public async createConfigFile(projectId: string): Promise<void> {
        return;
    }

    public async readConfigFile(): Promise<
        { PROJECT: string } | Record<string, unknown>
    > {
        return {};
    }

    public async checkIfExists(): Promise<boolean> {
        return true;
    }
}
