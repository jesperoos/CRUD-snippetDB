import express from 'express'
import userController from '../controller/user_controller.mjs'
import snippetController from '../controller/snippet_controller.mjs'

const router = express.Router()
export default router

router.get('/create-user', userController.createAccount)
router.get('/sign-in', userController.signInPage)
router.get('/sign-out', userController.signOut)
router.get('/list-users', userController.list)
router.get('/clear-database', userController.deleteAll)

router.get('/', snippetController.list)
router.get('/clear-database', snippetController.deleteAll)
router.get('/list-snippets', snippetController.list)
router.get('/create-snippet', snippetController.createSnippet)
router.get('/delete-snippet', snippetController.deleteSnippet)
router.get('/update-snippet', snippetController.changeSnippet)
router.get('/delete-all-snippets', snippetController.deleteAll)

router.post('/register', userController.register)
router.post('/sign-in', userController.signIn)
router.post('/create-snippet', snippetController.postSnippet)
router.post('/delete-snippet', snippetController.delete)
router.post('/update-snippet', snippetController.updateSnippet)

router.get('*', function (req, res) {
  res.status(404).send('404, Page Not Found')
})
