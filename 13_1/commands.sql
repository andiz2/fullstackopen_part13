-- Insert a new blog
INSERT INTO blogs (author, url, title, likes)
VALUES (:author, :url, :title, :likes)
RETURNING *;

-- Select all blogs
SELECT * FROM blogs;
