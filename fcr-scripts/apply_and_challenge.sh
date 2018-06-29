#!/bin/bash

export LISTING=$1
fcr apply $LISTING 1025 --from=1
fcr challenge $LISTING --from=2

if [ $2 = "fail" ]; then
  fcr buy $LISTING LONG_ACCEPTED 5 --from=3
else
  fcr buy $LISTING SHORT_ACCEPTED 5 --from=3
fi

evm increaseTime 3600
fcr close $LISTING

echo "Applied, challenged, and closed $LISTING"
