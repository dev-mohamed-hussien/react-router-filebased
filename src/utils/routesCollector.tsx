import React, { JSXElementConstructor, ReactElement, ReactNode, cloneElement } from 'react'
import { Outlet, RouteObject } from 'react-router-dom'
type RouteConfig = {
  path: string
  element: ReactElement<any, string | JSXElementConstructor<any>>
}

type LayoutRoutes = {
  [key: string]: { el: ReactNode; pathLength: number }
}

type NotFoundRoutes = {
  [key: string]: { el: ReactNode; pathLength: number }
}
type ErrorRoutes = {
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
const getLoadingRoutes = (r: any): RouteConfig[] => {
  return r.keys().map((route: string) => {
    const path = route.substr(1).replace(/\/src\/pages|index|\.(js|jsx|ts|tsx)$/g, '')

    const Element = r(route).default
    return { path, element: <Element /> }
  })
}

function getMetaData(key: string, routes: RouteConfig[]): LayoutRoutes | NotFoundRoutes {
  const data: LayoutRoutes | NotFoundRoutes = {}

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
  layoutRoutes: LayoutRoutes,
  errorRoutes: ErrorRoutes,
  loadingMetatRoutes: LayoutRoutes,
): RouteObject[] {
  const nested: RouteObject[] | null = []
  mainRoutes.forEach((route) => {
    let currentNode = nested
    const splittedPath = route.path.split('/')
    splittedPath.forEach((part, i) => {
      // let Loading = Object.values(loadingMetatRoutes).find(
      //   (e) => e.pathLength === splittedPath.length
      // )?.el;
      // let pathLength = splittedPath.length;
      // while (!Loading && pathLength > 0) {
      //   pathLength--;
      //   Loading = Object.values(loadingMetatRoutes).find(
      //     (e) => e.pathLength === pathLength
      //   )?.el;
      // }
      const Loading = Object.values(loadingMetatRoutes)
        .sort((a, b) => b.pathLength - a.pathLength)
        .find((e) => e.pathLength <= splittedPath.length)?.el

      const isLastCild = i === splittedPath.length - 1

      let childNode = currentNode?.find((node) => node.path === part)
      if (!childNode) {
        childNode = {
          path: part === '404' ? '*' : part,
          element: isLastCild ? (
            <React.Suspense fallback={Loading}>{route.element}</React.Suspense>
          ) : layoutRoutes[part] ? (
            <React.Suspense fallback={Loading}>{layoutRoutes[part].el}</React.Suspense>
          ) : (
            ''
          ),
          children: isLastCild ? undefined : [],
          errorElement: Object.values(errorRoutes).find((e) => e.pathLength === splittedPath.length)?.el,
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
const loadingAll = (require as any).context(
  './../../../../../src/pages',
  true,
  /^\.\/(?!pages\/).*loading.*\.(js|jsx|ts|tsx)$/,
)
const loadingRoutes = getLoadingRoutes(loadingAll)
const loadingMetatRoutes = getMetaData('loading', loadingRoutes)

export default function collectedRoutes(): RouteObject[] {
  const requireAll = (require as any).context(
    './../../../../../src/pages',
    true,
    /^\.\/(?!pages\/)[\w\/\[\]\-_]+\.(tsx|jsx)?$/,
    'lazy',
  )

  const routes = getRoutes(requireAll)

  const layoutRoutes = getMetaData('layout', routes)
  const errorRoutes = getMetaData('500', routes)
  const mainRoutes = routes.filter(
    (route: RouteConfig): boolean => !route.path.includes('layout') && !route.path.includes('500'),
  )

  return nestedRoutes(mainRoutes, layoutRoutes, errorRoutes, loadingMetatRoutes)
}
