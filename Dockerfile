FROM ubuntu:14.04
MAINTAINER Gizra <info@gizra.com>

# Update and install packages
RUN apt-get update
RUN apt-get install -y curl git jq

RUN curl -sL https://deb.nodesource.com/setup | bash -
RUN apt-get install -y nodejs

# Install hub
RUN cd /usr/local/bin && curl -L https://github.com/github/hub/releases/download/v2.2.0/hub-linux-amd64-2.2.0.tar.gz | tar zx && cp hub-linux-amd64-2.2.0/hub .

# Create "shoov" user with crypted password "shoov"
RUN useradd -d /home/shoov -m -s /bin/bash shoov
RUN echo "shoov:shoov" | chpasswd

# Add "shoov" to "sudoers"
RUN echo "shoov ALL=(ALL:ALL) ALL" >> /etc/sudoers

# Add hub config and .netrc template
ADD _hub /home/shoov/.config/hub
ADD _netrc /home/shoov/.netrc

# Change working directory to home directory of shoov user
WORKDIR /home/shoov

# Enable ssh-agent
RUN eval `ssh-agent -s`

# Create known_hosts
RUN mkdir .ssh
RUN touch .ssh/known_hosts

# Add Github key
RUN ssh-keyscan -H github.com > .ssh/known_hosts

# Add scripts
RUN mkdir /temp-build
ADD package.json /temp-build/package.json
RUN cd /temp-build && npm install --verbose
RUN cp -R /temp-build/node_modules /home/shoov

ADD build_info.js /home/shoov/build_info.js
ADD get_hub.js /home/shoov/get_hub.js
ADD download_images.js /home/shoov/download_images.js
ADD main.sh /home/shoov/main.sh

# Fix permissions
RUN chown -R shoov:shoov /home/shoov

USER shoov

ENV HOME /home/shoov
ENV PATH $PATH:/home/shoov

CMD ["/home/shoov/main.sh"]
