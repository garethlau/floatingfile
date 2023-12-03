# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG NODE_VERSION=14.19.1

FROM node:${NODE_VERSION}-alpine

# ENV API_KEY=${API_KEY}
# ENV DB_PASSWORD=${DB_PASSWORD}
# ENV PORT=${PORT}
# ENV NODE_ENV=${NODE_ENV}
# ENV USE_LOCAL_DB=${USE_LOCAL_DB}
# ENV USE_LOCAL_S3=${USE_LOCAL_S3}
# ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
# ENV AWS_ACCESS_KEY_SECRET=${AWS_ACCESS_KEY_SECRET}
# ENV S3_BUCKET_NAME=${S3_BUCKET_NAME}
# ENV HONEYBADGER_API_KEY=9b15e7db=${HONEYBADGER_API_KEY}
# ENV ACCESS_TOKEN_SECRET=${ACCESS_TOKEN_SECRET}
# ENV REFRESH_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}
# ENV SENDGRID_API_KEY=${SENDGRID_API_KEY}
# ENV DATABASE_URL=${DATABASE_URL}
# ENV REDIS_URL=${REDIS_URL}

# ENV REACT_APP_VERSION=${REACT_APP_VERSION}
# ENV REACT_APP_ENVIRONMENT=${REACT_APP_ENVIRONMENT}
# ENV REACT_APP_USERNAME_STORAGE_KEY=${REACT_APP_USERNAME_STORAGE_KEY}
# ENV REACT_APP_ORIGIN=${REACT_APP_ORIGIN}
# ENV REACT_APP_LAST_VISIT_STORAGE_KEY=${REACT_APP_LAST_VISIT_STORAGE_KEY}
# ENV REACT_APP_HONEYBADGER_API_KEY=${REACT_APP_HONEYBADGER_API_KEY}

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
# RUN yarn --cwd apps/server migrate-deploy

# RUN yarn --cwd apps/landing build
# RUN yarn --cwd apps/landing export

# RUN npx browserslist@latest --update-db

# Use production node environment by default.
ENV NODE_ENV prod

# RUN yarn install --production --frozen-lockfile

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.yarn to speed up subsequent builds.
# Leverage a bind mounts to package.json and yarn.lock to avoid having to copy them into
# into this layer.
# RUN --mount=type=bind,source=package.json,target=package.json \
#     --mount=type=bind,source=yarn.lock,target=yarn.lock \
#     --mount=type=cache,target=/root/.yarn \
#     yarn install --production --frozen-lockfile


COPY start.sh .
RUN chmod +x start.sh

# Run the application as a non-root user.
USER node

# Copy the rest of the source files into the image.
# COPY . .

# Expose the port that the application listens on.
EXPOSE 5000

# Run the application.
CMD ["sh", "start.sh"]
# CMD ["node", "./apps/server/dist/index.js"]

