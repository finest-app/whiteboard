import { getAssetUrlsByImport } from '@tldraw/assets/imports.vite'
import { Tldraw, type TldrawProps } from 'tldraw'
import 'tldraw/tldraw.css'

const assetUrls = getAssetUrlsByImport((assetUrl) => assetUrl)

const App = () => {
	const tldrawProps: TldrawProps = {
		assetUrls,
		inferDarkMode: true,
	}

	return <Tldraw {...tldrawProps} />
}

export default App
