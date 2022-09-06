import { inject, injectable } from 'inversify';
import { API } from './api';
import projectSelectionPrompt from './prompts/projectSelection.prompt';

@injectable()
export class Projects {
    constructor(@inject('API') private _api: API) {}

    public async projectSelection() {
        const projects = await this._api.getProjects();
        const { project, action } = await projectSelectionPrompt(projects);

        console.log({ project, action });
    }
}
