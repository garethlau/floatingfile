#! /bin/bash
die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "1 argument required, $# provided"

version=$1
zip_name=floatingfile-macos-x64-$version.tar.gz
echo ">>> creating macos $version"

echo ">>> packaging application"
yarn package

echo ">>> create tmp copy"
cp ./dist/cli-macos ./floatingfile

echo ">>> zipping"
tar -cvzf $zip_name ./floatingfile

echo ">>> sha256"
sha256sum ./$zip_name

echo ">>> removing tmp"
rm ./floatingfile