import Typography from "@/components/typography"

export const SupportEmail: React.FC<{ email: string }> = ({ email }) => (
  <Typography variant="h5" className="mb-4">
    Support Email:
    <div className="mt-2 rounded-md bg-altBackgroundShade p-4">
      <b>{email}</b>
    </div>
  </Typography>
)
