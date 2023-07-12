import React, { JSXElementConstructor, ReactElement, ReactNode, cloneElement } from 'react'
import { Outlet, RouteObject } from 'react-router-dom'
type RouteConfig = {
  path: string
  element: ReactElement<any, string | JSXElementConstructor<any>>
}
type MetaRoutes = {
  [key: string]: { el: ReactNode; pathLength: number }
}
const getRoutes = (r: any): RouteConfig[] => {
  return r.keys().map((route: string) => {
    const path = route
      .substr(1)
      .replace(/\/src\/pages|index|\.(js|jsx|ts|tsx)$/g, '')
      .replace(/\[\.{3}.+\]/, '*')
      .replace(/\[(.+)\]/, ':$1')

    const Element = React.lazy(() => r(route))

    return { path, element: <Element /> }
  })
}
const getSyncRoutes = (r: any): RouteConfig[] => {
  return r.keys().map((route: string) => {
    const path = route.substr(1).replace(/\/src\/pages|index|\.(js|jsx|ts|tsx)$/g, '')

    const Element = r(route).default
    return { path, element: <Element /> }
  })
}
function getMetaData(key: string, routes: RouteConfig[]): MetaRoutes {
  const data: MetaRoutes = {}
  routes
    .filter((route) => route.path.includes(key))
    .forEach((route) => {
      const splitied = route.path.split('/')
      const indexoF = splitied.indexOf(key)
      const newElement = key === 'layout' ? cloneElement(route.element, { children: <Outlet /> }) : route.element

      data[splitied[indexoF - 1]] = {
        el: newElement,
        pathLength: splitied.length,
      }
    })

  return data
}
function nestedRoutes(
  mainRoutes: RouteConfig[],
  layoutMetaRoutes: MetaRoutes,
  errorMetaRoutes: MetaRoutes,
  loadingMetatRoutes: MetaRoutes,
): RouteObject[] {
  const nested: RouteObject[] | null = []
  mainRoutes.forEach((route) => {
    let currentNode = nested
    const splittedPath = route.path.split('/')
    splittedPath.forEach((part, i) => {
      const isChild = i === splittedPath.length - 1
      const loadingMetatRoutesArray = Object.values(loadingMetatRoutes)
      const Loading = loadingMetatRoutesArray
        .sort((a, b) => b.pathLength - a.pathLength)
        .find((e) => e.pathLength <= splittedPath.length)?.el
      let childNode = currentNode?.find((node) => node.path === part)
      if (!childNode) {
        childNode = {
          path: part === '404' ? '*' : part,
          element: isChild ? (
            <React.Suspense fallback={Loading}>{route.element}</React.Suspense>
          ) : layoutMetaRoutes[part] ? (
            layoutMetaRoutes[part].el
          ) : (
            ''
          ),
          children: isChild ? undefined : [],
          errorElement: Object.values(errorMetaRoutes).find((e) => e.pathLength === splittedPath.length)?.el,
        }

        if (i === 0) {
          nested.push(childNode)
        } else {
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

export default function collectedRoutes(): RouteObject[] {
  const requireAll = (require as any).context(
    './../../../../../src/pages',
    true,
    /^\.\/(?!pages\/)(?!.*(?:loading|layout))[\w\/\[\]\-_]+\.(tsx|jsx|js|ts)?$/,
    'lazy',
  )

  const loadingAll = (require as any).context(
    './../../../../../src/pages',
    true,
    /^\.\/(?!pages\/).*loading.*\.(js|jsx|ts|tsx)$/,
  )
  const layoutAll = (require as any).context(
    './../../../../../src/pages',
    true,
    /^\.\/(?!pages\/).*layout.*\.(js|jsx|ts|tsx)$/,
  )
  const routes = getRoutes(requireAll)
  const loadingRoutes = getSyncRoutes(loadingAll)
  const layoutRoutes = getSyncRoutes(layoutAll)

  const loadingMetatRoutes = getMetaData('loading', loadingRoutes)
  const layoutMetaRoutes = getMetaData('layout', layoutRoutes)
  const errorMetaRoutes = getMetaData('500', routes)

  return nestedRoutes(routes, layoutMetaRoutes, errorMetaRoutes, loadingMetatRoutes)
}
