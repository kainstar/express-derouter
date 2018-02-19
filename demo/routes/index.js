const {Router, Get, Post, Put, Delete, All, Custom} = require('../../dist')

@Router('/')
class IndexController {
  @Get('/')
  get (req, res, next) {
    res.send('get /')
  }
  @Post('/')
  post (req, res, next) {
    res.send('post /')
  }
  @Put('/')
  put (req, res, next) {
    res.send('put /')
  }
  @Delete('/')
  delete (req, res, next) {
    res.send('delete /')
  }
  @All('/all')
  all (req, res, next) {
    res.send('all /all')
  }
  @Custom('get', '/custom')
  custom (req, res, next) {
    res.send('custom /custom')
  }
}

module.exports = IndexController
