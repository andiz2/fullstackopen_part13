const axios = require('axios');

async function fetchBlogs() {
  try {
    const response = await axios.get('http://localhost:3001/api/blogs');
    return response.data;
  } catch (error) {
    console.error('Error fetching blogs:', error.message);
    return [];
  }
}

async function displayBlogs() {
  console.log('Executing (default): SELECT * FROM blogs');
  const blogs = await fetchBlogs();
  if (Array.isArray(blogs)) {
    blogs.forEach(blog => {
      console.log(`${blog.author}: '${blog.title}', ${blog.likes} likes`);
    });
  } else {
    console.error('Error: Invalid response format');
  }
}

displayBlogs();
