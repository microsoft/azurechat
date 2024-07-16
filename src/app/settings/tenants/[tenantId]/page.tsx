"use client"

import UserList from "@/features/user-management/user-list"

const UsersPage: React.FC = () => {
  return <UserList searchParams={{ pageSize: 10, pageNumber: 0 }} />
}

export default UsersPage
