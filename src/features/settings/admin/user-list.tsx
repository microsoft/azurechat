"use client"

import { ChevronLeft, ChevronRight, FileDown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { convertUserListToWordDocument } from "@/features/common/user-export"
import { UserRecord } from "@/features/models/user-models"
import { Button } from "@/features/ui/button"
import { Card } from "@/features/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/features/ui/table"

const HIGH_FAILED_LOGINS = 5

const handleExport = (filteredUsers: UserRecord[]) => async (): Promise<void> =>
  await convertUserListToWordDocument(filteredUsers, "UserList.docx")

export type UserListProps = {
  users: UserRecord[]
  tenantId: string
  searchParams: {
    pageSize?: number
    pageNumber?: number
  }
}
export const UserList = ({ users, tenantId, searchParams }: UserListProps): JSX.Element => {
  const pageSize = Number(searchParams.pageSize ?? 20)
  const pageNumber = Math.max(Number(searchParams.pageNumber ?? 0), 0)
  const nextPage = Number(pageNumber) + 1
  const previousPage = Number(pageNumber) - 1

  const [showFailedLogins, setShowFailedLogins] = useState(false)

  if (!users) return <div>Error loading users</div>

  const filteredUsers = showFailedLogins
    ? users.filter(user => user.failed_login_attempts >= HIGH_FAILED_LOGINS)
    : users
  const hasMoreResults = filteredUsers.length === pageSize

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center self-end">
        <Button
          onClick={() => setShowFailedLogins(prevState => !prevState)}
          variant="outline"
          ariaLabel="Toggle failed login attempts"
        >
          {showFailedLogins ? "Show all Users" : "Show failed login attempts"}
        </Button>
        <Button onClick={handleExport(filteredUsers)} variant="outline" ariaLabel="Export user list">
          <FileDown size={14} />
        </Button>
      </div>
      <div className="flex items-center">
        <Card className="flex-1">
          <Table>
            <TableHeader>
              <TableRow data-row-index={0}>
                <TableHead scope="col" data-col-index={0}>
                  Name
                </TableHead>
                <TableHead scope="col" data-col-index={1}>
                  Email
                </TableHead>
                <TableHead scope="col" data-col-index={2}>
                  Last Login
                </TableHead>
                <TableHead scope="col" data-col-index={3}>
                  Last Failed Login
                </TableHead>
                <TableHead scope="col" data-col-index={4}>
                  Failed Login Count
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, rowIndex) => (
                <TableRow key={user.id} data-row-index={rowIndex + 1}>
                  <TableCell data-col-index={0}>
                    <Link
                      href={`/settings/admin/manage/${tenantId}/${user.id}`}
                      className="hover:underline"
                      aria-label={`View details for ${user.name || "user"}`}
                    >
                      {user.name || "-"}
                    </Link>
                  </TableCell>
                  <TableCell data-col-index={1}>{user.email || "-"}</TableCell>
                  <TableCell data-col-index={2}>
                    {user.last_login ? new Date(user.last_login).toLocaleString("en-AU") : "-"}
                  </TableCell>
                  <TableCell data-col-index={3}>
                    {user.last_failed_login ? new Date(user.last_failed_login).toLocaleString("en-AU") : "-"}
                  </TableCell>
                  <TableCell
                    data-col-index={4}
                    className={user.failed_login_attempts >= HIGH_FAILED_LOGINS ? "bg-alert text-black" : ""}
                  >
                    {user.failed_login_attempts !== null && user.failed_login_attempts !== undefined
                      ? user.failed_login_attempts.toString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end gap-2 p-2">
            {previousPage >= 0 && (
              <Button asChild size="icon" variant="outline" ariaLabel="Previous page">
                <Link
                  href={{
                    pathname: "/settings/users",
                    search: `?pageNumber=${previousPage}`,
                  }}
                >
                  <ChevronLeft />
                </Link>
              </Button>
            )}
            {hasMoreResults && (
              <Button asChild size="icon" variant="outline" ariaLabel="Next page">
                <Link
                  href={{
                    pathname: "/settings/users",
                    search: `?pageNumber=${nextPage}`,
                  }}
                >
                  <ChevronRight />
                </Link>
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default UserList
