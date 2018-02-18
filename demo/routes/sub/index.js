const {Router, Get} = require('../../../dist')

@Router('/sub')
class SubController {
  @Get('/')
  index (req, res, next) {
    res.send('sub/index/')
  }
}

module.exports = SubController
