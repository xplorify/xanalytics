#!/bin/bash



[[ -s $NVM_DIR/nvm.sh ]] && . $NVM_DIR/nvm.sh
nvm use 7.7.3
nvm alias default 7.7.3
node -v
echo "Starting server in $NODE_ENV environment"
node /xplorify-analytics/server/server.js
