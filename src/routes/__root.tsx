import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

interface RouterContext {
	queryClient: QueryClient
}

const AppRoot = () => <Outlet />

export const Route = createRootRouteWithContext<RouterContext>()({
	component: AppRoot,
})
