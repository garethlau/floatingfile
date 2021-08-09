# floatingfile

![](/.github/assets/banner-white-1200x600.jpg)

[floatingfile](https://floatingfile.space) is a file sharing platform that marries the flexibility of file storage applications with the convenience of file transfer applications.

~~If you'd like to try out the latest features, try out [beta.floatingfile.space](https://beta.floatingfile.space). Spaces created using the beta application are compatible with the production application.~~

## Motivation

floatingfile was built to improve the process of moving files from university workstations to personal computers. A login-free and flexible solution was needed. For more info, see [here](https://floatingfile.space/faq?active=5).

## Repository Structure

This respository is a monorepo containing packages that are responsible for the web client application, server, and landing page.

**Please note that the iOS application codebase is not included in this monorepo.**

| Package       | Description    | Technologies |
| ------------- |-------------| --- |
| [client](/packages/client/)      | Frontend for the floatingfile application. Boostrapped with Create React App.   | react, chakra-ui  |
| [common](/packages/common) | Shared code (interfaces, enums, components, constants). | |
| [landing](/packages/landing) | floatingfile marketing/landing site.  |  nextjs, react, chakra-ui |
| [server](/packages/server) | Backend for the floatingfile application.  |  express, mongoose, aws-sdk   |



## Maintainers

- [Gareth Lau](http://garethlau.me/) maintains floatingfile's servers, APIs, and web applications
- [Alan Yan](https://alanyan.ca) maintains the floatingfile iOS application
