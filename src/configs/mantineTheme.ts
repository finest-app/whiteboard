import {
	type DefaultMantineColor,
	type MantineColorsTuple,
	createTheme,
} from '@mantine/core'

type ExtendedCustomColors = 'primary' | DefaultMantineColor

declare module '@mantine/core' {
	export interface MantineThemeColorsOverride {
		colors: Record<ExtendedCustomColors, MantineColorsTuple>
	}
}

const mantineTheme = createTheme({
	primaryColor: 'primary',
	defaultRadius: 'md',
	activeClassName: 'active:brightness-90',
	colors: {
		primary: [
			'#e5f3ff',
			'#cde2ff',
			'#9ac2ff',
			'#64a0ff',
			'#3884fe',
			'#1d72fe',
			'#0969ff',
			'#0058e4',
			'#004ecd',
			'#0043b5',
		],
	},
})

export default mantineTheme
