import React from 'react'
import { useAuth } from '../context/AuthContext'
import {Navigate} from 'react-router-dom'
import { getSpinner } from './CommonHelper';

const PrivateRoutes = ({children}) => {
  const {user, loading} = useAuth()

  if(loading) {
    return getSpinner();
  }

  return user ? children : <Navigate to="/" />
}

export default PrivateRoutes