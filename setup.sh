#!/bin/bash
set -e

echo "Starting setup..."
mkdir -p ~/projects/lof-titan
cp -r /mnt/c/Users/TRG-LOF-112-106/Desktop/Lof\ titan\ Firmware/. ~/projects/lof-titan/

if [ -d ~/projects/lof-titan/firmware/micropython ]; then
    mv ~/projects/lof-titan/firmware/micropython ~/projects/lof-titan/firmware/micropython_old_windows_build
fi

echo "Done copying."
