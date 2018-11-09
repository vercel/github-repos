const fetch = require('node-fetch');
const ms = require('ms');

let cache = null;

const slack = (text, id) => {
  fetch(`https://hooks.slack.com/services/${id}`, {
    method: 'POST',
    body: JSON.stringify({ text })
  });
};

const log = text => slack(text, process.env.TOKEN_EVENTS);
const logError = text => slack(text, process.env.TOKEN_ALERTS);

const getData = async () => {
  const start = Date.now();

  const response = await fetch(
    'https://api.github.com/orgs/zeit/repos?per_page=100',
    {
      headers: {
        Accept: 'application/vnd.github.preview'
      }
    }
  );

  if (response.status !== 200) {
    logError(`Non-200 response code from GitHub: ${response.status}`);
    return null;
  }

  const parsed = await response.json();

  // Ugly hack because github sometimes doesn't return
  // all the right search results :|
  let featured = 0;

  parsed.forEach(({ name }) => {
    if (name === 'hyper' || name === 'next.js' || name === 'micro') {
      featured += 1;
    }
  });

  if (featured !== 3) {
    logError(`Error: GitHub did not include all projects (${featured})`);
    return null;
  }

  /* eslint-disable camelcase */
  const final = parsed
    .filter(repo => !repo.archived)
    .map(({ name, description, stargazers_count, html_url }) => ({
      name,
      description,
      url: html_url,
      stars: stargazers_count
    }))
    .sort((p1, p2) => p2.stars - p1.stars);
  /* eslint-enable camelcase */

  log(
    `Re-built projects cache. ` +
      `Total: ${final.length} public ZEIT projects. ` +
      `Elapsed: ${new Date() - start}ms`
  );

  return {
    list: final,
    lastUpdate: Date.now()
  };
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (!cache || Date.now() - cache.lastUpdate > ms('5m')) {
    cache = await getData();
  }

  res.end(JSON.stringify(cache.list));
};
