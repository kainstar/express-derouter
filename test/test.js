import app from '../demo/app'
import supertest from 'supertest'

console.log(process.env.NODE_ENV)

describe('express-derouter test', function () {
  /**
   * @type {express.Application}
   */
  let server
  /**
   * @type {supertest.SuperTest<supertest.Test>}
   */
  let request

  before(function (done) {
    server = app.listen(done)
    request = supertest.agent(server)
  })

  after(function (done) {
    server.close(done)
  })

  it('Get decorators', function (done) {
    request.get('/').expect(200, 'get /', done)
  })

  it('Post decorators', function (done) {
    request.post('/').expect(200, 'post /', done)
  })

  it('Put decorators', function (done) {
    request.put('/').expect(200, 'put /', done)
  })

  it('Delete decorators', function (done) {
    request.delete('/').expect(200, 'delete /', done)
  })

  it('All decorators', function (done) {
    this.timeout(5000)
    const testArray = [
      request.get('/all').expect(200, 'all /all'),
      request.post('/all').expect(200, 'all /all'),
      request.put('/all').expect(200, 'all /all'),
      request.delete('/all').expect(200, 'all /all')
    ]
    Promise.all(testArray).then(() => done())
  })

  it('Custom decorators', function (done) {
    request.get('/custom').expect(200, 'custom /custom', done)
  })

  it('Router decorators', function (done) {
    request.get('/user').expect(200, 'Router /user', done)
  })

  it('sub dir router', function (done) {
    request.get('/sub').expect(200, 'sub/index/', done)
  })

  it('router middleware', function (done) {
    request.get('/middleware')
      .expect('Custom-Header', 'express-derouter')
      .expect(200, 'Router /middleware', done)
  })
})
