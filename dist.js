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
 * scan and require the module in the routesDir
 *
 * @private
 * @param {string} routesDir routes's root dir
 */
function scanDirModules(routesDir) {
  if (!fs.existsSync(routesDir)) {
    debug('path %s is not exist', routesDir);
    return;
  }
  var filenames = fs.readdirSync(routesDir);

  var _loop = function _loop() {
    // the relative path of router file
    var relativeFilePath = filenames.shift();
    // the absolute path of router file
    var absFilePath = path.join(routesDir, relativeFilePath);
    if (fs.statSync(absFilePath).isDirectory()) {
      // if the file is directory, then read its sub file and add them to the router files queue
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
 * register the express server
 *
 * @export
 * @param {Object} options register options
 * @param {express.Application} options.app express server obj
 * @param {string|Array<string>} options.routesDir the router dirs need scanned
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
  // support scan multiple dirs
  var routesDirs = typeof options.routesDir === 'string' ? [options.routesDir] : options.routesDir;
  routesDirs.forEach(function (dir) {
    scanDirModules(dir);
  });
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
function Router(prefix, routerOptions) {
  for (var _len = arguments.length, middlewares = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    middlewares[_key - 2] = arguments[_key];
  }

  // judge if routerOptions exist. If not, then make it as a middleware
  if (typeof routerOptions === 'function') {
    middlewares.unshift(routerOptions);
    routerOptions = undefined;
  }

  /**
   * generate the router obj for class,
   * it will excute after all method decorators excute over
   *
   * @param {express.Handler} target the request handler
   */
  function mount(target) {
    var _app;

    var router = express.Router(routerOptions);
    var _routeMethods = target.prototype._routeMethods;
    // iterate the handlers stored on class prototype and mount them on the router obj
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
    return target;
  }

  return mount;
}

/**
 * generate the decorators for the http method arguement
 *
 * @param {string} httpMethod http method name
 * @param {string|RegExp} pattern router path
 * @param {Array<express.Handler>} middlewares middlewares array
 * @returns {MethodDecorator}
 */
function generateMethodDecorator(httpMethod, pattern, middlewares) {
  return function (target, methodName, descriptor) {
    // create the obj to store the router handler
    if (!target._routeMethods) {
      target._routeMethods = {};
    }
    if (!target._routeMethods[httpMethod]) {
      target._routeMethods[httpMethod] = {};
    }
    target._routeMethods[httpMethod][pattern] = [].concat(_toConsumableArray(middlewares), [target[methodName]]);
    return descriptor;
  };
}

/**
 * GET method decorators
 *
 * @export
 * @param {string|RegExp} pattern router path
 * @param {Array<express.Handler>} middlewares middlewares array
 * @returns {MethodDecorator}
 */
function Get(pattern) {
  for (var _len2 = arguments.length, middlewares = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    middlewares[_key2 - 1] = arguments[_key2];
  }

  return generateMethodDecorator('get', pattern, middlewares);
}

/**
 * POST method decorators
 *
 * @export
 * @param {string|RegExp} pattern router path
 * @param {Array<express.Handler>} middlewares middlewares array
 * @returns {MethodDecorator}
 */
function Post(pattern) {
  for (var _len3 = arguments.length, middlewares = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    middlewares[_key3 - 1] = arguments[_key3];
  }

  return generateMethodDecorator('post', pattern, middlewares);
}

/**
 * PUT method decorators
 *
 * @export
 * @param {string|RegExp} pattern router path
 * @param {Array<express.Handler>} middlewares middlewares array
 * @returns {MethodDecorator}
 */
function Put(pattern) {
  for (var _len4 = arguments.length, middlewares = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    middlewares[_key4 - 1] = arguments[_key4];
  }

  return generateMethodDecorator('put', pattern, middlewares);
}

/**
 * DELETE method decorators
 *
 * @export
 * @param {string|RegExp} pattern router path
 * @param {Array<express.Handler>} middlewares middlewares array
 * @returns {MethodDecorator}
 */
function Delete(pattern) {
  for (var _len5 = arguments.length, middlewares = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
    middlewares[_key5 - 1] = arguments[_key5];
  }

  return generateMethodDecorator('delete', pattern, middlewares);
}

/**
 * DELETE method decorators
 *
 * @export
 * @param {string|RegExp} pattern router path
 * @param {Array<express.Handler>} middlewares middlewares array
 * @returns {MethodDecorator}
 */
function All(pattern) {
  for (var _len6 = arguments.length, middlewares = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
    middlewares[_key6 - 1] = arguments[_key6];
  }

  return generateMethodDecorator('all', pattern, middlewares);
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
