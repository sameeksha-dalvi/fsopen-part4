const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test');
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)



beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)

    const user = new User({
        username: 'root',
        passwordHash,
    })

    const savedUser = await user.save()

    const blogs = helper.initialBlogs.map(blog => ({
        ...blog,
        user: savedUser._id
    }))

    await Blog.insertMany(blogs)
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

    const loginResponse = await api
        .post('/api/login')
        .send({
            username: 'root',
            password: 'sekret'
        })

    const token = loginResponse.body.token

    const newBlog = {
        title: "My Journey from Upskilling to My First Code Contribution to Mozilla Firefox",
        author: "Sameeksha",
        url: "https://reactpatterns.com/",
        likes: 7
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
    assert(titles.includes('My Journey from Upskilling to My First Code Contribution to Mozilla Firefox'))
})

test('verify likes property default set to 0', async () => {

    const loginResponse = await api
        .post('/api/login')
        .send({
            username: 'root',
            password: 'sekret'
        })

    const token = loginResponse.body.token

    const newBlog = {
        title: "Blog wihtout likes",
        author: "Sameeksha",
        url: "https://reactpatterns.com/"
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const createdBlog = response.body.find(blog => blog.title === "Blog wihtout likes")

    assert.strictEqual(createdBlog.likes, 0)
})


test('verify if title or url are missing it responsed with 400 Bad Request', async () => {

    const loginResponse = await api
        .post('/api/login')
        .send({
            username: 'root',
            password: 'sekret'
        })

    const token = loginResponse.body.token

    const newBlog = {
        author: "Sameeksha",
        likes: 7
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)

})

test('a blog can be deleted', async () => {

    const loginResponse = await api
        .post('/api/login')
        .send({
            username: 'root',
            password: 'sekret'
        })

    const token = loginResponse.body.token

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    const ids = blogsAtEnd.map(b => b.id)
    assert(!ids.includes(blogToDelete.id))

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
})

test('adding a blog fails with the proper status code 401 Unauthorized if a token is not provided', async () => {
  const blogsAtStart = await helper.blogsInDb()

  const newBlog = {
    title: 'Unauthorized blog',
    author: 'Sam',
    url: 'https://xyz.com/',
    likes: 4
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)

  const blogsAtEnd = await helper.blogsInDb()

  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
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




describe('when there is initially one user in database', () => {

    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDB()

        const newUser = {
            username: 'mani',
            name: 'Mani T',
            password: 'bangda'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDB()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))
    })

    test('user creation fails with proper statuscode and message if username is already taken', async () => {

        const usersAtStart = await helper.usersInDB()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDB()
        assert(result.body.error.includes('expected `username` to be unique'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)


    })

    test('user creation fails if username is less than 3 char', async () => {
        const usersAtStart = await helper.usersInDB()

        const newUser = {
            username: 'ab',
            name: 'Too Short',
            password: 'validpass'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        assert(result.body.error.includes('username'))
        const usersAtEnd = await helper.usersInDB()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('user creation fails if password is too short', async () => {
        const usersAtStart = await helper.usersInDB()

        const newUser = {
            username: 'validuser',
            name: 'No Password',
            password: 'ab'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        assert(result.body.error.includes('password'))

        const usersAtEnd = await helper.usersInDB()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
})

after(async () => {
    await mongoose.connection.close()
})