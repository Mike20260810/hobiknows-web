const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const WAIT = 15000; // 마지막 변경 후 15초 대기

let timer = null;
let pushing = false;

function run(command) {
  return new Promise((resolve, reject) => {
    exec(
      command,
      {
        cwd: ROOT,
        windowsHide: true,
        maxBuffer: 1024 * 1024 * 10
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error(stderr || stdout);
          return reject(error);
        }

        resolve(stdout || stderr);
      }
    );
  });
}

async function pushChanges() {
  if (pushing) return;
  pushing = true;

  try {
    const status = await run("git status --porcelain");

    if (!status.trim()) {
      return;
    }

    console.log("\n변경사항 발견 → 자동 업데이트 시작");

    // 1. GitHub
    console.log("→ GitHub 업로드 중...");

    await run("git add -A");

    const now = new Date().toLocaleString("ko-KR");
    await run(`git commit -m "Auto update ${now}"`);

    await run("git push origin main");

    console.log("✓ GitHub 업로드 완료");

    // 2. Firebase Hosting
    console.log("→ Firebase Hosting 배포 중...");

    const deployResult = await run(
      "npx firebase-tools deploy --only hosting"
    );

    console.log(deployResult);
    console.log("✓ Firebase Hosting 배포 완료\n");

  } catch (error) {
    console.error("자동 업데이트 실패:", error.message);
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
console.log("파일 변경 후 15초가 지나면 GitHub + Firebase Hosting에 자동 반영됩니다.");
console.log("종료하려면 Ctrl+C\n");

fs.watch(
  ROOT,
  { recursive: true },
  (eventType, filename) => {
    if (!filename) return;

    const normalized = filename.replace(/\\/g, "/");

    // 자동 생성 파일은 감시 제외
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