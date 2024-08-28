import express from 'express';
import routes from './routes';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';


const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());


app.use(express.json());
app.use('/api', routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;