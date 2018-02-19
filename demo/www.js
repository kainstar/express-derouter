const app = require('./app')

app.listen(8080, function (err) {
  if (err) {
    console.log('server start err:', err)
  } else {
    console.log(`server start on http://localhost:8080`)
  }
})
