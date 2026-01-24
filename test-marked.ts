import { marked } from 'marked';

try {
  const html = marked.parse("**Hello**");
  console.log("Marked works:", html);
} catch (e) {
  console.error("Marked failed:", e);
}
