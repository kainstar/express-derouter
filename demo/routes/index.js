const {Router, Get} = require('../../dist')

@Router('/')
class IndexController {
  @Get('/')
  index (req, res, next) {
    res.json({ title: 'Express', num: 1 })
  }
}

module.exports = IndexController
