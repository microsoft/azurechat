"use client"

import { PropsWithChildren, createContext, useContext, useEffect, useReducer } from "react"

import { showError } from "@/features/globals/global-message-store"
import { TenantDetails } from "@/features/models/tenant-models"
import { UserRecord } from "@/features/models/user-models"
import { ActionBase } from "@/lib/utils"

type AdminContextDefinition = ReturnType<typeof useAdminContextHook>
const AdminContext = createContext<AdminContextDefinition | null>(null)

const useAdminContextHook = ({ tenants, fetchUserRecords }: AdminProviderProps): State => {
  const [state, dispatch] = useReducer(adminReducer, {
    tenants,
    users: [],
    selectTenant: tenant => dispatch({ type: "SELECT_TENANT", payload: tenant }),
    selectUser: user => dispatch({ type: "SELECT_USER", payload: user }),
  })

  useEffect(() => {
    if (!state.selectedTenant?.id) return
    fetchUserRecords(state.selectedTenant.id)
      .then(users => dispatch({ type: "SET_USERS", payload: users }))
      .catch(showError)
  }, [fetchUserRecords, state.selectedTenant?.id])

  return { ...state }
}

export const useAdminContext = (): AdminContextDefinition => {
  const context = useContext(AdminContext)
  if (!context) throw new Error("AdminContext hasn't been provided!")
  return context
}

type AdminProviderProps = {
  tenants: TenantDetails[]
  fetchUserRecords: (tenantId: string) => Promise<UserRecord[]>
}
export default function AdminProvider({
  children,
  tenants,
  fetchUserRecords,
}: PropsWithChildren<AdminProviderProps>): JSX.Element {
  const value = useAdminContextHook({ tenants, fetchUserRecords })
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

type State = {
  tenants: TenantDetails[]
  users: UserRecord[]
  selectedTenant?: TenantDetails
  selectedUser?: UserRecord
  selectTenant: (tenant?: TenantDetails) => void
  selectUser: (user?: UserRecord) => void
}

function adminReducer(state: State, action: ACTION): State {
  switch (action.type) {
    case "SELECT_TENANT":
      return {
        ...state,
        selectedTenant: action.payload,
        selectedUser: undefined,
      }
    case "SET_USERS":
      return {
        ...state,
        users: action.payload,
      }
    case "SELECT_USER":
      return {
        ...state,
        selectedUser: action.payload,
      }
    default:
      return state
  }
}

type ACTION =
  | ActionBase<"SELECT_TENANT", { payload?: TenantDetails }>
  | ActionBase<"SET_USERS", { payload: UserRecord[] }>
  | ActionBase<"SELECT_USER", { payload?: UserRecord }>
