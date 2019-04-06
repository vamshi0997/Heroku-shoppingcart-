import axios from 'axios'
import history from '../history'

/**
 * ACTION TYPES
 */
const REQUEST_CATEGORIES = 'REQUEST_CATEGORIES'
const RECEIVE_CATEGORIES = 'RECEIVE_CATEGORIES'

const REQUEST_CATEGORY = 'REQUEST_CATEGORY'
const RECEIVE_CATEGORY = 'RECEIVE_CATEGORY'

const CREATE_CATEGORY_SUCCESS = 'CREATE_CATEGORY_SUCCESS'
const UPDATE_CATEGORY_SUCCESS = 'UPDATE_CATEGORY_SUCCESS'
const DELETE_CATEGORY_SUCCESS = 'DELETE_CATEGORY_SUCCESS'

const REMOVE_ACTIVE_CATEGORY = 'REMOVE_ACTIVE_CATEGORY'

/**
 * ACTION CREATORS
 */
const requestCategories = () => ({ type: REQUEST_CATEGORIES })
const receiveCategories = categories => ({
  type: RECEIVE_CATEGORIES,
  categories
})

const requestCategory = () => ({ type: REQUEST_CATEGORY })
const receiveCategory = category => ({ type: RECEIVE_CATEGORY, category })

const createCategorySuccess = category => ({
  type: CREATE_CATEGORY_SUCCESS,
  category
})
const updateCategorySuccess = category => ({
  type: UPDATE_CATEGORY_SUCCESS,
  category
})
const deleteCategorySuccess = categoryId => ({
  type: DELETE_CATEGORY_SUCCESS,
  categoryId
})

export const removeActiveCategory = () => ({ type: REMOVE_ACTIVE_CATEGORY })

/**
 * THUNK CREATORS
 */
export const fetchCategories = categoryId => async dispatch => {
  dispatch(requestCategories())
  try {
    const { data } = await axios.get(
      `/api/categories/${categoryId ? `${categoryId}` : ''}`
    )
    console.log('fetchCategories data', data)
    dispatch(receiveCategories(data || []))
  } catch (error) {
    console.error(error)
  }
}

export const fetchCategory = categoryId => async dispatch => {
  dispatch(requestCategory())
  try {
    const { data } = await axios.get(`/api/categories/${categoryId}`)
    console.log('fetchCategory data', data)
    dispatch(receiveCategory(data || {}))
  } catch (error) {
    console.error(error)
  }
}

export const fetchCategoryChildren = categoryId => async dispatch => {
  dispatch(requestCategory())
  try {
    const id = categoryId || 0
    const { data } = await axios.get(`/api/categories/${id}/children`)
    dispatch(receiveCategories(data || []))
  } catch (error) {
    console.error(error)
  }
}

export const createCategory = category => async dispatch => {
  try {
    const { data } = await axios.post(`/api/categories`, category)
    dispatch(createCategorySuccess(data || {}))
  } catch (error) {
    console.error(error)
  }
}

export const updateCategory = category => async dispatch => {
  try {
    const { data } = await axios.put(`/api/categories/${category.id}`, category)
    dispatch(updateCategorySuccess(data || {}))
    history.goBack()
  } catch (error) {
    console.error(error)
  }
}

export const deleteCategory = category => async dispatch => {
  try {
    const { data } = await axios.delete(`/api/categories/${category.id}`)
    dispatch(deleteCategorySuccess(data || {}))
    history.goBack()
  } catch (error) {
    console.error(error)
  }
}

/**
 * INITIAL STATE
 */
const initialState = {
  isLoading: false,
  active: {},
  all: []
}

/**
 * REDUCERS
 */
export default (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_CATEGORIES:
    case REQUEST_CATEGORY:
      return {
        ...state,
        isLoading: true
      }

    case RECEIVE_CATEGORIES:
      return {
        ...state,
        isLoading: false,
        all: action.categories
      }

    case RECEIVE_CATEGORY:
      return {
        ...state,
        isLoading: false,
        active: action.category
      }

    case CREATE_CATEGORY_SUCCESS:
      return {
        ...state,
        all: [...state.all, action.category]
      }

    case UPDATE_CATEGORY_SUCCESS:
      return {
        ...state,
        all: [...state.all]
      }

    case DELETE_CATEGORY_SUCCESS:
      return {
        ...state,
        all: [...state.all].filter(item => item.id !== action.categoryId)
      }

    case REMOVE_ACTIVE_CATEGORY:
      return {
        ...state,
        active: {}
      }

    default:
      return state
  }
}
