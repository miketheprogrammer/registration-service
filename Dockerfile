FROM mhart/alpine-node:4
RUN apk add --update curl 
RUN apk add --update openssh
RUN apk add --update git
RUN rm -rf /var/cache/apk/*
RUN apk add --update bash
RUN npm install -g pm2
WORKDIR /opt/registration-service
ADD ./package.json ./package.json
ADD ./index.js ./index.js
ADD ./run.sh ./run.sh
RUN npm install
CMD pm2 start index.js -i 2 --name=registration-service && pm2 logs
