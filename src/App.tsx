import { getAssetUrlsByImport } from '@tldraw/assets/imports.vite'
import mime from 'mime/lite'
import { useLayoutEffect, useState } from 'react'
import throttle from 'throttleit'
import {
	createTLStore,
	LoadingScreen,
	ErrorScreen,
	DefaultSpinner,
	getSnapshot,
	loadSnapshot,
	DEFAULT_SUPPORTED_MEDIA_TYPE_LIST,
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

// Migrate data from utools.dbStorage to localConfig
if (window.utools) {
	try {
		const data = window.utools.dbStorage.getItem(PERSISTENCE_KEY)

		// 确保数据有效且目标位置为空
		if (data && !window.preload.localConfig.getItem(PERSISTENCE_KEY)) {
			// 先确保新数据能够写入成功
			window.preload.localConfig.setItem(PERSISTENCE_KEY, data)

			// 写入成功后再删除旧数据
			window.utools.dbStorage.removeItem(PERSISTENCE_KEY)
		}
	} catch (error) {
		alert(`数据迁移失败：${error}`)
		window.utools.showMainWindow()
	}
}

const App = () => {
	const [store] = useState(() => createTLStore())

	const [loadingState, setLoadingState] = useState<LoadingState>({
		status: 'loading',
	})

	const tldrawProps: TldrawProps = {
		store,
		assetUrls,
		inferDarkMode: true,
		overrides: {
			actions: (editor, actions) => {
				if (window.utools && actions['insert-media']) {
					actions['insert-media'] = {
						...actions['insert-media'],
						onSelect: async () => {
							const _files = await window.preload.openFiles({
								filters: [
									{
										name: '媒体',
										extensions: DEFAULT_SUPPORTED_MEDIA_TYPE_LIST.split(
											',',
										).flatMap((type) => {
											const extensions = mime.getAllExtensions(type)

											return extensions ? Array.from(extensions) : []
										}),
									},
								],
							})

							const files = _files.map(
								(file) =>
									new File([file], file.name, {
										type: mime.getType(file.name) || file.type,
									}),
							)

							// trackEvent('insert-media', { source })
							editor.markHistoryStoppingPoint('insert media')
							await editor.putExternalContent({
								type: 'files',
								files,
								point: editor.getViewportPageBounds().center,
								ignoreParent: false,
							})
						},
					}
				}

				return actions
			},
		},
	}

	useLayoutEffect(() => {
		setLoadingState({ status: 'loading' })

		// Get persisted data from local storage
		const persistedSnapshot = window.utools
			? window.preload.localConfig.getItem(PERSISTENCE_KEY)
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
					? window.preload.localConfig.setItem(
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
