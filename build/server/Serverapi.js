import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());

app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});

app.use(express.json());


//Curl command for get request: curl localhost:3000/log-data
try {
   app.get('/log-data', (req, res) => {
      res.send("nothing to get at log-data")

   })
} catch (e) {
   console.log("Could not get. Error: " + e)
}

//Curl command for test post request: curl -d "key1=value&key2=value2" localhost:3000/log-data
try {
app.post('/log-data', (req, res) => {
   const eventData = req.body;
   console.log('Received event data:', req.body);
   /*res.send({
    message: 'Data received',
   });*/
   res.json({ status : "ok"});
});
} catch (e) {
   console.log("Post error: " + e);
}

