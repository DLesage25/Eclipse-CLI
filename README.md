# EclipseJS CLI

![build workflow](https://github.com/DLesage25/Eclipse-CLI/actions/workflows/build-and-lint.yml/badge.svg)
![bundle_size](https://img.shields.io/bundlephobia/min/@eclipsejs/cli)
![coverage](./badges/coverage.svg)
![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/dlesage25/eclipse-cli)
[![CodeFactor](https://www.codefactor.io/repository/github/dlesage25/eclipse-cli/badge)](https://www.codefactor.io/repository/github/dlesage25/eclipse-cli)

Eclipse is an environment manager that injects sensitive configuration values into your code's execution context, removing the need for local environment files.

## Getting started

First, log in to [Eclipse](https://eclipsejs.io) and set up a project and secrets. You can classify secrets based on their environment (local, staging, prod), or their context (web, api, db).

### Installation

You can install Eclipse using NPM or Yarn

```
// Use npm
npm i -g @eclipsejs/cli
// Or yarn
yarn add global @eclipsejs/cli
```

### Initialize and log in

Run `eclipse` in your terminal. The first time the CLI is ran, it will download configuration values from the Eclipse servers and attempt to log you in.

```console
foo@bar:~$ eclipse
$ Welcome to EclipseJS! Initializing configuration...
$ Eclipse has been configured successfully. 🚀 Attempting to log you in...
```

### Log in

```console
foo@bar:~$ eclipse login
$ A new tab will open in your default browser. Please log in and come back to your terminal after.
```

## Usage

You can access Eclipse's menu by running `eclipse` in your terminal. There are also simple shortcuts that you can use to interact with the CLI.

### Config files

Eclipse config files (`.eclipserc`) tell Eclipse which project your repository belongs to. You can have Eclipse create a config file using the CLI menu, by selecting a project and then the `Initialize a config file` option.

Eclipse will create a config file in the current working directory with the identifier of the project you selected.

Once the config file is created, you will be able to use the CLI to inject environment variables into your code's execution context.

### Environment injection

Eclipse can inject environment variables into any execution context. Use the following syntax:

```console
$ eclipse inject/i <classifiers> <command>
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
foo@bar:~$ eclipse i web,staging npm start
```

### List project secrets

You can list project secrets and their values on your console using the CLI menu. If you are on a directory with a config file, you can also run:

```console
$ eclipse list/ls <optional - classifiers>
```

Listing all project secrets:

```console
foo@bar:~$ eclipse ls
MY_SECRET=some_value
MY_OTHER_SECRET=some_other_value
```

Listing project secrets that contain only the given classifiers:

```console
foo@bar:~$ eclipse ls web,staging
MY_WEB_STAGING_SECRET=some_value
MY_OTHER_WEB_STAGING_SECRET=some_other_value
```

### Managing secrets

You can add or remove secrets on the [Eclipse webapp](https://eclipsejs.io) or from the CLI menu. If you are on a directory with a config file, you can also use the following shortcuts:

#### Creating a secret

```console
$ eclipse add/a <secretname> <secretvalue> <classifiers>
```

For example, creating a secret with a single classifier:

```console
foo@bar:~$ eclipse add MY_TEST_SECRET MY_TEST_VALUE web
$ Secret MY_TEST_SECRET has been created under project MERN project.
```

#### Creating a secret with multiple classifiers:

```console
foo@bar:~$ eclipse a MY_TEST_SECRET MY_TEST_VALUE web,staging
$ Secret MY_TEST_SECRET has been created under project MERN project.
```

#### Removing a secret:

```console
$ eclipse remove/rm <secretname> <optional - classifiers>
```

You can optionally pass classifiers when removing a secret. Do this if you have multiple versions of the same secret (e.g. for production and staging).

For example:

```console
foo@bar:~$ eclipse rm MY_TEST_SECRET staging
? Are you sure? This cannot be undone. (Use arrow keys)
❯ Confirm
  Cancel
$ Secret MY_TEST_SECRET deleted.
```

### Printing to env file

You can optionally print project secrets to a `.env` file if you do not wish to use Eclipse's environment injection feature. You can do this through the CLI menu.
