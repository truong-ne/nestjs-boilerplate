# Project specified requirements/conventions

Both new and current team members working on this project should apply the following suggestions as much as possible

> Code style consistency is no trivial to maintain and improve code base quality

## I. Awareness of project-wide changes

> All members must be made aware of any changes made or newly added

- Packages
  1. Prefer `yarn`
  2. To see if it is necessary, may there be better approach/work around for such issue

## II. Files/Directories

### a. Module

- Structure of module in a folder (! = mandatory , ? = optional, ?! = mandatory if have many file)

  ```ts
    a-mod
    |
    |__!index.ts // to export everything
    |            // module, constants, dto, services, controllers...
    |__!a-mod.module.ts
    |
    |__?!services
    |  |
    |  |__?one.service.ts
    |  |
    |  |__?two.service.ts
    |
    |__?!controllers
    |  |
    |  |__?alpha.controller.ts
    |  |
    |  |__?beta.controller.ts
    |
    |__?a-mod.interfaces.ts
    |
    |__?!dto
    |  |
    |  |__?hex.dto.ts
    |  |
    |  |__?bin.dto.ts
    |
    |__?a-mod.enum.ts
    |
    |__?a-mod.constants.ts
    |__...

  ```

### b. Structure

- Structure of folder (! = mandatory , ? = optional, ?! = mandatory if have many file)

  ```ts
    apps // Service Folder
    |
    |__gateway // Module Gateway
    |
    |__serviceB // Module Service A
    |
    |__serviceC // Module Service B
    |
    libs
    |
    |__common // Folder for common usage
    |  |
    |  |__constants
    |  |  |
    |  |  |__!database.constant.ts // Database config constants
    |  |
    |  |__enums
    |  |  |
    |  |  |__!database-config.enum.ts // Database config enums
    |  |
    |  |__interfaces
    |  |
    |  |__types
    |  |
    |  |__index.ts // Export everything in folder
    |
    |__config // Folder config/env
    |  |
    |  |__envs // Folder env
    |  |
    |  |__configuration.ts // Export config from env
    |  |
    |  |__index.ts // Export everything in folder
    |
    |__core // Folder integrate, service communication
    |  |
    |  |__database
    |     |
    |     |__postgres // SQL database
    |     |  |
    |     |  |__serviceA // service folder
    |     |     |
    |     |     |__entities //entities folder
    |     |     |
    |     |     |__migrations // migrations folder
    |     |     |
    |     |     |__index.ts // export everything from folder
    |     |     |
    |     |     |__ormconfig.ts // Config file to specific DataSource for migrating database
    |     |
    |     |__mongo // NoSQL database
    |
    |  |__message-handler
    |  |
    |  |__index.ts // Export everything in folder
    |
    |__utils // Folder utilities, common module/middleware usage
    |  |
    |  |__helpers
    |  |
    |  |__middlewares
    |  |
    |  |__modules
    |  |
    |  |__index.ts // Export everything in folder
  ```

## III. Code style conventions

- Prefer:
  - variable: Camel Case
  - class: Pascal Case

### a. Naming

<details>
<summary>
  Constants
</summary>

```ts
// ⛔️ AVOID
const constants = {
  constantA: {
    constantA1: 'a1',
    constantsA2: 'a2',
  },
  constantB: 'b',
};

// ⛔️ AVOID
const constants = {
  constantA: {
    CONSTANT_A1: 'a1',
    CONSTANT_A1: 'a2',
  },
  CONSTANT_B: 'b',
};

// ✅ PREFERRED
const CONSTANTS = {
  CONSTANT_A: {
    CONSTANT_A1: 'a1',
    CONSTANT_A2: 'a2',
  },
  CONSTANT_B: 'b',
};
```

</details>

<details>
<summary>
  Enums
</summary>

```ts
// ⛔️ AVOID
const USER_RESPONSE = {
  No = 0,
  Yes = 1,
};

// ⛔️ AVOID
enum user_response {
  No = 0,
  Yes = 1,
}

// ⛔️ AVOID
enum user_response {
  No = 'No',
  Yes = 'Yes,
}

// ✅ PREFERRED
enum UserResponse {
  No = 0,
  Yes = 1,
}

// ✅ PREFERRED
enum UserResponse {
  No = 'NO',
  Yes = 'YES',
}
```

</details>

<details>
<summary>
  Interface
</summary>

```ts
// ⛔️ AVOID
interface InterfaceData {
  fieldA: string;
  fieldB: number;
}

// ✅ PREFERRED
interface IData {
  fieldA: string;
  fieldB: number;
}
```

</details>

<details>
<summary>
  DTO
</summary>

```ts
// ⛔️ AVOID
class DataValidate {
  fieldA: string;
  fieldB: number;
}

// ✅ PREFERRED
class DataDto implements IData {
  fieldA: string;
  fieldB: number;
}
```

</details>

<details>
<summary>
  Function
</summary>

```ts
// ⛔️ AVOID
function DataValidate {
  // do something
}

// ✅ PREFERRED
// Start with action name
function validateData {
  // do something
}
```

</details>

<details>
<summary>
  Message Pattern
</summary>

```ts
// ⛔️ AVOID
const cmd = 'get.user';

// ⛔️ AVOID
const cmd = 'get-user';

// ✅ PREFERRED
const cmd = 'user.<method name>';
```

</details>

### b. Spacing

```json
{
  "editor.tabSize": 2
}
```

### c. Type/Interface

- Prefer use interface
- Avoid using any type, use unknown instead

### d. Error handler

- Throw error at sub function which used in main function

```ts
function funcA<T>(arguments:unknown): T {
  try {
   // do something
  } catch (error) {
    throw new HttpException(
      error?.message || null,
      error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
```

- Return error object at main function

```ts
function funcA<T>(arguments:unknown): T {
  try {
   // do something
  } catch (error) {
    const errorObject = new GatewayError(error);
    return errorObject.getErrorInstance();
  }
}
```

## IV. CommitLint Rules

<details>
<summary>
  CommitLint Usage Guidelines
</summary>

- We use CommitLint to adhere to the commit message convention.
- A valid commit message must start with a commit type (e.g., `feat: [task-jira]`, `fix: [task-jira]`) followed by a colon and a space.
- Example: `feat: [AD-165] Add new feature`.
- We use common types like `feat`, `fix`, `docs`, `chore`, etc.
- Please refer to the CommitLint documentation for more details on the rules and how to configure them.

Documentation Link: [CommitLint Documentation](https://commitLint.js.org/#/)
</details>



```
In the context of Git commits, these terms are often used as part of commit messages to provide a concise description of the changes made in a commit.
Using a consistent structure for commit messages helps improve code collaboration and makes it easier to understand the purpose of each commit.
The commonly used prefixes in commit messages are as follows

feat: Short for "feature," this prefix is used when introducing a new feature or functionality to the codebase.
    For example:
        feat: Add user authentication feature

chore: This prefix is used for commits related to maintenance tasks, build processes, or other non-user-facing changes.
It typically includes tasks that don't directly impact the functionality but are necessary for the project's development and maintenance.
    For example:
        chore: Update dependencies
        chore: Refactor build script

fix: Used when addressing a bug or issue in the codebase. This prefix indicates that the commit contains a fix for a problem.
    For example:
        fix: Correct calculation in revenue calculation

docs: Used when making changes to documentation, including comments in the code, README files, or any other documentation associated with the project.
    For example:
        docs: Update API documentation

style: This prefix is used for code style changes, such as formatting, indentation, and whitespace adjustments.
It's important to separate style changes from functional changes for better clarity.
    For example:
        style: Format code according to style guide

refactor: Used when making changes to the codebase that do not introduce new features or fix issues but involve restructuring or optimizing existing code.
    For example:
        refactor: Reorganize folder structure

test: Used when adding or modifying tests for the codebase, including unit tests, integration tests, and other forms of testing.
    For example:
        test: Add unit tests for user authentication

perf: Short for "performance," this prefix is used when making changes aimed at improving the performance of the codebase.
    For example:
        perf: Optimize database queries for faster response times
```

## V. Pull Requests Rules
### a. Creating Pull Requests Guidelines

- Follow format:

```md
**Task card**

**Description**
[Provide a brief description of the changes introduced by this pull request.]

**Related Issue**
[If your changes are related to a specific issue, mention it here with a link.]

**Type of Change**
Please mark the appropriate option:

- [ ] Bug fix (non-breaking change that solves an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Migrations
- [ ] Other (please describe):

**Checklist**
Please mark the appropriate options:

- [x] I have performed a self-review of my own code.
- [x] I have made corresponding changes to the documentation (if applicable).
- [x] My changes generate no new warnings or errors.
- [x] I have tested my changes and they pass all relevant tests.
- [x] I have checked the formatting and code style of my changes.
- [x] I have added necessary comments to the code for better understanding (if applicable).

**Changes Made**
List down the key changes made in this pull request:

- Change 1
- Change 2

**How to Test**
Provide clear instructions on how to test the changes made in this pull request. Include any necessary setup, configuration, or sample data.

**Screenshots (if applicable)**
If there are any UI changes, attach relevant screenshots or GIFs here to visually demonstrate the changes.

**Additional Notes (if any)**
If there are any additional notes or comments that you would like to add, mention them here.

```

### b. Migrations ( Prerequisites )

- If there are new migrations, rebase latest commit ( migrations )

- Run latest migration
  - Command
```bash
$ yarn run migration:run -- -d <path to file database ormconfig.ts>
```

- Generate new migration
  - Command
```bash
$ yarn run migration:generate libs/core/databases/<database>/migrations/<name> -d libs/core/databases/<database>/ormconfig.ts
```

- Run again migration which have just created
  - Command
```bash
$ yarn run migration:run -- -d <path to file database ormconfig.ts>
```

## VI. Setup

### a. Setup environment

- Create file `.env` as `.env.example`

**Note: Jwt expired must set by day value**

### b. Installation

- Ref:

```json
"engines": {
    "node": ">= ~16",
    "yarn": ">= 1",
  },
```

- Command:

```bash
$ yarn install
```

### c. Running the app

- Init database if not exists
  - Run docker-compose file to init database and dependencies

- Run migrations for init database table
  - Command
```bash
$ yarn run migration:run -- -d <path to file database ormconfig.ts>
```

- Run command generate migration if needed
```bash
$ yarn run migration:generate libs/core/databases/<database>/migrations/<name> -d libs/core/databases/<database>/ormconfig.ts
```

- Revert migration ( pop the latest migration )
```bash
$ yarn run migration:revert -- -d <path to file database ormconfig.ts>
```


```bash
# development
$ yarn run start <?service name>

# watch mode
$ yarn run start:dev <?service name>

# production mode
$ yarn run start:prod <?service name>
```

## VII. Prerequisites

### a. Add service

- Prefer: Use nestjs-cli command `nest generate app <app name>`

- Config services in file [nestjs-cli.json](./nest-cli.json)

- Config AMQP and GRPC in [env folder](./libs/config/envs/)

- Add service name to ServiceName enum

### b. Add database

- Create folder `<database name>` in folder [Database](./libs/core/./databases/)

- Follow database structure which mention above [Structure](#b-structure)

- Add database config to env [Env folder](./libs/config/envs/)

- Add database config to database enums [Enums folder](./libs/common/enums/database-config.enum.ts)

```ts
export enum DbConfig {
  // Route to get config with ConfigService
  // Ref: https://docs.nestjs.com/techniques/configuration#configuration
  Postgres = 'db.postgres',
}

export enum DbName {
  // Database name
  // Prefer exactly the same as database type
  Postgres = 'postgres',
}
```

- Add database config to database constants [Constants folder](./libs/common/constants/database.constant.ts)

```ts
export const dbConfig: Partial<Record<DbName, DbConfig>> = {
  // Combine database config from env and enums for usage
  [DbName.Postgres]: DbConfig.Postgres,
  [DbName.Mongo]: DbConfig.Mongo,
};
```

### c. Add gRPC

- Write proto file and put in [grpc folder](./libs/core/grpc)

- Add command gen in Makefile

- Run command ```make gen-all```


### d. Use rabbitMQ

- For internal direct exchange in Nest repository, use ServiceProviderBuilder to publish and MessagePattern to consume

- For topic exchange or Go repository, inject dependency AMQPService and use it to publish/consume message

```ts
this.amqpService.publish(
      ExchangeType.Topic,
      TopicExchange,
      LoginRoutingKey,
      { payload: 'login' },
    );
```

```ts
onModuleInit() {
    this.amqpService.consume(
      this.getList,
      ExchangeType.Topic,
      TopicExchange,
      QueueName.PostService,
      'login.get-post',
    );
  }
```

## VIII. Deployment Guide

- Build gateway image and service image

```bash
$ docker build . -t <image name> -f ./apps/<service name>/Dockerfile
```

- Create env file as sample.env in service structure

- Modify path to env on each service which defined in docker-compose file

```yml
version: '3.8'
services:
  <service name>:
      container_name: <service name>
      restart: always
      image: <image-service>
      ...
      env_file: <path to service's env>
...
```

- Run compose

```bash
$ docker-compose -f <path to docker-compose file> up -d
```

- Stop compose

```bash
$ docker-compose -f <path to docker-compose file> down
```


## IX. Configurations

- Todo

## X. Testing

- Todo
