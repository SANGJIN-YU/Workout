// 빌드 시점에 data/ 와 content/ 를 읽는다. 항상 wellness-site/ 에서 실행된다고 가정한다.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
export const DATA_DIR = path.join(root, 'data');
export const COMMENTARY_DIR = path.join(root, 'content', 'commentary');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** 실제 데이터(data/foods.json)가 없으면 샘플 데이터를 사용한다. */
export function loadFoods() {
  const real = path.join(DATA_DIR, 'foods.json');
  const file = fs.existsSync(real) ? real : path.join(DATA_DIR, 'foods.sample.json');
  return readJson(file);
}

export function loadExercises() {
  return readJson(path.join(DATA_DIR, 'exercises.json'));
}

export function commentaryPath(type, slug) {
  return path.join(COMMENTARY_DIR, type, `${slug}.json`);
}

export function readCommentary(type, slug) {
  const file = commentaryPath(type, slug);
  return fs.existsSync(file) ? readJson(file) : null;
}

/** 사람이 승인(reviewed=true)한 해설문만 사이트에 노출한다. */
export function approvedCommentary(type, slug) {
  const c = readCommentary(type, slug);
  return c && c.reviewed === true ? c.text : null;
}

export function listCommentary() {
  const out = [];
  for (const type of ['food', 'compare']) {
    const dir = path.join(COMMENTARY_DIR, type);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith('.json')) continue;
      const file = path.join(dir, name);
      out.push({ type, slug: name.replace(/\.json$/, ''), file, ...readJson(file) });
    }
  }
  return out;
}

export function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n');
  fs.renameSync(tmp, file);
}
