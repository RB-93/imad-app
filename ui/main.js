// Counter Code
var button = document.getElementbyId('counter');
button.onclick = function () {
    // Make a request to the counter endpoint
    
    // Capture the response and stotre it in a variable.
    
    // Render the variable in correct span
    
    counter = counter + 1;
    var span = document.getElementById('counter');
    span.innerHTML = counter.toString();
    
};
