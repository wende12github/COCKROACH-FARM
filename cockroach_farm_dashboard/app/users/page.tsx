'use client'

import UserManagement from '@/components/users/UserManagement'

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-green-500 font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage user accounts, roles, and permissions
        </p>
      </div>
      <UserManagement />
    </div>
  )
}
