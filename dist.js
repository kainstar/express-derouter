'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var express = _interopDefault(require('express'));
var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var debug = require('debug')('express:deroute');
/**
 * @typedef {express.Application}
 */
var app = null;

/**
 * 扫描并引入目录下的模块
 *
 * @private
 * @param {string} routesDir 路由目录
 */
function scanDirModules(routesDir) {
  if (!fs.existsSync(routesDir)) {
    debug('path %s is not exist', routesDir);
    return;
  }
  var filenames = fs.readdirSync(routesDir);

  var _loop = function _loop() {
    // 路由文件相对路径
    var relativeFilePath = filenames.shift();
    // 路由文件绝对路径
    var absFilePath = path.join(routesDir, relativeFilePath);
    if (fs.statSync(absFilePath).isDirectory()) {
      // 是文件夹的情况下，读取子目录文件，添加到路由文件队列中
      var subFiles = fs.readdirSync(absFilePath).map(function (v) {
        return path.join(absFilePath.replace(routesDir, ''), v);
      });
      filenames = filenames.concat(subFiles);
    } else {
      debug('load the route file: %s', absFilePath);
      require(absFilePath);
    }
  };

  while (filenames.length) {
    _loop();
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
function register(options) {
  if (Object.prototype.toString(options) !== '[object Object]') {
    throw new Error('the register function must have a option object argument!');
  }
  if (!options.app) {
    throw new Error('the argument options must have a app field!');
  }
  if (!options.routesDir) {
    throw new Error('the argument options must have a routesDir field!');
  }
  app = options.app;
  // 支持扫描多个路由目录
  var routesDirs = typeof options.routesDir === 'string' ? [options.routesDir] : options.routesDir;
  routesDirs.forEach(function (dir) {
    scanDirModules(dir);
  });
}

/**
 * Router 类装饰器，使用在 class 上，生成一个带有共通前缀和中间件的路由
 *
 * @export
 * @param {string|RegExp} prefix 路由前缀
 * @param {express.RouterOptions} routerOption 路由选项
 * @param {Array<Function>} middlewares 中间件数组
 * @returns {ClassDecorator}
 */
function Router(prefix, routerOption) {
  for (var _len = arguments.length, middlewares = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    middlewares[_key - 2] = arguments[_key];
  }

  // 判断是否有路由选项，没有则当做中间件来使用
  if (typeof routerOption === 'function') {
    middlewares.unshift(routerOption);
    routerOption = undefined;
  }

  /**
   * 为类生成一个 router,
   * 该装饰器会在所有方法装饰器执行完后才执行
   *
   * @param {Function} target 路由类对象
   */
  return function (target) {
    var _app;

    var router = express.Router(routerOption);
    var _routeMethods = target.prototype._routeMethods;
    // 遍历挂载路由
    for (var method in _routeMethods) {
      if (_routeMethods.hasOwnProperty(method)) {
        var methods = _routeMethods[method];
        for (var _path in methods) {
          if (methods.hasOwnProperty(_path)) {
            router[method].apply(router, [_path].concat(_toConsumableArray(methods[_path])));
          }
        }
      }
    }
    delete target.prototype._routeMethods;
    (_app = app).use.apply(_app, [prefix].concat(middlewares, [router]));
  };
}

/**
 * 生成对应HTTP请求方法的装饰器
 *
 * @param {string} httpMethod 请求方法
 * @param {string|RegExp} pattern 请求路径
 * @param {Array<Function>} middlewares 中间件数组
 * @returns {MethodDecorator}
 */
function generateMethodDecorator(httpMethod, pattern, middlewares) {
  return function (target, methodName, descriptor) {
    if (!target._routeMethods) {
      target._routeMethods = {};
    }
    // 为自定义方法生成对应的方法存储对象
    if (!target._routeMethods[httpMethod]) {
      target._routeMethods[httpMethod] = {};
    }
    target._routeMethods[httpMethod][pattern] = [].concat(_toConsumableArray(middlewares), [target[methodName]]);
    return descriptor;
  };
}

/**
 * GET 方法装饰器
 *
 * @export
 * @param {string|RegExp} pattern 路由路径
 * @param {Array<Function>} middlewares 中间件数组
 * @returns {MethodDecorator}
 */
function Get(pattern) {
  for (var _len2 = arguments.length, middlewares = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    middlewares[_key2 - 1] = arguments[_key2];
  }

  return generateMethodDecorator('get', pattern, middlewares);
}

/**
 * POST 方法装饰器
 *
 * @export
 * @param {string|RegExp} pattern 路由路径
 * @param {Array<Function>} middlewares 中间件数组
 * @returns {MethodDecorator}
 */
function Post(pattern) {
  for (var _len3 = arguments.length, middlewares = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    middlewares[_key3 - 1] = arguments[_key3];
  }

  return generateMethodDecorator('post', pattern, middlewares);
}

/**
 * PUT 方法装饰器
 *
 * @export
 * @param {string|RegExp} pattern 路由路径
 * @param {Array<Function>} middlewares 中间件数组
 * @returns {MethodDecorator}
 */
function Put(pattern) {
  for (var _len4 = arguments.length, middlewares = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    middlewares[_key4 - 1] = arguments[_key4];
  }

  return generateMethodDecorator('put', pattern, middlewares);
}

/**
 * DELETE 方法装饰器
 *
 * @export
 * @param {string|RegExp} pattern 路由路径
 * @param {Array<Function>} middlewares 中间件数组
 * @returns {MethodDecorator}
 */
function Delete(pattern) {
  for (var _len5 = arguments.length, middlewares = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
    middlewares[_key5 - 1] = arguments[_key5];
  }

  return generateMethodDecorator('delete', pattern, middlewares);
}

/**
 * DELETE 方法装饰器
 *
 * @export
 * @param {string|RegExp} pattern 路由路径
 * @param {Array<Function>} middlewares 中间件数组
 * @returns {MethodDecorator}
 */
function All(pattern) {
  for (var _len6 = arguments.length, middlewares = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
    middlewares[_key6 - 1] = arguments[_key6];
  }

  return generateMethodDecorator('all', pattern, middlewares);
}

/**
 * 自定义方法装饰器
 *
 * @export
 * @param {string} httpMethod http方法名
 * @param {string|RegExp} pattern 路由路径
 * @param {Array<Function>} middlewares 中间件数组
 * @returns {MethodDecorator}
 */
function Custom(httpMethod, pattern) {
  for (var _len7 = arguments.length, middlewares = Array(_len7 > 2 ? _len7 - 2 : 0), _key7 = 2; _key7 < _len7; _key7++) {
    middlewares[_key7 - 2] = arguments[_key7];
  }

  return generateMethodDecorator(httpMethod.toLowerCase(), pattern, middlewares);
}

exports.register = register;
exports.Router = Router;
exports.Get = Get;
exports.Post = Post;
exports.Put = Put;
exports.Delete = Delete;
exports.All = All;
exports.Custom = Custom;
