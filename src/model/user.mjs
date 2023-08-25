import * as dotenv from 'dotenv'
import mongoose from 'mongoose'
dotenv.config()
mongoose.Promise = global.Promise

export const model = {}

//
// Connect to the MongoDB database
//
mongoose.set('strictQuery', false) // fix to prepare for 7.0 and avoid warning
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 3000
})

//
// Create a database schema
//
const Schema = mongoose.Schema
const userSchema = new Schema({
  username: { type: String },
  password: { type: String },
  role: {
    type: String
  }
})

// Compile a model from the schema
const User = mongoose.model('user', userSchema)

/**
 * List all users.
 *
 * @param {string} usern Username
 * @returns {object} information about a user
 */
model.getUser = async (usern) => {
  return await User.find({
    username: usern
  })
}

/**
 * List all users.
 *
 * @returns {Array} array with users.
 */
model.listAll = async () => {
  console.log('Reading users from the database...')
  const users = await User.find()
  return users
}

/**
 * Delete all users.
 */
model.deleteAll = async () => {
  await User.deleteMany()
  console.log('All users where deleted')
}

/**
 * Add new user.
 *
 * @param {string} username Username
 * @param {string} password Password
 */
model.register = async (username, password) => {
  let role = ''
  const count = await User.find()
  if (count.length === 0) {
    role = 'Admin'
  } else {
    role = 'User'
  }
  const newUser = new User({
    username: `${username}`,
    password: `${password}`,
    role: `${role}`
  })
  await newUser.save()
  console.log('A user was added - ' + newUser.username)
}

/**
 * Find a user by name.
 *
 * @param {string} name a name to search for.
 * @returns {Array} with user.
 */
model.findByName = async (name) => {
  return await User.find({
    name
  })
}
