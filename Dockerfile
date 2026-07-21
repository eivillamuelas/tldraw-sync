FROM node:22-slim

# better-sqlite3 compila un addon nativo, necesita build tools
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src

EXPOSE 5858

CMD ["node", "src/server.js"]
