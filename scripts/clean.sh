#! /bin/bash

remove_dir () {
    echo "removing $1 dirs"   
    find . -name "$1" -type d -prune -exec rm -rf '{}' +
}

echo ">>> removing node_modules"
remove_dir "node_modules"

echo ">>> removing build, out, and dist dirs"
remove_dir "build"
remove_dir "out"
remove_dir "dist"

echo ">>> installing dependencies"
yarn install