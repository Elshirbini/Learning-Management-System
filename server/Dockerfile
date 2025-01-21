FROM node:bookworm-slim

WORKDIR /app

COPY package*.json ./

# clean install this will cope all deps with the exact version
RUN npm install

COPY . .

CMD [ "npm" , "run" , "dev" ]