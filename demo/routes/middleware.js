const {Router, Get} = require('../../dist')

function addHeaderMiddleware (req, res, next) {
  res.set('Custom-Header', 'express-derouter')
  next()
}

@Router('/middleware', addHeaderMiddleware)
class MiddlewareController {
  @Get('/')
  index (req, res, next) {
    res.send('Router /middleware')
  }
}

module.exports = MiddlewareController
