#!/usr/bin/env bash

BUILD_ID=$1
SCREENSHOT_IDS=$2
NEW_BRANCH=$3
ACCESS_TOKEN=$4

BUILD_INFO=$(node /home/build_info.js $BUILD_ID $ACCESS_TOKEN)

# Get the values from the JSON and trim the qoute (") signs.
OWNER=$(echo $BUILD_INFO | jq '.owner' | cut -d '"' -f 2)
REPO=$(echo $BUILD_INFO | jq '.repo' | cut -d '"' -f 2)
BRANCH=$(echo $BUILD_INFO | jq '.branch' | cut -d '"' -f 2)

# Clone repo
cd /home
mkdir clone

git config --global user.email "robot@example.com"
git config --global user.name "Robot"


# Setup hub
node /home/get_hub.js $ACCESS_TOKEN

# Clone repo
cd clone
git config --global hub.protocol https
hub clone --branch=$BRANCH --depth=1 --quiet $OWNER/$REPO .
git checkout -b $NEW_BRANCH

# Download images
node /home/download_images.js $SCREENSHOT_IDS $ACCESS_TOKEN

# Push new branch
git add --all
git commit -am "New files"
hub push --set-upstream origin $NEW_BRANCH

# Open Pull request
PR=$(hub pull-request -m "Update baseline from branch $BRANCH" -b $OWNER:$BRANCH -h $OWNER:$NEW_BRANCH)

# Send back the pull request info to the build
curl -X PATCH $BACKEND_URL/api/builds/$BUILD_ID?access_token=$ACCESS_TOKEN -d "pull_request=$PR"
