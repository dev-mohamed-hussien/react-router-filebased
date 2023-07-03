import React, { JSXElementConstructor, ReactElement, ReactNode, cloneElement } from 'react'
import { Outlet, RouteObject } from 'react-router-dom'
import Loader from '../components/Loader'

type RouteConfig = {
  path: string
  element: ReactElement<any, string | JSXElementConstructor<any>>
}

type LayoutMetaData = {
  [key: string]: ReactNode
}

type NotFoundMetaData = {
  [key: string]: ReactNode
}
type ErrorMetaData = {
  [key: string]: ReactNode
}

type NestedRoute = {
  errorElement?: ReactNode
  path: string
  key: string
  element: ReactNode | null
  children?: NestedRoute[]
  index?: boolean
}

function getRoutes(r: any): RouteConfig[] {
  return r.keys().map((route: string) => {
    const path = route
      .substr(1)
      .replace(/\/src\/pages|index|\.(js|jsx|ts|tsx)$/g, '')
      .replace(/\[\.{3}.+\]/, '*')
      .replace(/\[(.+)\]/, ':$1')
    console.log({ React })
    const Element = React.lazy(() => r(route))
    debugger

    return {
      path,
      element: <Element />,
    }
  })
}

function getMetaData(key: string, routes: RouteConfig[]): LayoutMetaData | NotFoundMetaData {
  const data: LayoutMetaData | NotFoundMetaData = {}
  debugger

  routes
    .filter((route) => route.path.includes(key))
    .forEach((route) => {
      const splitied = route.path.split('/')
      const indexoF = splitied.indexOf(key)
      if (key === 'layout') {
        const newElement = cloneElement(route.element, {
          children: <Outlet />,
        })
        data[splitied[indexoF - 1]] = newElement
      } else {
        data[splitied[indexoF - 1]] = route.element
      }
    })
  return data
}

const filterRoutes = (route: RouteConfig): boolean => !route.path.includes('layout') && !route.path.includes('layout')
function nestedRoutes(routes: RouteConfig[]): NestedRoute[] {
  const layoutMetaData = getMetaData('layout', routes) as LayoutMetaData
  const errorMetaData = getMetaData('500', routes) as ErrorMetaData
  const notFoundMetaData = getMetaData('404', routes) as NotFoundMetaData
  const routesWithoutinfoPages = routes.filter(filterRoutes)
  const nested: NestedRoute[] | null = []
  routesWithoutinfoPages.forEach((route) => {
    console.log('2', route)

    let currentNode = nested
    const splittedPath = route.path.split('/')
    splittedPath.forEach((part, i) => {
      let childNode = currentNode?.find((node) => node.path === part)

      if (!childNode) {
        childNode = {
          key: part,
          path: part === '404' ? '*' : part,
          element:
            i === splittedPath.length - 1 ? (
              <React.Suspense
                fallback={
                  <div className='h-screen w-full flex place-items-center  justify-center'>
                    {' '}
                    <Loader />{' '}
                  </div>
                }
              >
                {' '}
                {route.element}
              </React.Suspense>
            ) : layoutMetaData[part] ? (
              <React.Suspense
                fallback={
                  <div className='h-screen w-full flex place-items-center  justify-center'>
                    {' '}
                    <Loader />{' '}
                  </div>
                }
              >
                {layoutMetaData[part]}
              </React.Suspense>
            ) : (
              ''
            ),
          children: i === splittedPath.length - 1 ? undefined : [],
        }

        if (notFoundMetaData[part]) {
          // childNode.errorElement = notFoundMetaData[part];
          if (!childNode.element) {
            childNode.element = notFoundMetaData[part]
          }
        }

        if (errorMetaData[part]) {
          childNode.errorElement = errorMetaData[part]
        }

        if (part === '' && i !== 0) {
          childNode.index = true
          // childNode.children=null
        }

        if (i === 0) nested.push(childNode)
        else {
          currentNode.push(childNode)
        }
      }
      if (childNode.children) {
        currentNode = childNode.children
      }
    })
  })
  return nested
}
let requireAll
try {
  requireAll = (require as any).context?.(
    './../../../../../src/pages',
    true,
    /^\.\/(?!pages\/)[\w\/\[\]\-_]+\.(tsx|jsx)?$/,
    'lazy',
  )
} catch (error) {
  throw new Error('Error: Unable to find src/pages directory.')
}

const paths = getRoutes(requireAll)
const collectedRoutes = nestedRoutes(paths) as RouteObject[]
export default collectedRoutes
