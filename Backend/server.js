const dotenv = require("dotenv");
const connectDB = require('./config/db')
const app = require('./app');


dotenv.config();


connectDB();

const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
