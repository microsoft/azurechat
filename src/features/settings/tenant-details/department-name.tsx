import React from "react"

import Typography from "@/components/typography"

export const DepartmentName: React.FC<{ name: string }> = ({ name }) => (
  <Typography variant="h5" className="mb-4">
    Department Name:
    <div className="mt-2 rounded-md bg-altBackgroundShade p-4">
      <b>{name}</b>
    </div>
  </Typography>
)
