import express from 'express'
import fs from 'fs'
import path from 'path'

const debug = require('debug')('express:deroute')
/**
 * @typedef {express.Application}
 */
let app = null

/**
 * 扫描并引入目录下的模块
 *
 * @private
 * @param {string} routesDir 路由目录
 */
function scanDirModules (routesDir) {
  if (!fs.existsSync(routesDir)) {
    debug('path %s is not exist', routesDir)
    return
  }
  let filenames = fs.readdirSync(routesDir)
  while (filenames.length) {
    // 路由文件相对路径
    const relativeFilePath = filenames.shift()
    // 路由文件绝对路径
    const absFilePath = path.join(routesDir, relativeFilePath)
    if (fs.statSync(absFilePath).isDirectory()) {
      // 是文件夹的情况下，读取子目录文件，添加到路由文件队列中
      const subFiles = fs.readdirSync(absFilePath).map(v => path.join(absFilePath.replace(routesDir, ''), v))
      filenames = filenames.concat(subFiles)
    } else {
      debug('load the route file: %s', absFilePath)
      require(absFilePath)
    }
  }
}

/**
 * 注册express服务器
 *
 * @export
 * @param {Object} options 注册选项
 * @param {express.Application} options.app express服务器对象
 * @param {string|Array<string>} options.routesDir 要扫描的路由目录
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
  // 支持扫描多个路由目录
  const routesDirs = typeof options.routesDir === 'string' ? [options.routesDir] : options.routesDir
  routesDirs.forEach(dir => {
    scanDirModules(dir)
  })
}

/**
 * Router 类装饰器，使用在 class 上，生成一个带有共通前缀和中间件的路由
 *
 * @export
 * @param {string|RegExp} prefix 路由前缀
 * @param {express.RouterOptions} routerOptions 路由选项
 * @param {Array<express.Handler>} middlewares 中间件数组
 * @returns {ClassDecorator}
 */
export function Router (prefix, routerOptions, ...middlewares) {
  // 判断是否有路由选项，没有则当做中间件来使用
  if (typeof routerOptions === 'function') {
    middlewares.unshift(routerOptions)
    routerOptions = undefined
  }

  /**
   * 为类生成一个 router,
   * 该装饰器会在所有方法装饰器执行完后才执行
   *
   * @param {express.Handler} target 路由类对象
   */
  function mount (target) {
    const router = express.Router(routerOptions)
    const _routeMethods = target.prototype._routeMethods
    // 遍历挂载路由
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
 * 生成对应HTTP请求方法的装饰器
 *
 * @param {string} httpMethod 请求方法
 * @param {string|RegExp} pattern 请求路径
 * @param {Array<express.Handler>} middlewares 中间件数组
 * @returns {MethodDecorator}
 */
function generateMethodDecorator (httpMethod, pattern, middlewares) {
  return function (target, methodName, descriptor) {
    if (!target._routeMethods) {
      target._routeMethods = {}
    }
    // 为自定义方法生成对应的方法存储对象
    if (!target._routeMethods[httpMethod]) {
      target._routeMethods[httpMethod] = {}
    }
    target._routeMethods[httpMethod][pattern] = [...middlewares, target[methodName]]
    return descriptor
  }
}

/**
 * GET 方法装饰器
 *
 * @export
 * @param {string|RegExp} pattern 路由路径
 * @param {Array<express.Handler>} middlewares 中间件数组
 * @returns {MethodDecorator}
 */
export function Get (pattern, ...middlewares) {
  return generateMethodDecorator('get', pattern, middlewares)
}

/**
 * POST 方法装饰器
 *
 * @export
 * @param {string|RegExp} pattern 路由路径
 * @param {Array<express.Handler>} middlewares 中间件数组
 * @returns {MethodDecorator}
 */
export function Post (pattern, ...middlewares) {
  return generateMethodDecorator('post', pattern, middlewares)
}

/**
 * PUT 方法装饰器
 *
 * @export
 * @param {string|RegExp} pattern 路由路径
 * @param {Array<express.Handler>} middlewares 中间件数组
 * @returns {MethodDecorator}
 */
export function Put (pattern, ...middlewares) {
  return generateMethodDecorator('put', pattern, middlewares)
}

/**
 * DELETE 方法装饰器
 *
 * @export
 * @param {string|RegExp} pattern 路由路径
 * @param {Array<express.Handler>} middlewares 中间件数组
 * @returns {MethodDecorator}
 */
export function Delete (pattern, ...middlewares) {
  return generateMethodDecorator('delete', pattern, middlewares)
}

/**
 * DELETE 方法装饰器
 *
 * @export
 * @param {string|RegExp} pattern 路由路径
 * @param {Array<express.Handler>} middlewares 中间件数组
 * @returns {MethodDecorator}
 */
export function All (pattern, ...middlewares) {
  return generateMethodDecorator('all', pattern, middlewares)
}

/**
 * 自定义方法装饰器
 *
 * @export
 * @param {string} httpMethod http方法名
 * @param {string|RegExp} pattern 路由路径
 * @param {Array<express.Handler>} middlewares 中间件数组
 * @returns {MethodDecorator}
 */
export function Custom (httpMethod, pattern, ...middlewares) {
  return generateMethodDecorator(httpMethod.toLowerCase(), pattern, middlewares)
}
