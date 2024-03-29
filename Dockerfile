FROM ubuntu:16.04
MAINTAINER Goran Jovanov <goran.jovanov@gmail.com>

# Environment variables
ENV NVM_DIR /usr/local/.nvm
ENV NODE_VERSION 7.7.3
ENV NODE_ENV dev
VOLUME /cert


# Add files
ADD scripts/ /scripts/
ADD repo-key /

# Prepare the system
RUN /scripts/install.met.sh

EXPOSE 444

# Define the run command
CMD /scripts/run.sh
