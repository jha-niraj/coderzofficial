import { getProjectTasks } from '@/actions/(main)/projects/project.action'
import { auth } from '@repo/auth'
import { redirect } from 'next/navigation'
import TasksPageClient from './_components/tasks-page-client'
import { ProjectDetailsError } from '../_components/project-details-error'

export default async function TasksPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const session = await auth()
    const { slug } = await params

    if (!session?.user?.id) {
        redirect('/auth/login')
    }

    const tasksResult = await getProjectTasks(slug)

    if (!tasksResult.success || !tasksResult.data) {
        return <ProjectDetailsError />
    }

    return (
        <TasksPageClient
            project={{
                title: tasksResult.data.projectTitle,
                slug: slug
            }}
            tasks={tasksResult.data.columns}
            userProgress={tasksResult.data.progress}
        />
    )
}