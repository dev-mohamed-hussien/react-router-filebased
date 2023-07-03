import React from 'react'
import { RouteObject, RouterProvider, createBrowserRouter } from 'react-router-dom'
import collectedRoutes from '../../utils/routesCollector'

const router = createBrowserRouter(collectedRoutes as RouteObject[])

const FileBasedProvider = () => {
  return <RouterProvider router={router} />
}

// const domNode = document.getElementById('root');
// const root = createRoot(domNode);
// root.render(<FileBasedProvider/>)
export default FileBasedProvider
