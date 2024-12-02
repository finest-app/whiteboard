import { AppShell, Group, Title } from '@mantine/core'
import { createFileRoute, Outlet } from '@tanstack/react-router'

const AppLayout = () => {
	return (
		<AppShell padding="md" header={{ height: 64 }}>
			<AppShell.Header>
				<Group className="h-full" align="center" px="xl">
					<Title>ACME</Title>
				</Group>
			</AppShell.Header>
			<AppShell.Main className="flex">
				<Outlet />
			</AppShell.Main>
		</AppShell>
	)
}

export const Route = createFileRoute('/_layout')({ component: AppLayout })
