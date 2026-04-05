const babel = require('@babel/core');
const fs = require('fs');

const code = fs.readFileSync('js/components/pages/FeedPage.js', 'utf8');
const transformed = babel.transformSync(code, {
  filename: 'FeedPage.js',
  presets: ['@babel/preset-react', '@babel/preset-env']
}).code;

const stripped = transformed.replace('"use strict";', '');

// Manually export all top-level functions to global
const exporter = `
${stripped}
if (typeof FeedPage !== 'undefined') global.FeedPage = FeedPage;
if (typeof PostCreator !== 'undefined') global.PostCreator = PostCreator;
if (typeof FeedPost !== 'undefined') global.FeedPost = FeedPost;
if (typeof SponsoredPost !== 'undefined') global.SponsoredPost = SponsoredPost;
if (typeof TruncatedText !== 'undefined') global.TruncatedText = TruncatedText;
`;

const runner = new Function('global', exporter);
runner(global);

console.log('FeedPage:', typeof global.FeedPage);
console.log('PostCreator:', typeof global.PostCreator);
console.log('FeedPost:', typeof global.FeedPost);