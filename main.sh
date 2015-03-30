#!/usr/bin/env bash

ACCESS_TOKEN=$1
REPO=$2
BRANCH=$3
NEW_BRANCH=$4
SCREENSHOT_IDS=$5
SSH_KEY=$6

REPO_ARRAY=(${REPO//\// })

# Create an SSH key.
touch ~/.ssh/id_rsa
node get_ssh > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa

# Clone repo
cd /home
mkdir clone

git config --global user.email "robot@example.com"
git config --global user.name "Robot"

cd clone
hub clone -p --branch=$BRANCH --depth=1 --quiet $REPO .
git checkout -b $NEW_BRANCH

# Download images
node ../download_images.js $ACCESS_TOKEN $SCREENSHOT_IDS

# Push new branch
git add --all
git commit -am "New files"
git push --set-upstream origin $NEW_BRANCH

# Open Pull request
hub pull-request -m "Update baseline from branch $BRANCH" -b $REPO_ARRAY[0]:$BRANCH -h $REPO_ARRAY[0]:$NEW_BRANCH
