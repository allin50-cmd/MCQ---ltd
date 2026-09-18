FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY src ./src
COPY public ./public
EXPOSE 3000
ENV PORT=3000
CMD ["node","src/server.js"]
