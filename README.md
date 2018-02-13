## Auth0 Blog for Guest Authors

This repository exists to support Guest Authors. To become a guest author, please, apply through [the Guest Author Program webpage](https://auth0.com/guest-authors). The process is simple and fully described in this page.

### Frequently Asked Questions (FAQs)

The following list shows FAQs and links to their answers:

- [After being selected, what is the process of writing articles to Auth0?](https://github.com/auth0-blog/guest-writer/blob/master/faq/process.md)
- [What is important to note when writing articles to Auth0?](https://github.com/auth0-blog/guest-writer/blob/master/faq/tips-about-writing.md)
- [Is there a specific deadline?](https://github.com/auth0-blog/guest-writer/blob/master/faq/deadline.md)

### Useful Commands

Before executing the commands shown below, please, be sure that [Docker](https://www.docker.com/community-edition) and [Node.js](https://nodejs.org/) are properly installed and that both `docker` and `node` commands are available.

1. Check that Docker is available: `docker --version`;
2. Check that Node.js is available: `node --version`;
3. To create a new article, issue the following command: `node src`;
4. To see how your article will look in our blog, issue the following command: `node src/docker`;

The blog engine might take a few seconds to start and generate the articles (usually less than 10 seconds). After started, we can check the blog at [`http://localhost:4000/blog/`](http://localhost:4000/blog/) (note that the trailing slash is mandatory).

> __Important!!!__ The trailing slash is mandatory. This means that `http://localhost:4000/blog` won't work. You do have to go to [`http://localhost:4000/blog/`](http://localhost:4000/blog/).
