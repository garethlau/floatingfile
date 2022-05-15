#! /bin/bash
die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "1 argument required, $# provided"
branch=$1 

echo ">>> deploying floatingfile"
echo ">>> branch: $branch"

git pull "https://github.com/garethlau/floatingfile.git" $branch

echo ">>> installing dependencies"
yarn install

echo ">>> increase memory for build"
export NODE_OPTIONS="--max-old-space-size=5120" # increase to 5gb

echo ">>> building packages"
yarn --cwd packages/ui build
yarn --cwd packages/types build

echo ">>> building frontend"
if ["$branch" = "master"]:
then 
    yarn --cwd app/client build:master
else 
    yarn --cwd apps/client build:staging
fi

echo ">>> building backend"
yarn --cwd apps/server build

echo ">>> restarting application"
if [ "$branch" = "master" ];
then 
    pm2 restart FLOATINGFILE_PROD
else
    pm2 restart FLOATINGFILE_STAGING
fi