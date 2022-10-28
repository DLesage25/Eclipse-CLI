import { yellow, green, underline } from 'kleur';

export const welcomeMessage = `
It looks like this is your first time running Eclipse. 
    
Use the main menu to access your projects, manage secrets, and create configuration files
in repos. If you want to start injecting environment variables, run eclipse on your repository,
select your project, and initialize a configuration file. 
`;

export const helpMessage = `
${underline('General commands')}

- ${green('eclipse v, version')} - output version number

- ${green('eclipse h, help')} - output help log

${underline('Project commands')}

- ${green(
    'eclipse i/inject <all | comma-separated classifiers> <process>'
)} - inject secrets unto an execution context

For example: 
${yellow(
    'eclipse i all npm start'
)} will inject all secrets into your node execution.
${yellow(
    'eclipse inject web,staging npm start'
)} will inject only secrets with the web and staging classifiers.

- ${green(
    'eclipse ls/list <optional - classifiers>'
)} - list the secrets of the project tagged in your working directory. Optionally, pass classifiers to only see a subset of your secrets.

For example:
${yellow('eclipse ls')} will list all secrets
${yellow(
    'eclipse list web,staging'
)} will list secrets with the web and staging classifiers

- ${green(
    'eclipse a/add <secretname> <secretvalue> <classifiers>'
)} - create a secret under the project tagged in your working directory

For example:
${yellow(
    'eclipse a MY_SECRET MY_TOKEN api,production'
)} will create MY_SECRET and assign api and production classifiers
${yellow(
    'eclipse add MY_SECRET MY_TOKEN web'
)} will create MY_SECRET and add the web classifier

- ${green(
    'eclipse rm/remove <secretname> <optional - classifiers>'
)} - delete a secret under the project tagged in your working directory

For example:
${yellow(
    'eclipse rm MY_SECRET'
)} will find the first secret called MY_SECRET and delete it
${yellow(
    'eclipse remove MY_SECRET staging'
)} will find the MY_SECRET secret with the web classifier and delete it

To see this help log again, run ${green('eclipse help')}. Happy hacking!
`;
