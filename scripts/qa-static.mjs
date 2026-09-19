import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
const all = await fs.readdir(root, { recursive: true });
const html = all.filter((f) => f.endsWith('.html'));
const docs = new Map();
const report = {
  pages: html.length,
  links: 0,
  fragments: 0,
  errors: [],
  titles: [],
  descriptions: [],
  canonicals: [],
};
const attrs = (s, key) =>
  [...s.matchAll(new RegExp('\\b' + key + '=(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'g'))].map(
    (m) => m[1] ?? m[2] ?? m[3],
  );
for (const file of html) {
  const text = await fs.readFile(path.join(root, file), 'utf8');
  docs.set(file.replaceAll('\\', '/'), { text, ids: new Set(attrs(text, 'id')) });
}
for (const [file, { text }] of docs) {
  const title = text.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  const metas = [...text.matchAll(/<meta\b[^>]*>/g)].map((m) => m[0]);
  const description = metas.find((m) => attrs(m, 'name')[0] === 'description');
  const canonical = [...text.matchAll(/<link\b[^>]*>/g)]
    .map((m) => m[0])
    .find((m) => attrs(m, 'rel')[0] === 'canonical');
  report.titles.push(title);
  report.descriptions.push(description && attrs(description, 'content')[0]);
  report.canonicals.push(canonical && attrs(canonical, 'href')[0]);
  if (!title || !description || !canonical) report.errors.push({ file, missingMetadata: true });
  for (const script of text.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  )) {
    try {
      JSON.parse(script[1]);
    } catch {
      report.errors.push({ file, invalidJSONLD: true });
    }
  }
  for (const href of attrs(text, 'href')) {
    if (!href.startsWith('/') && !href.startsWith('#')) continue;
    report.links++;
    const [url, hash] = href.split('#');
    let target = url ? decodeURIComponent(url).slice(1) : file;
    if (!target || target.endsWith('/')) target += 'index.html';
    try {
      await fs.access(path.join(root, target));
    } catch {
      report.errors.push({ file, missing: href });
      continue;
    }
    if (hash) {
      report.fragments++;
      const doc = docs.get(target);
      if (doc && !doc.ids.has(decodeURIComponent(hash)))
        report.errors.push({ file, missingFragment: href });
    }
  }
}
for (const key of ['titles', 'descriptions', 'canonicals'])
  if (new Set(report[key]).size !== report.pages) report.errors.push({ duplicate: key });
await fs.writeFile('artifacts/qa-static-v5.json', JSON.stringify(report, null, 2));
console.log({
  pages: report.pages,
  links: report.links,
  fragments: report.fragments,
  errors: report.errors,
});
if (report.errors.length) process.exitCode = 1;
