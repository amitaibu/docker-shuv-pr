FROM ubuntu:14.04
MAINTAINER Gizra

# Update and install packages
RUN apt-get update
RUN apt-get install -y curl zsh git vim

RUN curl -sL https://deb.nodesource.com/setup  | sudo bash -
RUN apt-get install -y nodejs

# Install jq
RUN cd /usr/local/bin && curl -O http://stedolan.github.io/jq/download/linux64/jq && chmod +x jq

# Install hub
RUN cd /usr/local/bin && curl -L https://github.com/github/hub/releases/download/v2.2.0/hub-linux-amd64-2.2.0.tar.gz | tar zx && cp hub-linux-amd64-2.2.0/hub .


# Add hub config and .netrc template
ADD _hub /root/.config/hub
ADD _netrc /root/.netrc

# Install oh-my-zsh
RUN git clone https://github.com/robbyrussell/oh-my-zsh.git /root/.oh-my-zsh/
ADD .zshrc /root/.zshrc

# Enable ssh-agent
RUN eval `ssh-agent -s`

RUN mkdir /root/.ssh

# Create known_hosts
RUN touch /root/.ssh/known_hosts

# Add Github key
# RUN ssh-keyscan -H github.com > /home/.ssh/known_hosts
RUN ssh-keyscan -H github.com > /etc/ssh/ssh_known_hosts

# Add scripts
RUN mkdir /temp-build
ADD package.json /temp-build/package.json
RUN cd /temp-build && npm install --verbose
RUN cp -R /temp-build/node_modules /home

ADD build_info.js /home/build_info.js
ADD get_hub.js /home/get_hub.js
ADD download_images.js /home/download_images.js

ADD main.sh /home/main.sh

CMD /home/main.sh
