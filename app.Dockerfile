# syntax=docker/dockerfile:1

ARG NODE_VERSION=14.19.1

FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app

# Copy
COPY . .

# Install
RUN yarn install

# Build
RUN yarn --cwd packages/ui build
RUN yarn --cwd packages/types build

RUN yarn --cwd apps/client build

RUN yarn --cwd apps/server build
RUN yarn --cwd apps/server generate

RUN npx browserslist@latest --update-db

# Use production node environment by default.
ENV NODE_ENV prod

COPY start.sh .
RUN chmod +x start.sh

# Run the application as a non-root user.
USER node

# Expose the port that the application listens on.
EXPOSE 5000

# Run the application.
CMD ["sh", "start.sh"]