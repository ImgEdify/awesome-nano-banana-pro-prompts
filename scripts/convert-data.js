const fs = require('fs');

// 读取 D1 API 响应
const rawData = JSON.parse(fs.readFileSync('raw_response.json', 'utf8'));
const prompts = rawData.result?.[0]?.results || [];

console.log(`Processing ${prompts.length} prompts...`);

// 转换为干净的 JSON 格式
const cleanPrompts = prompts.map(p => ({
  id: p.id,
  title: p.title,
  prompt: p.prompt,
  author: p.author,
  author_url: p.author_url,
  source_url: p.source_url,
  images: JSON.parse(p.images || '[]'),
  language: p.language,
  category: p.category,
  tags: JSON.parse(p.tags || '[]'),
  style: p.style,
  description: p.description,
  created_at: p.created_at
}));

// 确保 data 目录存在
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

// 写入 JSON
fs.writeFileSync('data/prompts.json', JSON.stringify(cleanPrompts, null, 2));
console.log(`Written data/prompts.json (${cleanPrompts.length} prompts)`);

// 生成 JSON-LD (Schema.org)
const jsonld = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Awesome Nano Banana Pro Prompts",
  "description": "A curated collection of high-quality prompts for Nano Banana Pro AI image generation",
  "url": "https://github.com/ImgEdify/awesome-nano-banana-pro-prompts",
  "license": "https://opensource.org/licenses/MIT",
  "dateModified": new Date().toISOString().split('T')[0],
  "creator": {
    "@type": "Organization",
    "name": "ImgEdify",
    "url": "https://imgedify.com"
  },
  "distribution": {
    "@type": "DataDownload",
    "encodingFormat": "application/json",
    "contentUrl": "https://raw.githubusercontent.com/ImgEdify/awesome-nano-banana-pro-prompts/main/data/prompts.json"
  },
  "hasPart": cleanPrompts.slice(0, 100).map(p => ({  // 只包含前100条避免文件过大
    "@type": "CreativeWork",
    "identifier": p.id,
    "name": p.title,
    "author": {
      "@type": "Person",
      "name": p.author,
      "url": p.author_url
    },
    "inLanguage": p.language,
    "genre": p.category,
    "dateCreated": p.created_at
  }))
};

fs.writeFileSync('data/prompts.jsonld', JSON.stringify(jsonld, null, 2));
console.log('Written data/prompts.jsonld');

// 更新 README 中的统计数据
const readmePath = 'README.md';
if (fs.existsSync(readmePath)) {
  let readme = fs.readFileSync(readmePath, 'utf8');
  readme = readme.replace(
    /\*\*Total Prompts\*\*: [\d,]+\+/,
    `**Total Prompts**: ${cleanPrompts.length.toLocaleString()}+`
  );
  fs.writeFileSync(readmePath, readme);
  console.log('Updated README.md stats');
}

console.log('Done!');
