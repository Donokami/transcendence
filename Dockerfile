###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:lts As development

WORKDIR /usr/src/app

COPY es.sh /es.sh
RUN chmod +x /es.sh

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5173

ENTRYPOINT [ "/es.sh" ]

CMD [ "npm", "run", "dev" ]

###################
# BUILD FOR PRODUCTION
###################

# FROM node:18-alpine As build

# WORKDIR /usr/src/app

# COPY --chown=node:node package*.json ./

# COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

# COPY --chown=node:node . .

# RUN npm run build

# ENV NODE_ENV production

# RUN npm ci --only=production && npm cache clean --force

# USER node

###################
# PRODUCTION
###################

# FROM node:18-alpine As production

# COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
# COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# CMD [ "node", "dist/main.js" ]