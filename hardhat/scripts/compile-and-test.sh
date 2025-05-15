#!/bin/bash

echo "Cleaning artifacts..."
npx hardhat clean

echo "Compiling contracts..."
npx hardhat compile

if [ $? -eq 0 ]; then
    echo "Compilation successful. Running tests..."
    npx hardhat test
else
    echo "Compilation failed. Exiting."
    exit 1
fi 