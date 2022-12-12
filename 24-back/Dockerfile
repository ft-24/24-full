FROM node
WORKDIR /app/back
COPY package.json /app/back
COPY package-lock.json /app/back
RUN npm i
COPY . /app/back
EXPOSE 3000
CMD ["npm", "run", "start"]