#! /bin/bash
die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "1 argument required, $# provided"
environment=$1 # environment should be "staging" or "prod"

echo ">>> deploying floatingfile"
echo ">>> environment: $environment"

git pull "https://github.com/garethlau/floatingfile.git" $environment

echo ">>> installing dependencies"
yarn install

echo ">>> increase memory for build"
export NODE_OPTIONS="--max-old-space-size=5120" # increase to 5gb

echo ">>> building frontend"
yarn build-client:$environment

echo ">>> building backend"
yarn build-server:$environment

echo ">>> restarting application"
if [ "$username" = "staging" ];
then 
    pm2 restart FLOATINGFILE_STAGING
else
    pm2 restart FLOATINGFILE_PROD
fi