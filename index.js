const fetch = require('node-fetch')
const ms = require('ms')

let data = []

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  return data
}

// Cache data now and every X ms
cacheData()
setInterval(cacheData, ms('15m'))

function log(text) {
  return slack(text, process.env.TOKEN_EVENTS)
}

function logError(text) {
  return slack(text, process.env.TOKEN_ALERTS)
}

function slack(text, id) {
  fetch(`https://hooks.slack.com/services/${id}`, {
    method: 'POST',
    body: JSON.stringify({text})
  })
}

function cacheData() {
  const start = Date.now()
  fetch('https://api.github.com/orgs/zeit/repos?per_page=100', {
    headers: {
      Accept: 'application/vnd.github.preview'
    }
  })
  .then(res => {
    if (res.status !== 200) {
      return logError('Non-200 response code from GitHub: ' + res.status)
    }
    return res.json()
  })
  .then(data_ => {
    if (!data_) {
      return
    }

    // Ugly hack because github sometimes doesn't return
    // all the right search results :|
    let featured = 0
    data_.forEach(({name}) => {
      if (name === 'hyper' || name === 'next.js' || name === 'micro') {
        featured++
      }
    })

    if (featured !== 3) {
      return logError(`Error: GitHub did not include all projects (${featured})`)
    }

    data = data_.map(({name, description, stargazers_count, html_url}) => ({
      name,
      description,
      url: html_url,
      stars: stargazers_count
    })).sort((p1, p2) =>
      p2.stars - p1.stars
    )

    log(`Re-built projects cache. ` +
        `Total: ${data.length} public ▲ZEIT projects. ` +
        `Elapsed: ${(new Date() - start)}ms`)
  })
  .catch(err => {
    logError('Error parsing response from GitHub: ' + err.stack)
  })
}
