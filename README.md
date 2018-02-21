# express-derouter

Help you use Decorators to define express routes

An achieve package of my blog —— [关于express路由管理的几种自动化方法](https://blog.kainstar.cn/2018/02/17/%E5%85%B3%E4%BA%8Eexpress%E8%B7%AF%E7%94%B1%E7%AE%A1%E7%90%86%E7%9A%84%E5%87%A0%E7%A7%8D%E8%87%AA%E5%8A%A8%E5%8C%96%E6%96%B9%E6%B3%95/)

[![Travis](https://img.shields.io/travis/kainstar/express-deruter.svg)](https://github.com/kainstar/express-derouter)

## Usage

- [Install](#install)
- [Register App](#register-app)
- [Use Decorators](#use-decorators)

### Install

```bash
$ npm install express-derouter --save
or
$ yarn add express-derouter
```

### Register App

```js
require('babel-register')
const express = require('express')
const path = require('path')
const app = express()

require('express-derouter').register({
  app,
  routesDir: path.join(__dirname, 'routes')
})
```

The `register` method receive a object contain 2 fields:

- `app` {express.Application} - the express app object
- `routesDir` {string|Array&lt;string&gt;} - the router's dir need scan (only need the root route dir, and `express-derouter` will require all the js file)

**the register method only need to call once!**

### Use Decorators

You can use `express-derouter`'s derotators in your router files.

```js
const {Router, Get, Post, Put, Delete, All, Custom} = require('express-derouter')

@Router('/', ...middleawares)
class IndexController {
  @Get('/', ...middleawares)
  get (req, res, next) {
    res.send('get /')
  }

  @Post('/', ...middleawares)
  post (req, res, next) {
    res.send('post /')
  }

  @Put('/', ...middleawares)
  put (req, res, next) {
    res.send('put /')
  }

  @Delete('/', ...middleawares)
  delete (req, res, next) {
    res.send('delete /')
  }

  @All('/all', ...middleawares)
  all (req, res, next) {
    res.send('all /all')
  }

  @Custom('options', '/custom', ...middleawares)
  custom (req, res, next) {
    res.send('options /custom')
  }
}

module.exports = IndexController
```

**Router**

The `Router` decorators is used on class，and receive the first argument as the router path.

**Get, Post, Put, Delete, All**

Equals to the express method `get, post, put, delete, all`, use them to decide the class method should be access by which http method and what path.

**Custom**

Use `Custom` decorators, you can use the custom http method which express support on your class methods.

*All the decorators can receive custom quantity of function as the front middleware of the class method handler or the class router.*

## Tests ##

To run the test suite, first install the dependencies, then run npm test:

```bash
$ git clone https://github.com/kainstar/express-derouter.git ./express-derouter
$ cd ./express-derouter
$ npm install
$ npm test
```

## License ##

[MIT](https://github.com/kainstar/express-derouter/blob/master/LICENSE)