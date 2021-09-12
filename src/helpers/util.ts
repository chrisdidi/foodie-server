import { KeywordsType } from 'src/restaurants/entities/restaurants.entity';

export const trimKeywords = (text: string) => {
  text = text.replace(/[^a-zA-Z ]/g, '').toLowerCase();
  const keywords = text.split(' ');
  const commonKeywords = [
    'this',
    'of',
    'is',
    'made',
    'make',
    'more',
    'many',
    'less',
    'we',
    'and',
    'without',
  ];
  const map = {};
  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    if (commonKeywords.includes(keyword)) {
      keywords.splice(i, 1);
      i = i - 1;
    } else {
      map[keyword] = map[keyword] ? map[keyword] + 1 : 1;
    }
  }
  return map;
};

export const extractAndCountKeywords = (
  original: KeywordsType,
  text: string,
  minus?: boolean,
) => {
  const keywords = trimKeywords(text);
  for (const keyword in keywords) {
    original[keyword] = original[keyword]
      ? minus
        ? original[keyword] - keywords[keyword] < 0
          ? 0
          : original[keyword] - keywords[keyword]
        : original[keyword] + keywords[keyword]
      : minus
      ? 0
      : keywords[keyword];
  }
  return original;
};
