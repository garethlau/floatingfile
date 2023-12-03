#! /bin/bash 
echo "HELLO FROM START"
yarn --cwd apps/server migrate-deploy
yarn --cwd apps/server start