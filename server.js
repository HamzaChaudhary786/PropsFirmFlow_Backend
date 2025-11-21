// server.js
import cluster from "cluster";
import os from "os";
import dotenv from "dotenv";
dotenv.config();

// LOCAL MODE (Client mode) → no cluster
if (process.env.NODE_ENV === "Client") {
  console.log("⚠️ Local mode — starting single process...");
  await import("./index.js"); // start express normally
  // Do NOT use return or process.exit()
  // Just let the process continue running
} 

// PRODUCTION MODE (cluster for Render, GoDaddy, VPS)
else {
  if (cluster.isPrimary) {
    console.log(`🚀 Primary PID ${process.pid} started`);

    const numCPUs = os.cpus().length;

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker) => {
      console.log(`❌ Worker ${worker.process.pid} died — restarting...`);
      cluster.fork();
    });
  } else {
    await import("./index.js"); // Worker runs server
  }
}
