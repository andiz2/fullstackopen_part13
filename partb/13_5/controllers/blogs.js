const router = require('express').Router()

const { Blog, User } = require('../models')
const {Op} = require('sequelize')

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
    } catch{
      return res.status(401).json({ error: 'token invalid' })
    }
  }  else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

const blogFinder = async (req, res, next) => {
    req.blog = await Blog.findByPk(req.params.id)
    next()
  }

router.get('/', async (req, res) => {
  const where = {}
  // if (req.query.author) {
  //   where.author = req.query.author
  // }
  if (req.query.search) {
    where[Op.or] = [
      { title: { [Op.substring]: req.query.search } },
      { author: { [Op.substring]: req.query.search } }
    ];
  }

  const blogs = await Blog.findAll({
    attributes: {exclude: ['userId']},
    order: [['likes', 'DESC']],
    include: {
      model: User,
      attributes: ['name']
    },
    where
  })
  res.json(blogs) 
})


router.post('/',tokenExtractor, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    const blog = await Blog.create({...req.body, userId: user.id})
    res.json(blog)
  } catch(error) {
    return res.status(400).json({ error })
  }
})

router.get('/:id', blogFinder, async (req, res) => {
  const blog = await Blog.findByPk(req.params.id)
  if (blog) {
    res.json(blog)
  } else {
    res.status(404).end()
  }
})

router.delete('/:id', blogFinder, async (req, res) => {
  const blog = await Blog.findByPk(req.params.id)
  if (blog) {
    await blog.destroy()
  }
  res.status(204).end()
})

router.put('/:id', blogFinder, async (req, res) => {
  const blog = await Blog.findByPk(req.params.id)
  if (blog) {
    blog.likes = req.body.likes
    blog.author = req.body.author
    await blog.save()
    res.json(blog)
  } else {
    res.status(404).end()
  }
})

module.exports = router