FROM node:8

# Create app directory
WORKDIR usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json and package-lock.json are copied
# where available 
COPY package*.json ./

# Proxy settings for mphasis network only
RUN echo '172.20.17.242 \t btpproxy.mphasis.com' >> /etc/hosts ; export http_proxy=http://blockchain.mphasis:Dec5Columbus@btpproxy.mphasis.com:8080; echo $http_proxy ;npm config set strict-ssl false;npm install; git config --global url.https://github.com/.insteadOf git://github.com/ ;npm config set strict-ssl false ; npm install ; npm install forever -g;

# RUN npm install
# If you are building your code for production 
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 5050

CMD [ "./initChainInsurance.sh" ]