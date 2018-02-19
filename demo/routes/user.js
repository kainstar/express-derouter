const {Router, Get} = require('../../dist')

@Router('/user')
class UserController {
  @Get('/')
  index (req, res, next) {
    res.send('Router /user')
  }
}

module.exports = UserController
