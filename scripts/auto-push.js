const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const WAIT = 15000; // 마지막 변경 후 15초 대기

let timer = null;
let pushing = false;

function run(command) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: ROOT }, (error, stdout, stderr) => {
      if (error) return reject(error);
      resolve(stdout || stderr);
    });
  });
}

async function pushChanges() {
  if (pushing) return;
  pushing = true;

  try {
    const status = await run("git status --porcelain");

    if (!status.trim()) {
      pushing = false;
      return;
    }

    console.log("\n변경사항 발견 → GitHub 자동 업로드 시작");

    await run("git add -A");

    const now = new Date().toLocaleString("ko-KR");
    await run(`git commit -m "Auto update ${now}"`);

    await run("git push origin main");

    console.log("✓ GitHub 업로드 완료");
    console.log("✓ Firebase 자동배포가 이어서 실행됩니다.\n");
  } catch (error) {
    console.error("자동 업로드 실패:", error.message);
  } finally {
    pushing = false;
  }
}

function schedulePush() {
  clearTimeout(timer);

  timer = setTimeout(() => {
    pushChanges();
  }, WAIT);
}

console.log("HOBIKNOWS Auto Push 실행 중");
console.log("파일 변경 후 15초가 지나면 자동으로 GitHub에 업로드합니다.");
console.log("종료하려면 Ctrl+C\n");

fs.watch(
  ROOT,
  { recursive: true },
  (eventType, filename) => {
    if (!filename) return;

    const normalized = filename.replace(/\\/g, "/");

    if (
      normalized.startsWith(".git/") ||
      normalized.startsWith("node_modules/") ||
      normalized.includes(".firebase/") ||
      normalized.endsWith("firebase-debug.log")
    ) {
      return;
    }

    schedulePush();
  }
);