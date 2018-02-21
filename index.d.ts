import express from 'express'
import http from 'http'

type registerOptions = {
  app: express.Application,
  routesDir: string|Array<string>
}

declare namespace derouter {

  interface routeMethod {
    (req: express.Request, res: express.Response, next?: express.NextFunction): any;
  }

  function register(options: registerOptions): void
  function Router(prefix: string|RegExp, routerOptions:express.RouterOptions, ...middlewares: Array<express.Handler>): ClassDecorator
  function Get(prefix: string|RegExp, ...middlewares: Array<express.Handler>): MethodDecorator
  function Post(prefix: string|RegExp, ...middlewares: Array<express.Handler>): MethodDecorator
  function Put(prefix: string|RegExp, ...middlewares: Array<express.Handler>): MethodDecorator
  function Delete(prefix: string|RegExp, ...middlewares: Array<express.Handler>): MethodDecorator
  function All(prefix: string|RegExp, ...middlewares: Array<express.Handler>): MethodDecorator
  function Custom(httpMethod: string, prefix: string|RegExp, ...middlewares: Array<express.Handler>): MethodDecorator
}

export = derouter