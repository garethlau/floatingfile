#! /bin/bash
die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "1 argument required, $# provided"
environment=$1 # environment should be "staging" or "master"

echo ">>> deploying floatingfile"
echo ">>> environment: $environment"

git pull "https://github.com/garethlau/floatingfile.git" $environment

echo ">>> installing dependencies"
yarn install

echo ">>> increase memory for build"
export NODE_OPTIONS="--max-old-space-size=5120" # increase to 5gb

echo ">>> building packages"
yarn --cwd packages/ui build
yarn --cwd packages/types build

echo ">>> building landing site"
yarn --cwd apps/landing build

echo ">>> Done!"