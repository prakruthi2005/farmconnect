function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Login successful') {
            document.getElementById('login-page').classList.add('hidden');
            document.getElementById('store-page').classList.remove('hidden');
            // Optionally store the user data
            console.log(data.user);
        } else {
            alert('Invalid username or password');
        }
    })
    .catch(error => console.error('Error:', error));
}
