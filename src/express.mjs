import express from 'express'
import logger from 'morgan'
import session from 'express-session'
import userRoute from './route/route.mjs'
import bodyParser from 'body-parser'

const app = express()

app.set('view engine', 'ejs')
app.use(logger('dev'))
app.use(express.static('src'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Enable the session
app.use(session({
  cookie: {
    maxAge: 60000 * 15
  },
  resave: false,
  saveUninitialized: true,
  secret: 'keyboard cat'
}))

// Enable use of flash messages and prepare the data object
app.use((req, res, next) => {
  res.data = {}
  res.data.flashMessage = null
  if (req.session && req.session.flashMessage) {
    res.data.flashMessage = req.session.flashMessage
    req.session.flashMessage = ' '
  }
  next()
})

// Check if user is logged in and prepare the data object
app.use((req, res, next) => {
  res.data.user = {
    username: null,
    role: null
  }
  if (req.session && req.session.user) {
    res.data.user.username = req.session.user.username ?? null
  }
  if (req.session && req.session.user) {
    res.data.user.role = req.session.user.role ?? null
  }
  next()
})

app.use('/', userRoute)
export default (port = 3000) => {
  app.listen(port, () => { console.log(`Listening at port ${port}`) })
}
