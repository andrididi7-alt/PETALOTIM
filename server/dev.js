import { spawn } from "node:child_process";

const isWin = process.platform === "win32";
const npxCmd = isWin ? "npx.cmd" : "npx";

console.log("\n=======================================================");
console.log(" Menjalankan PETA-LOTIM (Backend API + Frontend Dev)");
console.log("=======================================================\n");

const backend = spawn("node", ["server/index.js"], { stdio: "inherit", shell: isWin });
const frontend = spawn(npxCmd, ["vite", "--host", "127.0.0.1"], { stdio: "inherit", shell: isWin });

function cleanup() {
  try {
    backend.kill();
    frontend.kill();
  } catch {}
  process.exit();
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
