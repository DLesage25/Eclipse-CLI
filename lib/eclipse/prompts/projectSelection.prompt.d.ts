import inquirer from 'inquirer';
import { Project } from '../types/Project.type';
export default function projectSelectionPrompt(projects: Project[]): Promise<import("inquirer").Answers> & {
    ui: inquirer.ui.Prompt<import("inquirer").Answers>;
};
