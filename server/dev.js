// Runs the API on your computer: npm run server  ->  http://127.0.0.1:5000/api
import app from "./app.js";

const port = Number(process.env.PORT) || 5000;
app.listen(port, "127.0.0.1", () => console.log(`API running on http://127.0.0.1:${port}/api`));
