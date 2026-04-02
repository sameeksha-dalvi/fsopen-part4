const blogsRouter = require('express').Router()
const { request, response } = require('express')
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  // Blog.find({}).then((blogs) => {
  //   response.json(blogs)
  // })

  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  if (body.title === undefined || body.url === undefined) {
    return response.status(400).end()
  }
  const likesValue = body.likes === undefined ? 0 : body.likes;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: likesValue,
  })

  // blog.save().then((result) => {
  //   response.status(201).json(result)
  // })

  const savedBlog = await blog.save()
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