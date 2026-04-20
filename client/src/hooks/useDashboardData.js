import { useEffect, useState } from 'react'
import { getCurrentUser, getTemplateById, getTemplates, getUserProposals, logoutUser, updateUserProfile } from '../lib/api'
import { getDashboardProducts } from '../lib/dashboard-config'
import { getMissingProfileFields, isProfileReady } from '../lib/profile'
import { buildProposalSignature, loadTrackedProposals } from '../lib/proposal-store'
import { clearStoredUser, loadStoredUser, saveStoredUser } from '../lib/session'

const PROPOSAL_SUMMARY_CACHE_KEY = 'chainsure.proposal-summaries'

function normalizeUser(user) {
  if (!user) {
    return null
  }

  return {
    ...user,
    fullName: user.fullName || user.full_name || '',
    email: user.email || '',
    cid: user.cid || '',
    contactNumber: user.contactNumber || user.contact_number || '',
    occupation: user.occupation || '',
    dob: user.dob || '',
    gender: user.gender || '',
    maritalStatus: user.maritalStatus || user.marital_status || '',
    address: user.address || '',
    walletAddress: user.walletAddress || user.wallet_address || '',
  }
}

function buildTemplateSearchSource(template) {
  return [
    template?.name,
    template?.category?.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function findMatchingTemplate(product, templates) {
  const matchers = Array.isArray(product.templateMatchers) ? product.templateMatchers : []

  if (!matchers.length) {
    return null
  }

  const rankedTemplates = templates
    .map((template) => ({
      template,
      score: matchers.reduce((total, matcher) => (
        buildTemplateSearchSource(template).includes(matcher) ? total + 1 : total
      ), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)

  return rankedTemplates[0]?.template || null
}

function normalizeProposal(proposal, index, trackedProposalMap) {
  const name = proposal?.name || 'Unnamed proposal'
  const createdAt = proposal?.createdAt || ''
  const category = proposal?.category || 'Uncategorized'
  const trackedProposal = trackedProposalMap.get(buildProposalSignature({ name, category, createdAt })) || null

  return {
    key: trackedProposal?.id || `${name}-${createdAt || index}`,
    id: trackedProposal?.id || null,
    name,
    category,
    status: proposal?.status || 'pending',
    createdAt,
    attributes: trackedProposal?.attributes || {},
    hasTrackedDetails: Boolean(trackedProposal),
    policyId: trackedProposal?.policyId || '',
    hasTrackedPolicyId: Boolean(trackedProposal?.policyId),
    policyStatus: trackedProposal?.policyStatus || '',
  }
}

function normalizeTrackedProposal(proposal, index) {
  return {
    key: proposal?.id || `${proposal?.name || 'proposal'}-${proposal?.createdAt || index}`,
    id: proposal?.id || null,
    name: proposal?.name || 'Unnamed proposal',
    category: proposal?.category || 'Uncategorized',
    status: proposal?.status || 'pending',
    createdAt: proposal?.createdAt || '',
    attributes: proposal?.attributes || {},
    hasTrackedDetails: Boolean(proposal?.attributes && Object.keys(proposal.attributes).length > 0),
    policyId: proposal?.policyId || '',
    hasTrackedPolicyId: Boolean(proposal?.policyId),
    policyStatus: proposal?.policyStatus || '',
  }
}

function loadCachedProposalSummaries(ownerEmail) {
  if (!ownerEmail || typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(PROPOSAL_SUMMARY_CACHE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    const items = parsed?.[ownerEmail] || []

    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

function saveCachedProposalSummaries(ownerEmail, proposals) {
  if (!ownerEmail || typeof window === 'undefined') {
    return
  }

  try {
    const raw = window.localStorage.getItem(PROPOSAL_SUMMARY_CACHE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    parsed[ownerEmail] = Array.isArray(proposals) ? proposals : []
    window.localStorage.setItem(PROPOSAL_SUMMARY_CACHE_KEY, JSON.stringify(parsed))
  } catch {
    // Ignore storage failures and continue with in-memory state.
  }
}

export default function useDashboardData() {
  const [user, setUser] = useState(() => normalizeUser(loadStoredUser()))
  const [products, setProducts] = useState(() => getDashboardProducts())
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [proposals, setProposals] = useState([])
  const [proposalsLoading, setProposalsLoading] = useState(true)
  const [proposalsError, setProposalsError] = useState('')

  async function refreshUserFromServer(seedUser = user) {
    if (!seedUser?.id && !seedUser?.email) {
      return normalizeUser(seedUser)
    }

    let response

    try {
      response = await getCurrentUser()
    } catch (error) {
      if (error?.status === 429) {
        return normalizeUser(seedUser)
      }

      throw error
    }

    const refreshedUser = normalizeUser({
      ...seedUser,
      ...response?.data,
    })

    setUser(refreshedUser)
    saveStoredUser(refreshedUser)

    return refreshedUser
  }

  useEffect(() => {
    let active = true

    async function loadCatalog() {
      const configuredProducts = getDashboardProducts()
      let templates = []

      try {
        const response = await getTemplates()
        templates = response?.data?.templates || []
      } catch (error) {
        if (active) {
          setProducts(configuredProducts.map((product) => ({ ...product, template: null, templateStatus: 'error', templateError: error.message })))
          setCatalogLoading(false)
          setCatalogError(error.message)
        }
        return
      }

      const resolvedProducts = await Promise.all(
        configuredProducts.map(async (product) => {
          try {
            let template = product.templateId
              ? templates.find((candidate) => candidate.id === product.templateId) || null
              : findMatchingTemplate(product, templates)

            if (!template && product.templateId) {
              const templateResponse = await getTemplateById(product.templateId)
              template = templateResponse?.data?.template || null
            }

            if (!template) {
              return {
                ...product,
                template: null,
                templateStatus: 'missing',
                templateError: '',
              }
            }

            return {
              ...product,
              templateId: template.id,
              template,
              templateStatus: 'ready',
              templateError: '',
              templateSource: product.templateId ? 'env' : 'auto',
            }
          } catch (error) {
            return {
              ...product,
              template: null,
              templateStatus: 'error',
              templateError: error.message,
            }
          }
        }),
      )

      if (!active) {
        return
      }

      const readyCount = resolvedProducts.filter((product) => product.templateStatus === 'ready').length
      const missingCount = resolvedProducts.filter((product) => product.templateStatus === 'missing').length

      setProducts(resolvedProducts)
      setCatalogLoading(false)
      setCatalogError(
        readyCount === 0
          ? 'No compatible dashboard templates were found in the backend.'
          : missingCount > 0
            ? `${missingCount} dashboard form${missingCount === 1 ? ' is' : 's are'} still unavailable because no matching backend template was found.`
            : '',
      )
    }

    loadCatalog()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    refreshProposals()
  }, [user?.email])

  useEffect(() => {
    let active = true

    if (!user?.id && !user?.email) {
      return undefined
    }

    refreshUserFromServer(user)
      .catch((error) => {
        if (!active) {
          return
        }

        if (error?.status === 401) {
          clearStoredUser()
          setUser(null)
          setProposals([])
          setProposalsError('Sign in through the auth flow to load proposal activity for this dashboard.')
        }
      })

    return () => {
      active = false
    }
  }, [user?.id])

  async function refreshProposals() {
    if (!user?.email) {
      setProposals([])
      setProposalsLoading(false)
      setProposalsError('Sign in through the auth flow to load proposal activity for this dashboard.')
      return
    }

    setProposalsLoading(true)
    setProposalsError('')

    const trackedFallback = loadTrackedProposals(user.email)
      .map((proposal, index) => normalizeTrackedProposal(proposal, index))
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    const cachedFallback = loadCachedProposalSummaries(user.email)
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))

    try {
      const response = await getUserProposals()
      const trackedProposalMap = new Map(
        loadTrackedProposals(user.email).map((proposal) => [buildProposalSignature(proposal), proposal]),
      )
      const items = (response?.data?.userProposals || [])
        .map((proposal, index) => normalizeProposal(proposal, index, trackedProposalMap))
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))

      setProposals(items)
      saveCachedProposalSummaries(user.email, items)
    } catch (error) {
      if (error.status === 401) {
        setProposals([])
        setProposalsError('Sign in through the auth flow to load proposal activity for this dashboard.')
      } else if (error.status === 429 && cachedFallback.length > 0) {
        setProposals(cachedFallback)
        setProposalsError('The backend rate limit was reached. Showing the last successful proposal snapshot cached in this browser.')
      } else if (error.status === 429 && trackedFallback.length > 0) {
        setProposals(trackedFallback)
        setProposalsError('The backend rate limit was reached. Showing the proposals tracked in this browser until the API window resets.')
      } else if (error.status === 429) {
        setProposals((previous) => previous)
        setProposalsError('The backend rate limit was reached. Wait for the API window to reset, then refresh again.')
      } else {
        setProposals([])
        setProposalsError(error.message)
      }
    } finally {
      setProposalsLoading(false)
    }
  }

  async function saveProfile(profilePayload) {
    const response = await updateUserProfile(profilePayload)
    const updatedUser = normalizeUser({
      ...user,
      ...response?.data,
    })

    setUser(updatedUser)
    saveStoredUser(updatedUser)

    try {
      return await refreshUserFromServer(updatedUser)
    } catch {
      return updatedUser
    }
  }

  async function signOut() {
    try {
      await logoutUser()
    } catch {
      // Clearing local state is still useful when the backend is offline.
    }

    clearStoredUser()
    setUser(null)
    setProposals([])
    setProposalsError('Sign in through the auth flow to load proposal activity for this dashboard.')
  }

  return {
    user,
    setUser: (nextUser) => {
      const normalizedUser = normalizeUser(nextUser)
      setUser(normalizedUser)
      if (normalizedUser) {
        saveStoredUser(normalizedUser)
      }
    },
    products,
    catalogLoading,
    catalogError,
    profileReady: isProfileReady(user),
    missingProfileFields: getMissingProfileFields(user),
    proposals,
    proposalsLoading,
    proposalsError,
    refreshProposals,
    saveProfile,
    signOut,
  }
}
