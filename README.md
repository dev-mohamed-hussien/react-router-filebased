# react-router-filebased

## About React-Router-Filebased

React-Router-Filebased is a lightweight npm package designed to simplify your React application's routing process. This package is built on top of the popular React Router Dom v6 library and includes file-based routing with lazy loading capabilities, making it easier to manage your application's routes.

With React-Router-Filebased, you can create routes directly from your file structure. This means you can organize your components and routes in a logical way that makes sense for your application. In addition, the package supports lazy loading, so your components and routes will only be loaded when they are needed, reducing the initial load time of your application.

## Install

```bash
cd project-name
npm i react-router-filebased react-router-dom
mkdir src/pages
```

## Usage

```tsx
// src/App.tsx
import React from 'react'
import FileBasedProvider from 'react-router-filebased'

function App() {
  return <FileBasedProvider />
}
export default App
```

```tsx
// src/pages/index.tsx
import React from 'react'

function Home() {
  return <h1>Home Page</h1>
}
export default Home
```

```tsx
// src/pages/[id].tsx
import React from 'react'
import { useParams } from 'react-router-dom'

function DynamicRoute() {
  const { id } = useParams()
  return <h1>DynamicRoute with id : {id}</h1>
}
export default DynamicRoute
```

```tsx
// src/pages/layout.tsx
import React, { ReactNode } from 'react'

type Props = {
  children: ReactNode
}
function RootLayout({ children }: Props) {
  return <div>{children}</div>
}
export default RootLayout
```

## License

MIT © [dev-mohamed-hussien](https://github.com/dev-mohamed-hussien)
