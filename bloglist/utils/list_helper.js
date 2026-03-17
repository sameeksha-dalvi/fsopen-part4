const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) =>{
    const result = blogs.reduce((total,current) =>{
        return total + current.likes
    },0)

    return result
}

module.exports = {
  dummy, totalLikes
}