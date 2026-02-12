/*import http from 'http';
import fs from 'fs';
const PORT = 3000;

const server = http.createServer(function(req, res) {
    /* Below is basically a get function, it fetches the html page log-data */
    /*res.writeHead(200, { 'Content-Type': 'text/html'})
    fs.readFile('./log-data.html', function(error, data) {
        if (error) {
            res.writeHead(404)
            res.write('Error: File not found')
        } else {
            res.write(data)
            //this data is data on the webpage, could be used to send to database
        }
        res.end()
    });
});

server.listen(PORT, function (error) {
    if (error) {
        console.log('Cannot listen on port', error);
    } else {
        console.log('Server is listening on port ' + PORT);
    }
});
*/