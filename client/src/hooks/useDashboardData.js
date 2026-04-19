import { useEffect, useRef, useState } from 'react'
import { getTemplateById, getTemplates, getUserProposals, hydrateCurrentUserProfile, logoutUser, updateUserProfile } from '../lib/api'
import { getDashboardProducts } from '../lib/dashboard-config'
import { buildProfileFormState, getMissingProfileFields, isProfileReady } from '../lib/profile'
import { buildProposalSignature, loadTrackedProposals } from '../lib/proposal-store'
import { clearStoredUser, loadStoredUser, saveStoredUser } from '../lib/session'

function normalizeUser(user) {
  if (!user) {
    return null
  }

  return {
    ...user,
    ...buildProfileFormState(user),
    walletAddress: user.walletAddress || user.wallet_address || '',
  }
}

function buildTemplateSearchSource(template) {
  return [
    template?.name,
    template?.category?.name,
    template?.categoryName,
    template?.description,
    template?.coverageDetails,
    template?.eligibility,
    template?.limitations,
    template?.paymentType,
    template?.billingCycle,
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
  }
}

export default function useDashboardData() {
  const [user, setUser] = useState(() => normalizeUser(loadStoredUser()))
  const [products, setProducts] = useState(() => getDashboardProducts())
  const [templates, setTemplates] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [proposals, setProposals] = useState([])
  const [proposalsLoading, setProposalsLoading] = useState(true)
  const [proposalsError, setProposalsError] = useState('')
  const hydratedUserIdsRef = useRef(new Set())

  useEffect(() => {
    let active = true

    async function loadCatalog() {
      const configuredProducts = getDashboardProducts()
      let templates = []

      try {
        const response = await getTemplates()
        templates = response?.data?.templates || []
        if (active) {
          setTemplates(templates)
        }
      } catch (error) {
        if (active) {
          setProducts(configuredProducts.map((product) => ({ ...product, template: null, templateStatus: 'error', templateError: error.message })))
          setTemplates([])
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
    if (!user?.id || user.role === 'admin') {
      return
    }

    if (getMissingProfileFields(user).length === 0) {
      hydratedUserIdsRef.current.delete(user.id)
      return
    }

    if (hydratedUserIdsRef.current.has(user.id)) {
      return
    }

    let active = true
    hydratedUserIdsRef.current.add(user.id)

    hydrateCurrentUserProfile()
      .then((response) => {
        if (!active || !response?.data) {
          return
        }

        const hydratedUser = normalizeUser({
          ...user,
          ...response.data,
        })

        setUser(hydratedUser)
        saveStoredUser(hydratedUser)
      })
      .catch(() => {
        // Keep the current local snapshot when the backend profile hydration fails.
      })

    return () => {
      active = false
    }
  }, [user])

  async function refreshProposals() {
    if (!user?.email) {
      setProposals([])
      setProposalsLoading(false)
      setProposalsError('Sign in through the auth flow to load proposal activity for this dashboard.')
      return
    }

    setProposalsLoading(true)
    setProposalsError('')

    try {
      const response = await getUserProposals()
      const trackedProposalMap = new Map(
        loadTrackedProposals(user.email).map((proposal) => [buildProposalSignature(proposal), proposal]),
      )
      const items = (response?.data?.userProposals || [])
        .map((proposal, index) => normalizeProposal(proposal, index, trackedProposalMap))
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))

      setProposals(items)
    } catch (error) {
      setProposals([])
      setProposalsError(
        error.status === 401
          ? 'Sign in through the auth flow to load proposal activity for this dashboard.'
          : error.message,
      )
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

    return updatedUser
  }

  async function signOut() {
    try {
      await logoutUser()
    } catch {
      // Clearing local state is still useful when the backend is offline.
    }

    clearStoredUser()
    setUser(null)
    setTemplates([])
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
    templates,
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
