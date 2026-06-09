'use strict'

const fs = require('node:fs')

const originalChmodSync = fs.chmodSync

function isNuxtViteNodeSocket(target) {
  if (typeof target !== 'string' && !Buffer.isBuffer(target) && !(target instanceof URL)) {
    return false
  }

  const socketPath = target instanceof URL ? target.pathname : String(target)

  return /[/\\]nuxt-vite-node-[^/\\]+[/\\]nuxt-vite-node-\d+-\d+\.sock$/.test(socketPath)
}

fs.chmodSync = function chmodSyncWithNuxtViteNodeSocketGuard(target) {
  try {
    return originalChmodSync.apply(this, arguments)
  } catch (error) {
    if (error && error.code === 'ENOENT' && isNuxtViteNodeSocket(target)) {
      return
    }

    throw error
  }
}
