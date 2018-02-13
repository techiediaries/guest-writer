const fs = require('fs');

// regex to recognize regular blocks of code (i.e. starting and ending with ```)
const regex = /```\w*[\n.+]([^`]((\\*|.+)\s+))*```/g

// regex to recognize html blocks
const regex2 = /{% highlight html %}[\n\D\d]+?{% endhighlight %}/g

if (!process.argv[2]) {
  console.log('Please, inform what file you want to clean (just pass it as an argument to this script).');
  process.exit(1);
}

fs.readFile(process.argv[2], 'utf8', function(err, data) {
  let cleanArticle = data;

  const blocksOfCode = data.match(regex) || [];
  console.log(`${blocksOfCode.length} blocks of code found.`);
  blocksOfCode.forEach((block) => {
    cleanArticle = cleanArticle.replace(block, '');
  });

  const blocksOfHtml = data.match(regex2) || [];
  console.log(`${blocksOfHtml.length} blocks of HTML found.`);
  blocksOfHtml.forEach((block) => {
    cleanArticle = cleanArticle.replace(block, '');
  });

  fs.writeFile(`${process.argv[2]}.clear.txt`, cleanArticle, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
});
