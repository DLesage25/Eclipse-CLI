import { yellow, green, underline } from 'kleur';

export const welcomeMessage = `
It looks like this is your first time running Eclipse. 
    
Use the main menu to access your projects, manage secrets, and create configuration files
in repos. 

To start injecting environment variables, run eclipse on your repository,
select a project, and initialize a configuration file. 

Then run ${yellow(
    'eclipse inject all node'
)} and your project's environment variables
should be available in the process.env object.

To see more available commands, run ${yellow('eclipse help')}. Happy hacking!

`;

export const helpMessage = `
${underline('General commands')}

- ${green('eclipse v, version')} - output version number

- ${green('eclipse h, help')} - output help log

${underline('Project commands')}

- ${green(
    'eclipse i/inject component/environment <process>'
)} - inject secrets unto an execution context

For example: 
${yellow(
    'eclipse i api/staging npm start'
)} will inject secrets created for the API component under the staging environment into your node execution.
${yellow(
    'eclipse inject web/prod npm start'
)} will inject secrets for the web component under the prod environment.

- ${green(
    'eclipse ls/list component/environment'
)} - list the secrets of the project tagged in your working directory, for the given component and environment.

For example:
${yellow(
    'eclipse ls api/staging'
)} will list all staging secrets for the API component.

- ${green(
    'eclipse a/add component/environment <secretname> <secretvalue>'
)} - create a secret under the given component and environment for the project in your working directory.

For example:
${yellow(
    'eclipse a api/staging MY_SECRET MY_TOKEN'
)} will create MY_SECRET for the api component under the staging environment

- ${green(
    'eclipse rm/remove component/environment <secretname>'
)} - delete a secret under the given component and environment.

For example:
${yellow(
    'eclipse rm api/staging MY_SECRET'
)} will delete MY_SECRET under the api component and staging environment.

To see this help log again, run ${green('eclipse help')}
`;
