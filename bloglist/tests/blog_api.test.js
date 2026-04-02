const assert = require('node:assert')
const { test, after, beforeEach } = require('node:test');
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')

const api = supertest(app)



beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('verify the unique identifier property of blogs is named id', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body;
    let allHaveId = true
    for (let blog of blogs) {
        if (!blog.hasOwnProperty('id')) {
            allHaveId = false
            break
        }
    }
    assert.strictEqual(allHaveId, true)

})


test('a valid blog can be added', async () => {

    const newBlog = {
        title: "My Journey from Upskilling to My First Code Contribution to Mozilla Firefox",
        author: "Sameeksha",
        url: "https://reactpatterns.com/",
        likes: 7
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
    assert(titles.includes('My Journey from Upskilling to My First Code Contribution to Mozilla Firefox'))
})

test('verify likes property default set to 0', async () => {
    const newBlog = {
        title: "Blog wihtout likes",
        author: "Sameeksha",
        url: "https://reactpatterns.com/"
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const createdBlog  = response.body.find(blog => blog.title === "Blog wihtout likes")

    assert.strictEqual(createdBlog.likes, 0)
})


test('verify if title or url are missing it responsed with 400 Bad Request', async () => {
    const newBlog = {
        author: "Sameeksha",
        likes: 7
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

})

test('a blog can be deleted', async() => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    const ids = blogsAtEnd.map(b => b.id)
    assert(!ids.includes(blogToDelete.id))

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
})


test('a blog likes can be updated', async () => {
  const blogsAtStart = await api.get('/api/blogs')
  const blogToUpdate = blogsAtStart.body[0]

  const updatedBlog = {
    title: blogToUpdate.title,
    author: blogToUpdate.author,
    url: blogToUpdate.url,
    likes: blogToUpdate.likes + 1
  }

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect(200)

  const blogsAtEnd = await api.get('/api/blogs')
  const result = blogsAtEnd.body.find(b => b.id === blogToUpdate.id)

  assert.strictEqual(result.likes, blogToUpdate.likes + 1)
})

after(async () => {
    await mongoose.connection.close()
})