import Typography from "@/components/typography"

export const DomainDetails: React.FC<{ domain: string }> = ({ domain }) => (
  <Typography variant="h5" className="mb-4">
    Domain:
    <div className="mt-2 rounded-md bg-altBackgroundShade p-4">
      <b>{domain}</b>
    </div>
  </Typography>
)
