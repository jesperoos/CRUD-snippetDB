import * as dotenv from 'dotenv'
import mongoose from 'mongoose'
dotenv.config()
mongoose.Promise = global.Promise

export const model = {}

/**
 * connect to mongodb
 */
mongoose.set('strictQuery', false) // fix to prepare for 7.0 and avoid warning
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 3000
})

/**
 * database schema
 */
const Schema = mongoose.Schema
const snippetSchema = new Schema({
  username: { type: String },
  name: { type: String },
  codeSnippet: { type: String }
})

// Compile a model from the schema
const Snippet = mongoose.model('snippet', snippetSchema)

/**
 * list all snippets.
 */
model.listAll = async () => {
  console.log('Reading snippets from the database...')
  const snippets = await Snippet.find()
  return snippets
}

/**
 * find a snippet by name.
 *
 * @param {string} snippetname name of snippet
 */
model.getSnippet = async (snippetname) => {
  return await Snippet.find({
    name: snippetname
  })
}

/**
 * add a snippet to database.
 *
 * @param {object} data information of snippet
 */
model.addSnippet = async (data) => {
  const newSnippet = new Snippet({
    username: data.username,
    name: data.name,
    codeSnippet: data.codeSnippet
  })
  await newSnippet.save()
  console.log('A snippet was added - ' + data.name)
}

/**
 * delete all snippets, only available to admin
 *
 */
model.deleteAll = async () => {
  await Snippet.deleteMany()
  console.log('All snippets were deleted')
}

/**
 * delete one snippet by name
 *
 * @param {string} user username
 * @param {string} snippetname name of snippet to be deleted
 */
model.deleteOne = async (user, snippetname) => {
  await Snippet.remove({
    username: user,
    name: snippetname
  })
  console.log('snippet was deleted')
}

/**
 * update a snippet by name
 *
 * @param {string} user username
 * @param {string} snippetname name of snippet to be deleted
 * @param {string} codeS new snippet to be saved
 */
model.updateSnippet = async (user, snippetname, codeS) => {
  await Snippet.updateOne({
    username: user,
    name: snippetname
  }, {
    codeSnippet: codeS
  })
  console.log('Snippet was updated')
}

/**
 * used to check if a user is the owner of a snippet
 *
 * @param {string} user username
 * @param {string} snippetname name of snippet to check
 */
model.checkOwnership = async (user, snippetname) => {
  const owner = await Snippet.find({
    username: user,
    name: snippetname
  })
  return owner
}
