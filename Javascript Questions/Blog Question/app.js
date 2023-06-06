// Fetch data from the API
fetch('https://jsonplaceholder.typicode.com/posts')
    .then(response => response.json())
    .then(data => {
        // Display the blog posts on the UI
        const blogContainer = document.getElementById('blogContainer');

        data.forEach(blog => {
            const blogElement = document.createElement('div');
            blogElement.innerHTML = `
        <h2>${blog.title}</h2>
        <p>${blog.body}</p>
        <button class="deleteButton" data-id="${blog.id}">Delete</button>
      `;

            blogContainer.appendChild(blogElement);
        });

        // Attach event listeners for delete buttons
        const deleteButtons = document.getElementsByClassName('deleteButton');
        Array.from(deleteButtons).forEach(button => {
            button.addEventListener('click', deleteBlog);
        });
    });

// Function to add a new blog
function addBlog(event) {
    event.preventDefault();

    const titleInput = document.getElementById('titleInput');
    const contentInput = document.getElementById('contentInput');

    const newBlog = {
        title: titleInput.value,
        body: contentInput.value,
    };

    // Send a POST request to the API
    fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBlog),
    })
        .then(response => response.json())
        .then(blog => {
            // Display the new blog on the UI
            const blogContainer = document.getElementById('blogContainer');

            const blogElement = document.createElement('div');
            blogElement.innerHTML = `
        <h2>${blog.title}</h2>
        <p>${blog.body}</p>
        <button class="deleteButton" data-id="${blog.id}">Delete</button>
      `;

            blogContainer.appendChild(blogElement);

            // Attach event listener for the delete button
            const deleteButton = blogElement.querySelector('.deleteButton');
            deleteButton.addEventListener('click', deleteBlog);

            // Reset the form inputs
            titleInput.value = '';
            contentInput.value = '';
        });
}

// Function to delete a blog
function deleteBlog(event) {
    const blogId = event.target.dataset.id;

    // Send a DELETE request to the API
    fetch(`https://jsonplaceholder.typicode.com/posts/${blogId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                // Remove the blog post from the UI
                const blogElement = event.target.parentNode;
                blogElement.remove();
            }
        });
}

// Event listener for the form submit
const addBlogForm = document.getElementById('addBlogForm');
addBlogForm.addEventListener('submit', addBlog);