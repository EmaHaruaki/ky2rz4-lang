const pageData = require('./teachar.json');

export function getPageData(sex, lang) {
  return pageData.find(p => p.sex === sex && p.lang === lang) || null;
}