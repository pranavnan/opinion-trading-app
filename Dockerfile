FROM node:alpine3.18

WORKDIR /app 

COPY package.json .

# RUN npm install
RUN npm install

COPY . .

CMD ["npm", "start"]
