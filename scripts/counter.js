const fs = require('fs');

const posts = fs.readdirSync('./_posts');

const firstDay2017 = (new Date('2017-01-01')).getTime();
const lastDay2017 = (new Date('2017-12-31')).getTime();

const fetchNameRegex = /name:(.(?!\\n))+/

const lastYearPosts = posts.filter(post => {
  const postMillis = new Date(post.substring(0, 10)).getTime();
  return postMillis >= firstDay2017 && postMillis <= lastDay2017;
});

const authors = [];
lastYearPosts.map(post => {
  const lines = fs.readFileSync(`./_posts/${post}`, 'utf-8')
    .split('\n')
    .map(line => (line.trim()))
    .filter((line, index) => {
        if (index >= 50) return false;
        return line.indexOf('name:') == 0 || line.indexOf('mail:') == 0
    });

  const name = lines[0].split("\"").join("");
  const mail = lines.length > 1 ? lines[1].split("\"").join("") : null;

  authors.push(`${name}; ${mail}`);
});

for (let i = 0; i < authors.length; i++) {
  if (authors[i].indexOf('auth0') < 0) {
    console.log(
      authors[i]
        .replace('name: ', '')
        .replace('mail:', '')
        .replace(';', ',')
        .trim()
        + ','
      );
  }
}

// function definitions

function getPostDate(post) {
  return ;
}
