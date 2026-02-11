import express from 'express';
const app = express();

app.use(json());

app.post('/log-data', (req, res) => {
   const eventData = req.body;
   console.log('Received event data:', eventData);
   res.json({ status : "ok"});
});

app.get('/helloworld', (req, res) => {
   res.json({ message: "Hello World!" });
});


const PORT = 8080;
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});
