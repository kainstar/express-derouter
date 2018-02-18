const {Router, Get} = require('../../../dist')

@Router('/sub/a')
class SubAController {
  @Get('/')
  index (req, res, next) {
    res.send('sub/a/')
  }
}

module.exports = SubAController
