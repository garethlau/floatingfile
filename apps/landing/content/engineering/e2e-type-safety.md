---
title: End-to-end Type Safety
createdAt: Jan 15, 2022
updatedAt: Jan 15, 2022
---

The release of v3.4 achieves end-to-end type safety, a goal I've had for floatingfile since migrating the codebase to TypeScript in [Feburary of 2021](https://github.com/garethlau/floatingfile/commit/8baadaf9116b266fea59d126d22ba0431733ad17).

To achieve this, I switched the database from mongo to postgres. This was motivated by [Prisma's](https://www.prisma.io) first class TypeScript support. floatingfile has also become more mature and stable over time which reduced the appeal for a flexible document model.

To share method signatures, both the client and server list `@floatingfile/types` as a dependency that defines "contracts". These type contracts are what you expect, they define the functions that are implemented by the server that the client can consume. One headache that arose was accounting for the different ways the client can send data to the server which would make parsing the parameters very messy. Concretely, the client can send arguments as route parameters, query parameters, or included in the body (of a `POST` request).

For consistency, I chose to follow a remote procedure call pattern. Now, all requests (queries and mutations) are all `POST` requests to `/api/rpc` with a mandatory body containing an endpoint string and payload object. It's very similar to how a client would interact with a graphql server.

A helper method was added to the client that 1) exposes the possible endpoints and 2) wraps around `Axios`'s `post` method. This enables suggestions and type checking for each method.

As a concrete example, let's look at the `preupload` method:

```typescript
export type PreuploadFn = (params: {
  code: string;
  size: string;
}) => Promise<{ signedUrl: string; key: string } | null>;
```

The client can invoke this method:

```typescript
await rpc.invoke("preupload", {});
```

Supplying an empty object fails the type check:

```
Argument of type '{}' is not assignable to parameter of type '{ code: string; size: string; }'.
  Type '{}' is missing the following properties from type '{ code: string; size: string; }': code, size ts(2345)
```
