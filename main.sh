#!/usr/bin/env bash

TOKEN=$1
REPO=$2
BRANCH=$3
NEW_BRANCH=$4
JSON=$5
SSH_KEY=$6

# Create an SSH key.
touch ~/.ssh/id_rsa
echo $SSH_KEY | base64 --decode > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa

# Clone repo
cd /home
mkdir clone

git config --global user.email "you@example.com"
git config --global user.name "Your Name"

cd clone
git clone --branch=$BRANCH --depth=1 --quiet $REPO .
git checkout -b $NEW_BRANCH

# Download images
node ../download_images.js $TOKEN $JSON

# Push new branch
git add --all
git commit -am "New files"
git push --set-upstream origin $NEW_BRANCH

# Open Pull request
hub pull-request -m "Update baseline from branch $BRANCH" -b amitaibu:$BRANCH -h amitaibu:$NEW_BRANCH
