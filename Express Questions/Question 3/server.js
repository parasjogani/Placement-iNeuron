const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/blogapp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });

// Define the blog schema
const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
});

// Create a model based on the schema
const Blog = mongoose.model('Blog', blogSchema);

// Create a new blog
app.post('/blogs', (req, res) => {
    const { title, content } = req.body;

    const newBlog = new Blog({
        title,
        content,
    });

    newBlog.save()
        .then((blog) => {
            res.json(blog);
        })
        .catch((err) => {
            res.status(500).json({ error: 'Failed to create blog' });
        });
});

// Get all blogs
app.get('/blogs', (req, res) => {
    Blog.find()
        .then((blogs) => {
            res.json(blogs);
        })
        .catch((err) => {
            res.status(500).json({ error: 'Failed to retrieve blogs' });
        });
});

// Get a specific blog
app.get('/blogs/:id', (req, res) => {
    const { id } = req.params;

    Blog.findById(id)
        .then((blog) => {
            if (!blog) {
                res.status(404).json({ error: 'Blog not found' });
            } else {
                res.json(blog);
            }
        })
        .catch((err) => {
            res.status(500).json({ error: 'Failed to retrieve blog' });
        });
});

// Update a blog
app.put('/blogs/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    Blog.findByIdAndUpdate(id, { title, content }, { new: true })
        .then((blog) => {
            if (!blog) {
                res.status(404).json({ error: 'Blog not found' });
            } else {
                res.json(blog);
            }
        })
        .catch((err) => {
            res.status(500).json({ error: 'Failed to update blog' });
        });
});

// Delete a blog
app.delete('/blogs/:id', (req, res) => {
    const { id } = req.params;

    Blog.findByIdAndRemove(id)
        .then((blog) => {
            if (!blog) {
                res.status(404).json({ error: 'Blog not found' });
            } else {
                res.json({ message: 'Blog deleted successfully' });
            }
        })
        .catch((err) => {
            res.status(500).json({ error: 'Failed to delete blog' });
        });
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
