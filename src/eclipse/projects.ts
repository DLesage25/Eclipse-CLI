import { inject, injectable } from 'inversify';
import { API } from './api';
import projectSelectionPrompt from './prompts/projectSelection.prompt';
import { Project } from './types/Project.type';
import { objectToFileNotation } from './utils/fileUtil';
import { Logger } from './utils/logger';

@injectable()
export class Projects {
    private projectMethods: any;
    constructor(
        @inject('API') private _api: API,
        @inject('Logger') private logger: Logger
    ) {
        this.projectMethods = {
            view: this.viewSecrets(_api),
            add: this.addSecret(_api),
            remove: this.removeSecret(_api),
            print: this.printSecrets(_api),
        };
    }

    public async projectSelection() {
        const projects = await this._api.getProjects();
        const { projectId, action } = await projectSelectionPrompt(projects);

        const selectedProject = projects.find((p) => p._id === projectId);

        if (!selectedProject) {
            this.logger.warning('No project selected.');
            return;
        }

        return this.projectMethods[action](selectedProject);
    }

    private viewSecrets = (_api: API) => async (project: Project) => {
        const secrets = await _api.getSecrets(project._id);
        const filteredSecrets = secrets.reduce((prev, secret) => {
            return {
                ...prev,
                [secret.name]: secret.value,
            };
        }, {});
        const formattedSecrets = objectToFileNotation(filteredSecrets);
        this.logger.success(formattedSecrets);
        return;
    };

    private addSecret = (_api: API) => async (project: Project) => {};

    private removeSecret = (_api: API) => async (project: Project) => {};

    private printSecrets = (_api: API) => async (project: Project) => {};
}
