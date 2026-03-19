import app from "./app";

async function startServer() {
  try {
    app.listen(3000, () => {
      // eslint-disable-next-line no-console
      console.log("server running on port 3000");
    });
  }
  catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

startServer();
