const fetch = require('node-fetch')
const ms = require('ms')

let data = []

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  return data
}

// cache data now and every X ms
cacheData()
setInterval(cacheData, ms('15m'))

function log (text) {
  return slack(text, 'T0CAQ00TU/B3BTWAJLR/Lyo5DjtFTFILfRPfUAa5yLoQ')
}

function logError (text) {
  return slack(text, 'T0CAQ00TU/B3D9078A3/hlmwh17yhjGztTKmBzCQG7lV')
}

function slack (text, id) {
  fetch(`https://hooks.slack.com/services/${id}`, {
    method: 'POST',
    body: JSON.stringify({ text })
  })
}

function cacheData () {
  const start = Date.now()
  fetch('https://api.github.com/search/repositories?q=user:zeit', {
    headers: {
      Accept: 'application/vnd.github.preview'
    }
  })
  .then((res) => {
    if (200 !== res.status) {
      return logError('Non-200 response code from GitHub: ' + res.status)
    }
    return res.json()
  })
  .then((data_) => {
    if (!data_) return

    if (!data_.items) {
      return logError(`Error: GitHub missing \`items\` in response`)
    }

    // ugly hack because github sometimes doesn't return
    // all the right search results :|
    let featured = 0
    data_.items.forEach(({ name }) => {
      if (name === 'hyper' || name === 'next.js' || name === 'micro') {
        featured++
      }
    })

    if (featured !== 3) {
      return logError(`Error: GitHub did not include all projects (${featured})`)
    }

    data = data_.items.map(({ name, description, stargazers_count, html_url }) => ({
      name,
      description,
      url: html_url,
      stars: stargazers_count
    }))
    log(`Re-built projects cache. ` +
        `Total: ${data.length} public ▲ZEIT projects. ` +
        `Elapsed: ${(new Date - start)}ms`)
  })
  .catch((err) => {
    logError('Error parsing response from GitHub: ' + err.stack)
  })
}
