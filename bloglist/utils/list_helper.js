const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) =>{
    const result = blogs.reduce((total,current) =>{
        return total + current.likes
    },0)

    return result
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  return blogs.reduce((prev, current) => {
    return (prev.likes > current.likes) ? prev : current
  })
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const authorCounts = {}

  blogs.forEach(blog => {
    if (authorCounts[blog.author]) {
      authorCounts[blog.author] += 1
    } else {
      authorCounts[blog.author] = 1
    }
  })

  let maxBlogs = 0
  let maxAuthor = ''

  for (const author in authorCounts) {
    if (authorCounts[author] > maxBlogs) {
      maxBlogs = authorCounts[author]
      maxAuthor = author
    }
  }

  return { author: maxAuthor, blogs: maxBlogs }
}


const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const authorLikes = {}

  blogs.forEach(blog => {
    if (authorLikes[blog.author]) {
      authorLikes[blog.author] += blog.likes
    } else {
      authorLikes[blog.author] = blog.likes
    }
  })


  let maxLikes = 0
  let maxAuthor = ''

  for (const author in authorLikes) {
    if (authorLikes[author] > maxLikes) {
      maxLikes = authorLikes[author]
      maxAuthor = author
    }
  }

  return { author: maxAuthor, likes: maxLikes }
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}