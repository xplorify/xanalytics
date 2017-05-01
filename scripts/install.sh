#!/bin/bash


apt-get update
apt-get install build-essential libssl-dev curl git -y

git clone https://github.com/creationix/nvm.git $NVM_DIR
cd $NVM_DIR
#git checkout `git describe --abbrev=0 --tags`

source $NVM_DIR/nvm.sh
nvm install $NODE_VERSION
nvm alias default $NODE_VERSION
nvm use default

echo "source ${NVM_DIR}/nvm.sh" > $HOME/.bashrc
source $HOME/.bashrc


export NODE_PATH=$NVM_DIR/v$NODE_VERSION/lib/node_modules
export PATH=$NVM_DIR/v$NODE_VERSION/bin:$PATH


chmod 600 /repo-key
echo "IdentityFile /repo-key" >> /etc/ssh/ssh_config
echo "StrictHostKeyChecking no" >> /etc/ssh/ssh_config


cd /
git clone git@github.com:xplorify/xplorify-analytics.git
cp /cert/certificate.pfx /xplorify-analytics/server/cert/
cp /cert/.woogeen.keystore /xplorify-analytics/server/cert/
cd xplorify-analytics/server 
npm i
