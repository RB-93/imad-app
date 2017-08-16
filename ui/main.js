// Counter Code
var button = document.getElementById('counter');

button.onclick = function () {
    // Make a request to the counter endpoint
    var request = new XMLHttpRequest();
    // Capture the response and stotre it in a variable.
    request.onreadystatechange = function () {
        if(request.readyState === XMLHttpRequest.DONE) {
            // Take some action
            if(request.status === 200) {
                var counter = request.responseText;
                // Render the variable in correct span
                var span = document.getElementById('count');
                span.innerHTML = counter.toString();
            }
        }
        //not done yet
    };
    // Make the request
    
    request.open('GET', 'http://rohitbhargava586.imad.hasura-app.io/counter', true);
    request.send(null);
    
};
