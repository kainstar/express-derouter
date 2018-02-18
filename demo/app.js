require('babel-register')

const express = require('express')
const path = require('path')
const app = express()

require('../dist').register({
  app,
  routesDir: path.join(__dirname, 'routes')
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  // res.render('error');
  res.json(res.locals)
})

app.listen(8080, function (err) {
  if (err) {
    console.log('server start err:', err)
  } else {
    console.log(`server start on http://localhost:8080`)
  }
})
