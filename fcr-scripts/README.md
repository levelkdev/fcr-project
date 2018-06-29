# fcr-scripts

Some scripts for running `fcr` commands.

To use, build the `fcr-cli` and `evm-util` projects, and add `fcr` and `evm` binaries to your system path.

## apply_and_challenge.sh

1. applies a new listing
2. challenges the listing
3. mocks trades to make the challenge pass or fail
4. closes the challenge

usage:
```
# sh apply_and_challenge <listingName> <pass[default]|fail>

# example:
sh apply_and_challenge Test55 fail
```
