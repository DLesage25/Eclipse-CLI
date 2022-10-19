# EclipseJS CLI

![build workflow](https://github.com/DLesage25/Eclipse-CLI/actions/workflows/build-and-lint.yml/badge.svg)
![bundle_size](https://img.shields.io/bundlephobia/min/@eclipsejs/cli)

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

You can access Eclipse's menu by running `eclipse` in your terminal. There are also simple shortcuts that you can use to interact with the CLI.

##### Initialize a config file

Eclipse config files (`.eclipserc`) tell Eclipse which project your repository belongs to. You can initialize a config file via the menu, selecting the `Initialize a config file` option.

Eclipse will create a config file in the current working directory with the identifier of the project you selected.

Once the config file is created, you will be able to use the CLI to inject environment variables into your code's execution context.

##### Inject environment variables

Eclipse can inject environment variables into any execution context. Use the following syntax:

```console
eclipse inject <classifiers> <command>
```

-   `<classifier>` can be `all` or a comma-separated list of secret classifiers that you wish to inject (e.g. `web,staging`)
-   `<command>` is the command you use to run your code (e.g. `npm start/build/test/deploy`)

You can try this out by injecting secrets unto a Node REPL and logging your `process.env`:

```console
foo@bar:~$ eclipse inject all node
> console.log(process.env)
SOME_SECRET=some_value
SOME_OTHER_SECRET=some_other_value
```

You can also filter the injected secrets by passing in one or more comma-separated classifiers:

```console
foo@bar:~$ eclipse inject web,staging node
> console.log(process.env)
STAGING_SECRET=staging_value
OTHER_STAGING_SECRET=other_staging_value
```

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

You can optionally print project secrets to a `.env` file if you do not wish to use Eclipse's environment injection feature. You can do this through the CLI menu.

If you are on a directory with a config file, you can also run:

```console
foo@bar:~$ eclipse print .env
$ Environment file printed to working directory.
```

You can optionally pass in a different name for the environment file:

```console
foo@bar:~$ eclipse print .env.test
$ Environment file printed to working directory.
```
