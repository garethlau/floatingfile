#! /bin/bash 
PATH="/root/.nvm/versions/node/v14.19.1/bin:$PATH"

yarn --cwd ./apps/server start & PIDSERVER=$!
yarn --cwd ./apps/landing start & PIDLANDING=$!

wait $PIDSERVER
wait $PIDLANDING