FROM node:22-slim

# better-sqlite3 se compila de forma nativa: necesita python y build-essential.
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install

COPY server.js ./

# El estado (SQLite) vive aquí; en compose lo montamos como volumen persistente.
ENV DATA_DIR=/data
ENV PORT=5858
EXPOSE 5858

CMD ["node", "server.js"]
