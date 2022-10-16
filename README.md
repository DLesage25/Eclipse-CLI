# EclipseJS CLI

Eclipse is an environment manager that injects sensitive configuration values into your code's execution context, removing the need for local environment files.

### Getting started

First, log in to [Eclipse](https://eclipsejs.io) and set up a project and secrets. You can classify secrets based on their environment (local, staging, prod), or their context (web, api, db).

#### Installation

You can install Eclipse using NPM or Yarn

```
// Use npm
npm i -g @eclipse/cli
// Or yarn
yarn add global @eclipse/cli
```

#### Initialize CLI

Run `eclipse` in your terminal. The first time the CLI is ran, it will download configuration values from the Eclipse servers.

```console
foo@bar:~$ eclipse
$ Welcome to EclipseJS! Initializing configuration...
$ Ecipse CLI is configured! Run Eclipse again to log in.
```

#### Log in

```console
foo@bar:~$ eclipse login
$ A new tab will open in your default browser. Please log in and come back to your terminal after.
$ Log in successful! Please run eclipse again in your terminal.
```

#### Usage

You can use the Eclipse CLI to view and set project secrets, as well as initialize configuration files that tell Eclipse which project a directory belongs to.

##### Select a project

Use your arrow keys to select `See my projects`

```console
foo@bar:~$ eclipse
? What would you like to do? (Use arrow keys)
❯ See my projects
  Log out
```

Select the project you want to work on:

```console
? What would you like to do? View projects
? Please select a project. (Use arrow keys)
❯ MERN project - 2022-10-03T00:39:50.097Z
  DEV_MERN_PROJECT - 2022-10-07T15:10:46.343Z
```

##### Project actions

There are a number of actions you can perform from the CLI.

```console
? What would you like to do? (Use arrow keys)
❯ Initialize a config file in this directory.
  Add a secret to this project.
  Remove a secret from this project.
  View secrets from this project.
  Print project secrets to an .env file.
```

##### Initialize a config file

Eclipse config files (`.eclipserc`) tell Eclipse which project your repository belongs to. If you select this option, Eclipse will create a config file in the current working directory with the identifier of the project you selected.

Once the config file is created, you will be able to use the CLI to inject environment variables into your code's execution context.

##### Inject environment variables

To do this, run `eclipse --inject=<flag> <command>` where `<flag>` is `all` or a comma-separated list of secret classifiers that you wish to inject, and `<command>` is the command you use to run your code (e.g. `npm start/build/test/deploy`).

##### List all project secrets

You can see all project secrets and their values on your console using the CLI menu. If you are on a directory with a config file, you can also run:

```console
foo@bar:~$ eclipse ls
MY_SECRET=some_value
MY_OTHER_SECRET=some_other_value
```

##### Add and remove secrets

To add or remove secrets, you can select the respective option from the CLI menu, or if you are on a directory with a config file, you can use the following shortcuts:

Adding a secret:

```console
foo@bar:~$ eclipse add <secretname> <secretvalue> <classifiers>
$ Secret <secretname> has been created.
```

Removing a secret:

```console
foo@bar:~$ eclipse rm <secretname>
? Are you sure? This cannot be undone. (Use arrow keys)
❯ Confirm
  Cancel
$ Secret deleted.
```

##### Printing to env file

You can optionally print project secrets to a `.env` file if you do not wish to use Eclipse's environment injection feature. Do this through the CLI menu, or if you are on a directory with a config file, run:

```console
foo@bar:~$ eclipse print .env
$ Environment file printed to working directory.
```

You can optionally pass in a different name for the environment file:

```console
foo@bar:~$ eclipse print .env.test
$ Environment file printed to working directory.
```
