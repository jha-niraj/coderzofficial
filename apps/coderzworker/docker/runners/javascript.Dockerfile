FROM node:20-alpine
WORKDIR /code
RUN apk add --no-cache dumb-init
ENTRYPOINT ["dumb-init", "--"]
