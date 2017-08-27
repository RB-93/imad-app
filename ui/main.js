// Submit username/password to login 

var submit = document.getElementById('submit_btn');
submit.onclick = function (){
    
    // Create a request object
    var request = new XMLHttpRequest();
    
    // Capture the response and stotre it in a variable.
    request.onreadystatechange = function () {
        if(request.readyState === XMLHttpRequest.DONE) {
            // Take some action
            if(request.status === 200) {
                // Capture a list of names and render it as a list.
                console.log('user logged in');
                alert('Logged in sucessfully');
            }
            else if(request.status === 403) {
                alert('Username/password in incorrect');
            }
            else if(request.status === 500) {
                alert('Something wrong went on the server');
            }
        }
        //not done yet
    };
    // Make the request
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    console.log(username);
    console.log(password);
    request.open('POST', 'http://rohitbhargava586.imad.hasura-app.io/login', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({username: username, password: password}));
};
