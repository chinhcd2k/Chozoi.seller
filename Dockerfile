# build environment
FROM node:12.2.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
RUN npm i -g yarn

RUN yarn install --silent
RUN yarn global add react-scripts@3.0.1 --silent
COPY . /app
RUN yarn run build

# production environment
FROM nginx:1.16.0-alpine
WORKDIR /
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
COPY docker-entrypoint.sh generate_config_js.sh /
RUN chmod +x docker-entrypoint.sh generate_config_js.sh

EXPOSE 9000

ENTRYPOINT ["/docker-entrypoint.sh"]
