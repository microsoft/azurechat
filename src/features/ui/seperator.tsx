import * as SeparatorPrimitive from "@radix-ui/react-separator"
import React, { memo } from "react"

import Typography from "@/components/typography"

interface SeparatorProps {
  title: string
  description: string
  linkSets: string[][]
  titleId: string
  descriptionId: string
  variant: "full-width-horizontal" | "full-width-vertical" | "custom-width-horizontal" | "custom-width-vertical"
  width?: string
}

const Separator: React.FC<SeparatorProps> = memo(
  ({ title, description, linkSets, titleId, descriptionId, variant, width }) => {
    const isFullWidth = variant.includes("full-width")
    const isHorizontal = variant.includes("horizontal")
    const containerStyle = isFullWidth ? "w-full" : `w-[${width}]`
    const separatorOrientation = isHorizontal ? "data-[orientation=horizontal]" : "data-[orientation=vertical]"

    return (
      <div
        className={`${containerStyle} ${isHorizontal ? "mx-[15px] max-w-[300px]" : "h-full"} flex flex-col`}
        role="group"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <Typography id={titleId} variant="h3" className="text-heading">
          {title}
        </Typography>
        <Typography id={descriptionId} variant="p" className="text-text">
          {description}
        </Typography>
        {linkSets.map((links, setIndex) => (
          <React.Fragment key={setIndex}>
            {setIndex > 0 && (
              <SeparatorPrimitive.Root
                className={`bg-accent ${separatorOrientation}:h-px ${separatorOrientation}:w-full ${separatorOrientation}:h-full ${separatorOrientation}:w-px my-[15px]`}
              />
            )}
            <div className={`flex ${isHorizontal ? "h-5" : "w-full"} items-center`}>
              {links.map((link, index) => (
                <React.Fragment key={index}>
                  <Typography variant="span" className="text-text">
                    {link}
                  </Typography>
                  {index < links.length - 1 && (
                    <SeparatorPrimitive.Root
                      className={`bg-accent ${separatorOrientation}:h-px ${separatorOrientation}:w-full ${separatorOrientation}:h-full ${separatorOrientation}:w-px mx-[15px]`}
                      decorative
                      orientation={isHorizontal ? "vertical" : "horizontal"}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    )
  }
)

Separator.displayName = "Separator"

export default Separator
