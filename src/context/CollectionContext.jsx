import { createContext, useContext, useReducer, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase/firebaseConfig'

const CollectionContext = createContext(null)

const initialState = {
  bottles: [],
  loading: true,
  error: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_BOTTLES':
      return { ...state, bottles: action.payload, loading: false }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    default:
      return state
  }
}

export function CollectionProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const q = query(collection(db, 'bottles'), orderBy('dateAdded', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bottles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        dispatch({ type: 'SET_BOTTLES', payload: bottles })
      },
      (error) => dispatch({ type: 'SET_ERROR', payload: error.message })
    )
    return () => unsubscribe()
  }, [])

  return (
    <CollectionContext.Provider value={{ ...state, dispatch }}>
      {children}
    </CollectionContext.Provider>
  )
}

export const useCollectionContext = () => useContext(CollectionContext)
