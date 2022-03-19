FROM node:17 AS builder

COPY package.json package-lock.json tsconfig.json tslint.json /root/
COPY src/ /root/src/
COPY test/ /root/test/

RUN cd /root && \
    npm install && \
    npm run build && \
    npm run lint && \
    npm run test


FROM node:17

COPY --from=builder /root/dist/ /app/
COPY package.json package-lock.json /app/
RUN cd /app && \
    npm install --production

EXPOSE 8080

WORKDIR /app/
CMD ["node", "app.js"]
