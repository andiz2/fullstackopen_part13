require('dotenv').config()

const { Sequelize, Model, DataTypes, QueryTypes  } = require('sequelize')
const express = require('express')
const app = express()
app.use(express.json());
const fs = require('fs');

// Read the SQL queries from commands.sql
const sqlQueries = fs.readFileSync('commands.sql', 'utf8').split(';');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
});


class Blog extends Model {}
Blog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  author: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // Set default value to 0
  }
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  modelName: 'blogs'
})

const main = async () => {
    try {
      await sequelize.authenticate()
      await Blog.sync(); // Sync the model with the database
    } catch (error) {
      console.error('Unable to connect to the database:', error)
    }
  }
  
  main()

app.get('/api/blogs', async (req, res) => {

    // Execute the named SQL query to select all blogs
    const blogs = await sequelize.query(sqlQueries[1], { 
      type: QueryTypes.SELECT,
      mapToModel: true,
      model: Blog
    })
    .then((blogs) => {
      console.log('All blogs:', JSON.stringify(blogs, null, 2));
      res.json(blogs)
    })
    .catch((error) => {
      console.error('Error selecting all blogs:', error);
      res.status(500).json({ error: 'Internal server error' });
    })
  //const blogs = await Blog.findAll()
})

app.get('/api/blogs/:id', async (req, res) => {
  const blog = await Blog.findByPk(req.params.id)
  if (blog) {
    console.log(blog.toJSON())
    res.json(blog)
  } else {
    res.status(404).end()
  }
})

app.put('/api/blogs/:id', async (req, res) => {
  const blog = await Blog.findByPk(req.params.id)
  if (blog) {
    blog.likes = req.body.likes
    blog.author = req.body.author
    blog.title = req.body.title
    await blog.save()
    res.json(blog)
  } else {
    res.status(404).end()
  }
})


// DELETE API endpoint to delete a specific blog by its ID
app.delete('/api/blogs/:id', async (req, res) => {
  const blogId = req.params.id;

  try {
      // Use Sequelize to delete the blog based on the provided ID
      const deletedBlogCount = await Blog.destroy({
          where: {
              id: blogId
          }
      });

      if (deletedBlogCount === 1) {
          // Blog successfully deleted
          res.status(204).send(); // 204 No Content
      } else {
          // Blog with the provided ID not found
          res.status(404).json({ error: 'Blog not found' });
      }
  } catch (error) {
      // Error occurred while deleting the blog
      console.error('Error deleting blog:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/blogs', async (req, res) => {
    console.log(req.body)
    // Execute the named SQL query to insert a new blog
    const blog = await sequelize.query(sqlQueries[0], {
        replacements: {
            author: req.body.author,
            url: req.body.url,
            title: req.body.title,
            likes: req.body.likes || 0
        },
        type: QueryTypes.INSERT,
    })
    .then((result) => {
        const insertedBlog = result[0][0]; // Extract the inserted blog from the result
        console.log('New blog inserted successfully:', insertedBlog);
    })
    .catch((error) => {
        console.error('Error inserting new blog:', error);
    });
    //const blog = await Blog.create(req.body)
    res.json(blog)
  })

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})