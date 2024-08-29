FROM node:20-alpine as build

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --production=false --ignore-scripts

COPY . .

RUN yarn build


FROM node:20-alpine as main

WORKDIR /

COPY --from=build /app/dist/apps/shop/ /

COPY --from=build /app/node_modules/ /node_modules/

COPY --from=build /app/package.json /

EXPOSE 4444

CMD node main.js