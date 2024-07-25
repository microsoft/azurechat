import { ChevronLeft, ChevronRight, UserSearch } from "lucide-react"
import Link from "next/link"

import { Button } from "@/features/ui/button"
import { Card } from "@/features/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/features/ui/table"

import { TenantDetails } from "./models"

export type TenantListProps = {
  baseUrl: string
  tenants: TenantDetails[]
  searchParams: {
    pageSize?: number
    pageNumber?: number
  }
}

export const TenantList = ({ tenants, searchParams, baseUrl }: TenantListProps): JSX.Element => {
  const pageSize = Number(searchParams.pageSize ?? 20)
  const pageNumber = Math.max(Number(searchParams.pageNumber ?? 0), 0)
  const nextPage = Number(pageNumber) + 1
  const previousPage = Number(pageNumber) - 1

  if (!tenants) return <div>Error loading tenants</div>

  const hasMoreResults = tenants.length === pageSize

  return (
    <div className="flex items-center space-x-2">
      <Card className="flex-1">
        <Table>
          <TableHeader>
            <TableRow data-row-index={0}>
              <TableHead scope="col" data-col-index={0}>
                Name
              </TableHead>
              <TableHead scope="col" data-col-index={1}>
                Domain
              </TableHead>
              <TableHead scope="col" data-col-index={2}>
                Group Login
              </TableHead>
              <TableHead scope="col" data-col-index={3}>
                Date Onboarded
              </TableHead>
              <TableHead scope="col" data-col-index={4}>
                Users
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant, rowIndex) => (
              <TableRow key={tenant.id} data-row-index={rowIndex + 1}>
                <TableCell data-col-index={0}>
                  <Link
                    href={`/settings/admin/tenants/${tenant.id}`}
                    className="hover:underline"
                    aria-label={`View details for ${tenant.departmentName}`}
                  >
                    {tenant.departmentName}
                  </Link>
                </TableCell>
                <TableCell data-col-index={1}>{tenant.primaryDomain}</TableCell>
                <TableCell data-col-index={2}>{tenant.requiresGroupLogin ? "On" : "Off"}</TableCell>
                <TableCell data-col-index={3}>
                  {tenant.dateOnBoarded
                    ? new Date(tenant.dateOnBoarded).toLocaleString("en-AU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "-"}
                </TableCell>
                <TableCell data-col-index={4}>
                  <Link
                    href={`${baseUrl}/${tenant.id}`}
                    className="flex items-center justify-center hover:underline"
                    aria-label={`View users for ${tenant.departmentName}`}
                  >
                    <UserSearch size={16} />
                    <span>View Users</span>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end gap-2 p-2">
          <Button size={"icon"} variant={"outline"} ariaLabel="Previous page" disabled={pageNumber === 0}>
            <Link
              href={{
                pathname: `${baseUrl}`,
                search: `?pageNumber=${previousPage}`,
              }}
            >
              <ChevronLeft />
            </Link>
          </Button>
          <Button size={"icon"} variant={"outline"} ariaLabel="Next page" disabled={!hasMoreResults}>
            <Link
              href={{
                pathname: `${baseUrl}`,
                search: `?pageNumber=${nextPage}`,
              }}
            >
              <ChevronRight />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default TenantList
