import React from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import collectedRoutes from '../../utils/routesCollector'
import type { FutureConfig, HydrationState } from '@remix-run/router'

export const routes = collectedRoutes()
interface IOPTS {
  opts?: {
    basename?: string
    future?: Partial<Omit<FutureConfig, 'v7_prependBasename'>>
    hydrationData?: HydrationState
    window?: Window
  }
}

const FileBasedProvider = ({ opts }: IOPTS) => {
  const router = createBrowserRouter(routes, opts)
  return <RouterProvider router={router} />
}

export default FileBasedProvider
