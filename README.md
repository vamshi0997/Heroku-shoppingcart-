![Application Landing Banner](https://github.com/nirajKpanda/node-shopkart/blob/master/public/images/app-landing-page.PNG)

# A shopping cart project developed with Node JS.

## Development tools

1. Node JS(Server)
2. Bootstrap(CSS/JS)
3. Stripe(Payments)
4. Mongo(Datastore)
5. Handlebars(Templating)
6. Moongoose(ORM)
7. User Authentication(Google Recaptcha, Node Passport)

### Prerequisites

| Prerequisite                                | Version |
| ------------------------------------------- | ------- |
| [MongoDB](http://www.mongodb.org/downloads) | `~ ^3`  |
| [Node.js](http://nodejs.org)                | `~ ^6`  |
| npm (comes with Node)                       | `~ ^3`  |

> _Updating to the latest releases is recommended_.

If Node or MongoDB is already installed in your machine, run the following commands to validate the versions:

```shell
node -v
mongo --version
```

If your versions are lower than the prerequisite versions, you should update.

#### Setting Up Your System

1. Install [Git](https://git-scm.com/) or your favorite Git client.
2. (Optional) [Setup an SSH Key](https://help.github.com/articles/generating-an-ssh-key/) for GitHub.
3. Create a parent projects directory on your system. For this guide, it will be assumed that it is `/mean/`

#### Cloning Repository

1. Open a Terminal / Command Line / Bash Shell in your projects directory (_i.e.: `/yourprojectdirectory/`_)
2. Clone the node-shopkart repository

```shell
$ git clone https://github.com/nirajKpanda/node-shopkart.git
```

This will download the entire node-shopkart repo to your project directory.

#### Setup Your Upstream

1. Change directory to the new node-shopkart directory (`cd node-shopkart`)

Congratulations, you now have a local copy of the node-shopkart project!


### Setup node-shopkart enviornment
Once you have node-shopkart cloned, before you start the application, you first need to install all of the dependencies:

```bash
# Install NPM dependencies locally
npm install --save

# Install nodemon globally
npm install -g nodemon
```


# Start the mongo server in a separate terminal

```
mongod
```

# Seed the data in database for the first time.
# This command should only be run once. (optional)

```
node seed/product-seeder.js
```

or

```
npm run seed
```

# start the application

```
npm start
```

Now navigate to your browser and open
<http://localhost:3000>. If the app loads,
congratulations – you're all set.