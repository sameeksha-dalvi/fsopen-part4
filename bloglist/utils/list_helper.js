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

module.exports = {
  dummy, totalLikes, favoriteBlog
}