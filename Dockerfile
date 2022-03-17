FROM node:17 AS builder

COPY package.json package-lock.json tsconfig.json tslint.json /root/
COPY src/ /root/src/

RUN cd /root && \
    npm install && \
    npm run build && \
    npm run lint


FROM node:17

COPY --from=builder /root/dist/ /app/
COPY package.json package-lock.json /app/
RUN cd /app && \
    npm install --production

EXPOSE 8080

WORKDIR /app/
CMD ["node", "app.js"]
