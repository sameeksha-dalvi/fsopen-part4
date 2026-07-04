const blogsRouter = require('express').Router()
const { request, response } = require('express')
const Blog = require('../models/blog')
const User = require('../models/user')

const jwt = require('jsonwebtoken')
const { userExtractor } = require('../utils/middleware')
// const getTokenFrom = request =>{
//   const authorization = request.get('authorization')
//   if(authorization && authorization.startsWith('Bearer ')){
//     return authorization.replace('Bearer ','')
//   }
//   return null
// }

blogsRouter.get('/', async (request, response) => {
  // Blog.find({}).then((blogs) => {
  //   response.json(blogs)
  // })

  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body

  // const decodeToken = jwt.verify(request.token, process.env.SECRET)

  // if (!decodeToken.id) {
  //   return response.status(401).json({ error: 'token invalid' })
  // }

  const user = request.user;

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

blogsRouter.delete('/:id', userExtractor,async (request, response) => {

  // const decodeToken = jwt.verify(request.token, process.env.SECRET)
  // if (!decodeToken.id) {
  //   return response.status(401).json({ error: 'token invalid cannot delete blog' })
  // }

  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }


  if (blog.user.toString() === request.user.id.toString()) {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } else {
    return response.status(401).json({ error: 'invalid user cannot delete blog' })
  }


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