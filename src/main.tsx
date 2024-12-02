import { RouterProvider } from '@tanstack/react-router'
import React from 'react'
import ReactDOM from 'react-dom/client'
import router from './configs/router'
import Providers from './Providers'

import './index.css'

const container = document.getElementById('root')

if (container) {
	ReactDOM.createRoot(container).render(
		<React.StrictMode>
			<Providers>
				<RouterProvider router={router} />
			</Providers>
		</React.StrictMode>,
	)
}
