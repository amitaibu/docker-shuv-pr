#!/usr/bin/env bash

BUILD_ID=$1
SCREENSHOT_IDS=$2
NEW_BRANCH=$3
ACCESS_TOKEN=$4

BUILD_INFO=$(node /home/build_info.js $BUILD_ID $ACCESS_TOKEN)

OWNER=$(echo $BUILD_INFO | jq '.owner')
REPO=$(echo $BUILD_INFO | jq '.repo')
BRANCH=$(echo $BUILD_INFO | jq '.branch')

# Create an SSH key.
touch ~/.ssh/id_rsa
node /home/get_ssh.js $BUILD_ID $ACCESS_TOKEN > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa

# Clone repo
cd /home
mkdir clone

git config --global user.email "robot@example.com"
git config --global user.name "Robot"
node /home/get_hub.js $ACCESS_TOKEN > ~/.config/hub

cd clone
hub clone -p --branch=$BRANCH --depth=1 --quiet $OWNER/$REPO .
git checkout -b $NEW_BRANCH

# Download images
node /home/download_images.js $SCREENSHOT_IDS $ACCESS_TOKEN

# Push new branch
git add --all
git commit -am "New files"
git push --set-upstream origin $NEW_BRANCH

# Open Pull request
hub pull-request -m "Update baseline from branch $BRANCH" -b $OWNER:$BRANCH -h $OWNER:$NEW_BRANCH
