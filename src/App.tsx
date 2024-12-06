import { getAssetUrlsByImport } from '@tldraw/assets/imports.vite'
import { useLayoutEffect, useState } from 'react'
import throttle from 'throttleit'
import {
	createTLStore,
	LoadingScreen,
	ErrorScreen,
	DefaultSpinner,
	getSnapshot,
	loadSnapshot,
	Tldraw,
	type TldrawProps,
} from 'tldraw'

import 'tldraw/tldraw.css'

const assetUrls = getAssetUrlsByImport((assetUrl) => assetUrl)

const PERSISTENCE_KEY = 'whiteboard-app'

type LoadingState =
	| { status: 'loading' }
	| { status: 'ready' }
	| { status: 'error'; error: string }

const App = () => {
	const [store] = useState(() => createTLStore())

	const [loadingState, setLoadingState] = useState<LoadingState>({
		status: 'loading',
	})

	const tldrawProps: TldrawProps = {
		store,
		assetUrls,
		inferDarkMode: true,
	}

	useLayoutEffect(() => {
		setLoadingState({ status: 'loading' })

		// Get persisted data from local storage
		const persistedSnapshot = window.utools
			? window.utools.dbStorage.getItem(PERSISTENCE_KEY)
			: localStorage.getItem(PERSISTENCE_KEY)

		if (persistedSnapshot) {
			try {
				const snapshot = JSON.parse(persistedSnapshot)
				loadSnapshot(store, snapshot)
				setLoadingState({ status: 'ready' })
			} catch (error: any) {
				setLoadingState({ status: 'error', error: error.message }) // Something went wrong
			}
		} else {
			setLoadingState({ status: 'ready' }) // Nothing persisted, continue with the empty store
		}

		// Each time the store changes, run the (debounced) persist function
		const cleanupFn = store.listen(
			throttle(() => {
				const snapshot = getSnapshot(store)

				window.utools
					? window.utools.dbStorage.setItem(
							PERSISTENCE_KEY,
							JSON.stringify(snapshot),
						)
					: localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(snapshot))
			}, 500),
		)

		return () => {
			cleanupFn()
		}
	}, [store])

	if (loadingState.status === 'loading') {
		return (
			<LoadingScreen>
				<DefaultSpinner />
			</LoadingScreen>
		)
	}

	if (loadingState.status === 'error') {
		return <ErrorScreen>{loadingState.error}</ErrorScreen>
	}

	return <Tldraw {...tldrawProps} />
}

export default App
