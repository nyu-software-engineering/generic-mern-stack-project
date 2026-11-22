import app from "./app.mjs";
import "dotenv/config";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`server is listening on http://localhost${PORT}`);
});
