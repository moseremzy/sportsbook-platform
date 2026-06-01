const db = require("./database")

let cachedSettings = null

async function getSettings() {

  if (cachedSettings) return cachedSettings

  cachedSettings = await new Promise((resolve, reject) => {
    db.query('SELECT * FROM settings LIMIT 1', (err, result) => {
      if (err) reject(err)
      else resolve(result[0])
    })
  })

  return cachedSettings
}

function clearSettingsCache() {

  cachedSettings = null

}

module.exports = { getSettings, clearSettingsCache }