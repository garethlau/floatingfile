#! /bin/bash
TIMEFORMAT='Build Completed in %R seconds.'
time {
echo ">>> Building floatingfile"

echo ">>> Installing dependencies"
yarn install

echo ">>> Increase memory for build"
export NODE_OPTIONS="--max-old-space-size=5120" # increase to 5gb

echo ">>> Building packages (1/4)"
yarn --cwd packages/ui build
yarn --cwd packages/types build

echo ">>> Building frontend (2/4)"
yarn --cwd apps/client build

echo ">>> Building backend (3/4)"
yarn --cwd apps/server build

echo ">>> Building landing site (4/4)"
yarn --cwd apps/landing build
yarn --cwd apps/landing export
}