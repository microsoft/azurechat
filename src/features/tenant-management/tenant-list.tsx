import { ChevronLeft, ChevronRight, UserSearch } from "lucide-react"
import Link from "next/link"

import Typography from "@/components/typography"
import { useAdminContext } from "@/features/settings/admin/admin-provider"
import { Button } from "@/features/ui/button"
import { Card } from "@/features/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/features/ui/table"

export type TenantListProps = {
  searchParams: {
    pageSize?: number
    pageNumber?: number
  }
}

export const TenantList = (props: TenantListProps): JSX.Element => {
  const { tenants } = useAdminContext()
  const pageSize = Number(props.searchParams.pageSize ?? 20)
  const pageNumber = Math.max(Number(props.searchParams.pageNumber ?? 0), 0)
  const nextPage = Number(pageNumber) + 1
  const previousPage = Number(pageNumber) - 1

  if (!tenants) return <div>Error loading tenants</div>

  const hasMoreResults = tenants.length === pageSize

  return (
    <div className="flex size-full overflow-y-auto pt-8">
      <div className="container mx-auto size-full space-y-8">
        <div>
          <Typography variant="h2" className="text-2xl font-bold tracking-tight">
            Tenant Management
          </Typography>
          <Typography variant="h3" className="text-muted-foreground">
            Below is a list of all tenants
          </Typography>
        </div>
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
                        href={`/settings/tenants/${tenant.id}`}
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
                        href={`/settings/tenants/${tenant.id}`}
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
                    pathname: "/settings/tenants",
                    search: `?pageNumber=${previousPage}`,
                  }}
                >
                  <ChevronLeft />
                </Link>
              </Button>
              <Button size={"icon"} variant={"outline"} ariaLabel="Next page" disabled={!hasMoreResults}>
                <Link
                  href={{
                    pathname: "/settings/tenants",
                    search: `?pageNumber=${nextPage}`,
                  }}
                >
                  <ChevronRight />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TenantList
