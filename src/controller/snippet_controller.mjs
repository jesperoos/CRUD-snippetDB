import { model as snippetModel } from '../model/snippets.mjs'

const controller = {}
export default controller

// Read all snippets
controller.list = async (req, res) => {
  const snippets = await snippetModel.listAll()
  if (!req.session.user) {
    res.render('snippetViews/read', { data: { snippets, flashMessage: res.data.flashMessage, role: 'User' } })
  } else {
    res.render('snippetViews/readSnippets', { data: { snippets, flashMessage: res.data.flashMessage, role: req.session.user.role } })
  }
}

// render create snippet page
controller.createSnippet = async (req, res, next) => {
  if (req.session.user) {
    res.render('snippetViews/createSnippet', { data: { flashMessage: res.data.flashMessage, role: req.session.user.role } })
    next()
  } else {
    res.send(403)
  }
}

// do post request with new snippet information
controller.postSnippet = async (req, res, next) => {
  if (req.session.user) {
    const username = JSON.stringify(req.session.user.username)
    const snippetname = JSON.stringify(req.body.snippetname)
    const codeSnippet = JSON.stringify(req.body.codesnippet)
    const data = {
      username,
      name: snippetname,
      codeSnippet
    }
    if ((await snippetModel.getSnippet(snippetname)).length === 0) {
      snippetModel.addSnippet(data)
    }
    req.session.flashMessage = `A new snippet was added, named: ${snippetname.replaceAll('"', '')}`
    res.redirect('/list-snippets')
    next()
  } else {
    res.send(403)
  }
}

// delete all snippets
controller.deleteAll = async (req, res, next) => {
  if (req.session.user.role === 'Admin') {
    await snippetModel.deleteAll()
    req.session.flashMessage = 'All snippets were deleted.'
    res.redirect('/list-snippets')
    next()
  } else {
    res.send(403)
  }
}

// delete one snippet
controller.deleteSnippet = async (req, res, next) => {
  if (req.session.user) {
    const snippets = await snippetModel.listAll()
    res.render('snippetViews/deleteSnippet', { data: { snippets, flashMessage: res.data.flashMessage, role: req.session.user.role } })
    next()
  } else {
    res.send(403)
  }
}

// post request containing name of snippet to be deleted
controller.delete = async (req, res, next) => {
  if (req.session.user) {
    const username = JSON.stringify(req.session.user.username)
    const snippetname = JSON.stringify(req.body.snippetname)
    console.log(`# Delete snippet "${req.body.snippetname}"`)

    const exists = await snippetModel.getSnippet(snippetname)
    const owner = await snippetModel.checkOwnership(username, snippetname)
    if ((exists.length === 0)) {
      req.session.flashMessage = "A snippet with that name doesn't exist."
      res.redirect('/delete-snippet')
      next()
    } else if ((owner.length === 0)) {
      req.session.flashMessage = 'You may only delete snippets that you have created!'
      res.redirect('/delete-snippet')
      next()
    } else {
      snippetModel.deleteOne(username, snippetname)
      req.session.flashMessage = `Snippet named: ${snippetname.replaceAll('"', '')} was deleted.`
      res.redirect('/list-snippets')
      next()
    }
  } else {
    res.send(403)
  }
}

// update a snippet
controller.changeSnippet = async (req, res, next) => {
  if (req.session.user) {
    const snippets = await snippetModel.listAll()
    res.render('snippetViews/updateSnippet', { data: { snippets, flashMessage: res.data.flashMessage, role: req.session.user.role } })
    next()
  } else {
    res.send(403)
  }
}

// post request of which snippet to be updated
controller.updateSnippet = async (req, res, next) => {
  if (req.session.user) {
    const username = JSON.stringify(req.session.user.username)
    const snippetname = JSON.stringify(req.body.snippetname)
    const codeSnippet = JSON.stringify(req.body.codesnippet)
    console.log(`# update snippet "${req.body.snippetname}"`)

    const exists = await snippetModel.getSnippet(snippetname)
    const owner = await snippetModel.checkOwnership(username, snippetname)
    if ((exists.length === 0)) {
      req.session.flashMessage = "A snippet with that name doesn't exist."
      res.redirect('/update-snippet')
      next()
    } else if ((owner.length === 0)) {
      req.session.flashMessage = 'You may only change snippets that you have created!'
      res.redirect('/update-snippet')
      next()
    } else {
      snippetModel.updateSnippet(username, snippetname, codeSnippet)
      req.session.flashMessage = `Snippet named: ${snippetname.replaceAll('"', '')} was updated.`
      res.redirect('/list-snippets')
      next()
    }
  } else {
    res.send(403)
  }
}
