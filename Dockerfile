#+----------------------------------------------------------------------+
# STAGE 1: Build
FROM node:14.1-alpine AS builder

WORKDIR /opt/web
COPY package.json package-lock.json ./
RUN npm install

ENV PATH="./node_modules/.bin:$PATH"

COPY . ./
RUN ng build --prod

#+----------------------------------------------------------------------+
# STAGE 2: Run
FROM socialengine/nginx-spa:latest

# Uncomment alias from user "root" .bashrc file
RUN sed -i -r 's/^# (alias|export|eval)/\1/' "$HOME/.bashrc"

# Install additional packages
RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive \
  apt-get install -y --quiet --no-install-recommends \
  vim curl \
  && apt-get -y autoremove \
  && apt-get clean autoclean \
  && rm -fr /var/lib/apt/lists/{apt,dpkg,cache,log} /tmp/* /var/tmp/*

# Add /etc/vim/vimrc.local
RUN echo "runtime! defaults.vim" > /etc/vim/vimrc.local \
  && echo "let g:skip_defaults_vim = 1" >> /etc/vim/vimrc.local  \
  && echo "set mouse=" >> /etc/vim/vimrc.local

# Copy frontend files
COPY --from=builder /opt/web/dist/cbnaFront /app

RUN chmod -R 777 /app
