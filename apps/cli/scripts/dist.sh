#! /bin/bash
die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "1 argument required, $# provided"

version=$1
zip_name_macos=releases/floatingfile-macos-x64-$version.tar.gz
zip_name_win=releases/floatingfile-win-x64-$version.zip
zip_name_linux=releases/floatingfile-linux-x64-$version.tar.gz

echo ">>> creating $version"

echo ">>> building application"
yarn build

echo ">>> packaging application"
yarn package

echo ">>> creating macos distribution zip"
cp ./dist/cli-macos ./floatingfile
tar -cvzf $zip_name_macos ./floatingfile
rm ./floatingfile
sha256sum ./$zip_name_macos

echo ">>> creating windows distribution zip"
cp ./dist/cli-win.exe ./floatingfile.exe
zip -rq $zip_name_win ./floatingfile.exe
rm ./floatingfile.exe

echo ">>> creating linux distribution"
cp ./dist/cli-linux ./floatingfile
tar -cvzf $zip_name_linux ./floatingfile
rm ./floatingfile
