import inquirer from 'inquirer';
export default function singleProjectActionPrompt(projectName: string): Promise<import("inquirer").Answers> & {
    ui: inquirer.ui.Prompt<import("inquirer").Answers>;
};