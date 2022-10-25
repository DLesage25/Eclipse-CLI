export class CommandsMock {
    public async processCommand(
        postArguments: string[],
        isInProjectDirectory: boolean
    ): Promise<boolean> {
        return true;
    }

    public async processGenericCommand() {
        return true;
    }

    public async processProjectCommand() {
        return true;
    }

    public async processRemoveCommand() {
        return true;
    }

    public async getCurrentProject() {
        return null;
    }

    public async processListCommand() {
        return true;
    }

    public async processAddCommand() {
        return true;
    }

    public async processInjectCommand() {
        return true;
    }

    public showToolVersion() {
        return;
    }

    public showHelpLog() {
        return;
    }
}
