// 생성된 해설문을 사람이 하나씩 확인한다. 승인된 것만 사이트에 노출된다.
//   npm run review
import fs from 'node:fs';
import readline from 'node:readline/promises';
import { listCommentary, writeJsonAtomic } from '../src/lib/data.mjs';

const pending = listCommentary().filter((c) => c.reviewed !== true);
if (!pending.length) {
  console.log('검토할 해설문이 없습니다.');
  process.exit(0);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let approved = 0;
let removed = 0;
for (const [i, c] of pending.entries()) {
  console.log(`\n── [${i + 1}/${pending.length}] ${c.type}/${c.slug} ──\n${c.text}\n`);
  const answer = (await rl.question('y=승인  n=삭제(다음 배치 때 재생성)  s=건너뛰기  q=종료 > ')).trim().toLowerCase();
  if (answer === 'q') break;
  if (answer === 'y') {
    const { type, slug, file, ...data } = c;
    writeJsonAtomic(file, { ...data, reviewed: true, reviewedAt: new Date().toISOString() });
    approved++;
  } else if (answer === 'n') {
    fs.unlinkSync(c.file);
    removed++;
  }
}
rl.close();
console.log(`\n승인 ${approved}건, 삭제 ${removed}건. 승인한 내용은 git commit 후 push 하면 배포됩니다.`);
