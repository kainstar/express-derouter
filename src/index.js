import express from 'express'
import fs from 'fs'
import path from 'path'

const debug = require('debug')('express:deroute')
/**
 * @typedef {express.Application}
 */
let app = null

/**
 * scan and require the module in the routesDir
 *
 * @private
 * @param {string} routesDir routes's root dir
 */
function scanDirModules (routesDir) {
  if (!fs.existsSync(routesDir)) {
    debug('path %s is not exist', routesDir)
    return
  }
  let filenames = fs.readdirSync(routesDir)
  while (filenames.length) {
    // the relative path of router file
    const relativeFilePath = filenames.shift()
    // the absolute path of router file
    const absFilePath = path.join(routesDir, relativeFilePath)
    if (fs.statSync(absFilePath).isDirectory()) {
      // if the file is directory, then read its sub file and add them to the router files queue
      const subFiles = fs.readdirSync(absFilePath).map(v => path.join(absFilePath.replace(routesDir, ''), v))
      filenames = filenames.concat(subFiles)
    } else {
      debug('load the route file: %s', absFilePath)
      require(absFilePath)
    }
  }
}

/**
 * register the express server
 *
 * @export
 * @param {Object} options register options
 * @param {express.Application} options.app express server obj
 * @param {string|Array<string>} options.routesDir the router dirs need scanned
 */
export function register (options) {
  if (Object.prototype.toString(options) !== '[object Object]') {
    throw new Error('the register function must have a option object argument!')
  }
  if (!options.app) {
    throw new Error('the argument options must have a app field!')
  }
  if (!options.routesDir) {
    throw new Error('the argument options must have a routesDir field!')
  }
  app = options.app
  // support scan multiple dirs
  const routesDirs = typeof options.routesDir === 'string' ? [options.routesDir] : options.routesDir
  routesDirs.forEach(dir => {
    scanDirModules(dir)
  })
}

/**
 * Router class decorators，generate a router with common prefix and middlewares
 *
 * @export
 * @param {string|RegExp} prefix router path prefix
 * @param {express.RouterOptions} routerOptions express router options
 * @param {Array<express.Handler>} middlewares middlewares array
 * @returns {ClassDecorator}
 */
export function Router (prefix, routerOptions, ...middlewares) {
  // judge if routerOptions exist. If not, then make it as a middleware
  if (typeof routerOptions === 'function') {
    middlewares.unshift(routerOptions)
    routerOptions = undefined
  }

  /**
   * generate the router obj for class,
   * it will excute after all method decorators excute over
   *
   * @param {express.Handler} target the request handler
   */
  function mount (target) {
    const router = express.Router(routerOptions)
    const _routeMethods = target.prototype._routeMethods
    // iterate the handlers stored on class prototype and mount them on the router obj
    for (const method in _routeMethods) {
      if (_routeMethods.hasOwnProperty(method)) {
        const methods = _routeMethods[method]
        for (const path in methods) {
          if (methods.hasOwnProperty(path)) {
            router[method](path, ...methods[path])
          }
        }
      }
    }
    delete target.prototype._routeMethods
    app.use(prefix, ...middlewares, router)
    return target
  }

  return mount
}

/**
 * generate the decorators for the http method arguement
 *
 * @param {string} httpMethod http method name
 * @param {string|RegExp} pattern router path
 * @param {Array<express.Handler>} middlewares middlewares array
 * @returns {MethodDecorator}
 */
function generateMethodDecorator (httpMethod, pattern, middlewares) {
  return function (target, methodName, descriptor) {
    // create the obj to store the router handler
    if (!target._routeMethods) {
      target._routeMethods = {}
    }
    if (!target._routeMethods[httpMethod]) {
      target._routeMethods[httpMethod] = {}
    }
    target._routeMethods[httpMethod][pattern] = [...middlewares, target[methodName]]
    return descriptor
  }
}

/**
 * GET method decorators
 *
 * @export
 * @param {string|RegExp} pattern router path
 * @param {Array<express.Handler>} middlewares middlewares array
 * @returns {MethodDecorator}
 */
export function Get (pattern, ...middlewares) {
  return generateMethodDecorator('get', pattern, middlewares)
}

/**
 * POST method decorators
 *
 * @export
 * @param {string|RegExp} pattern router path
 * @param {Array<express.Handler>} middlewares middlewares array
 * @returns {MethodDecorator}
 */
export function Post (pattern, ...middlewares) {
  return generateMethodDecorator('post', pattern, middlewares)
}

/**
 * PUT method decorators
 *
 * @export
 * @param {string|RegExp} pattern router path
 * @param {Array<express.Handler>} middlewares middlewares array
 * @returns {MethodDecorator}
 */
export function Put (pattern, ...middlewares) {
  return generateMethodDecorator('put', pattern, middlewares)
}

/**
 * DELETE method decorators
 *
 * @export
 * @param {string|RegExp} pattern router path
 * @param {Array<express.Handler>} middlewares middlewares array
 * @returns {MethodDecorator}
 */
export function Delete (pattern, ...middlewares) {
  return generateMethodDecorator('delete', pattern, middlewares)
}

/**
 * DELETE method decorators
 *
 * @export
 * @param {string|RegExp} pattern router path
 * @param {Array<express.Handler>} middlewares middlewares array
 * @returns {MethodDecorator}
 */
export function All (pattern, ...middlewares) {
  return generateMethodDecorator('all', pattern, middlewares)
}

/**
 * custom method decorators which express supports
 *
 * @export
 * @param {string} httpMethod http method name
 * @param {string|RegExp} pattern router path
 * @param {Array<express.Handler>} middlewares middlewares array
 * @returns {MethodDecorator}
 */
export function Custom (httpMethod, pattern, ...middlewares) {
  return generateMethodDecorator(httpMethod.toLowerCase(), pattern, middlewares)
}
