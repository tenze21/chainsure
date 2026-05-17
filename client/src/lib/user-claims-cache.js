const CACHE_PREFIX = 'chainsure.user-claims'

function getCacheKey(userId) {
  return `${CACHE_PREFIX}.${userId || 'anonymous'}`
}

export function loadCachedUserClaims(userId) {
  if (!userId) {
    return []
  }

  try {
    const raw = window.sessionStorage.getItem(getCacheKey(userId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCachedUserClaims(userId, claims) {
  if (!userId || !Array.isArray(claims)) {
    return
  }

  window.sessionStorage.setItem(getCacheKey(userId), JSON.stringify(claims))
}

export function upsertCachedUserClaim(userId, claim) {
  if (!userId || !claim?.id) {
    return
  }

  const current = loadCachedUserClaims(userId)
  const next = [claim, ...current.filter((entry) => entry.id !== claim.id)]
  saveCachedUserClaims(userId, next)
}

export function mergeClaimsById(apiClaims, cachedClaims) {
  const merged = new Map()

  for (const claim of [...cachedClaims, ...apiClaims]) {
    if (claim?.id) {
      merged.set(claim.id, claim)
    }
  }

  return [...merged.values()].sort(
    (left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0),
  )
}
