const {Router, Get} = require('../../dist')

@Router('/user')
class UserController {
  @Get('/')
  index (req, res, next) {
    res.send('respond with a resource')
  }
}

module.exports = UserController
