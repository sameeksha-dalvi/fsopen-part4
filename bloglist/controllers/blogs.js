const blogsRouter = require('express').Router()
const { request, response } = require('express')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  // Blog.find({}).then((blogs) => {
  //   response.json(blogs)
  // })

  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

   const user = await User.findById(body.userId)

   if (!user) {
    return response.status(400).json({ error: 'userId missing or not valid' })
  }

  if (body.title === undefined || body.url === undefined) {
    return response.status(400).end()
  }
  const likesValue = body.likes === undefined ? 0 : body.likes;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: likesValue,
    user: user._id
  })

  // blog.save().then((result) => {
  //   response.status(201).json(result)
  // })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).end()
  }

  if (title !== undefined) blog.title = title
  if (author !== undefined) blog.author = author
  if (url !== undefined) blog.url = url
  if (likes !== undefined) blog.likes = likes

  const updatedBlog = await blog.save()
  response.json(updatedBlog)

})

module.exports = blogsRouter