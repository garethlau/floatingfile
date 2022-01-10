# floatingfile

![](/.github/assets/banner-white-1200x600.jpg)

[floatingfile](https://floatingfile.space) is a file sharing platform that marries the flexibility of file storage applications with the convenience of file transfer applications.

~~If you'd like to try out the latest features, try out [beta.floatingfile.space](https://beta.floatingfile.space). Spaces created using the beta application are compatible with the production application.~~

## Motivation

floatingfile was built to improve the process of moving files from university workstations to personal computers. A login-free and flexible solution was needed. For more info, see [here](https://floatingfile.space/faq?active=5).

## Repository Structure

This respository is a monorepo containing packages that are responsible for the web client application, server, and landing page.

**Please note that the iOS application codebase is not included in this monorepo.**

| Package                  | Description                                                                   | Technologies               |
| ------------------------ | ----------------------------------------------------------------------------- | -------------------------- |
| [client](/apps/client/)  | Frontend for the floatingfile application. Boostrapped with Create React App. | react, chakra-ui           |
| [ui](/packages/ui)       | Shared UI components and themes.                                              |                            |
| [landing](/apps/landing) | floatingfile marketing/landing site.                                          | nextjs, react, chakra-ui   |
| [server](/apps/server)   | Backend for the floatingfile application.                                     | express, mongoose, aws-sdk |
| [types](/packages/types) | Type defenitions.                                                             |                            |

![](/docs/floatingfile-endpoint-access.svg)

## Development

Prequisites:

- Yarn
- Docker

1. Clone the repository

```
$ git clone https://github.com/garethlau/floatingfile.git
$ cd floatingfile
```

2. Install dependencies

```
$ yarn install
```

3. Create `/apps/server/.env` file

```ini
PORT=5000
NODE_ENV=development
USE_LOCAL_DB=Yes
USE_LOCAL_S3=Yes
S3_BUCKET_NAME=floatingfile-dev
```

See [.env.example](/apps/server/.env.example) for more configuration values.

4. Start the mongodb instance and the minio instance

```
$ yarn start:storage
```

5. Start the application (in another terminal)

```
$ yarn dev
```

## Maintainers

- [Gareth Lau](http://garethlau.me/) maintains floatingfile's servers, APIs, and web applications
- [Alan Yan](https://alanyan.ca) maintains the floatingfile iOS application
