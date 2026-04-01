import { useEffect, useState } from 'react'
import { getTemplateById, getUserProposals, logoutUser, updateUserProfile } from '../lib/api'
import { getDashboardProducts } from '../lib/dashboard-config'
import { clearStoredUser, loadStoredUser, saveStoredUser } from '../lib/session'

function normalizeUser(user) {
  if (!user) {
    return null
  }

  return {
    ...user,
    fullName: user.fullName || '',
    email: user.email || '',
    cid: user.cid || '',
    contactNumber: user.contactNumber || '',
    occupation: user.occupation || '',
    dob: user.dob || '',
    gender: user.gender || '',
    maritalStatus: user.maritalStatus || '',
    address: user.address || '',
    walletAddress: user.walletAddress || '',
  }
}

function normalizeProposal(proposal, index) {
  const name = proposal?.name || 'Unnamed proposal'
  const createdAt = proposal?.createdAt || ''

  return {
    key: `${name}-${createdAt || index}`,
    name,
    category: proposal?.category || 'Uncategorized',
    status: proposal?.status || 'pending',
    createdAt,
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

  useEffect(() => {
    let active = true

    async function loadCatalog() {
      const configuredProducts = getDashboardProducts()
      const configuredCount = configuredProducts.filter((product) => product.templateId).length

      if (!configuredCount) {
        if (active) {
          setProducts(configuredProducts.map((product) => ({ ...product, templateStatus: 'missing' })))
          setCatalogLoading(false)
          setCatalogError('Set the VITE_TEMPLATE_ID_* values in client/.env to connect these forms to backend templates.')
        }
        return
      }

      const resolvedProducts = await Promise.all(
        configuredProducts.map(async (product) => {
          if (!product.templateId) {
            return {
              ...product,
              template: null,
              templateStatus: 'missing',
            }
          }

          try {
            const response = await getTemplateById(product.templateId)
            return {
              ...product,
              template: response?.data?.template || null,
              templateStatus: 'ready',
              templateError: '',
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

      setProducts(resolvedProducts)
      setCatalogLoading(false)
      setCatalogError(
        readyCount
          ? ''
          : 'None of the configured template IDs could be loaded from the backend.',
      )
    }

    loadCatalog()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    refreshProposals()
  }, [])

  async function refreshProposals() {
    setProposalsLoading(true)
    setProposalsError('')

    try {
      const response = await getUserProposals()
      const items = (response?.data?.userProposals || [])
        .map(normalizeProposal)
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
    proposals,
    proposalsLoading,
    proposalsError,
    refreshProposals,
    saveProfile,
    signOut,
  }
}
