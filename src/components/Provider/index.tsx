import React from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import collectedRoutes from '../../utils/routesCollector'

const routes = collectedRoutes()
const router = createBrowserRouter(routes)
const FileBasedProvider = () => {
  return <RouterProvider router={router} />
}

export default FileBasedProvider
