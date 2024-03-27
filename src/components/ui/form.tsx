import React, { useEffect, useState } from "react"
import * as Form from "@radix-ui/react-form"

interface PromptFormData {
  fullName: string
  jobTitle: string
  teamOrBusinessUnit: string
  departmentOrOrganisation: string
  additionalInfo: string
}

type FormFieldProps = {
  label: string
  name: keyof PromptFormData
  type?: string
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

const FormField: React.FC<FormFieldProps> = ({ label, name, type = "text", onChange }) => (
  <Form.Field name={name}>
    <Form.Label htmlFor={name}>{label}</Form.Label>
    <input
      type={type}
      id={name}
      name={name}
      required
      onChange={onChange}
      className="input-style"
      placeholder={label}
      title={label}
    />{" "}
    <Form.Message />
  </Form.Field>
)

const PromptForm: React.FC = () => {
  const [formData, setFormData] = React.useState<PromptFormData>({
    fullName: "",
    jobTitle: "",
    teamOrBusinessUnit: "",
    departmentOrOrganisation: "",
    additionalInfo: "",
  })
  const checkFormValidity = React.useCallback(() => {
    const isValid = Object.values(formData).every(value => value.trim() !== "")
    setIsFormValid(isValid)
  }, [formData])
  useEffect(() => {
    checkFormValidity()
  }, [formData, checkFormValidity])

  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      // TODO Handle successful form submission here, e.g., showing a success message
      console.log("Form submitted successfully")
    } catch (error) {
      // TODO Handle errors here, e.g., showing an error message
      console.error("Failed to submit form:", error)
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Form.Root onSubmit={handleSubmit}>
      <FormField label="Full Name" name="fullName" onChange={handleChange} />
      <FormField label="Job Title" name="jobTitle" onChange={handleChange} />
      <FormField label="Team or Business Unit Name" name="teamOrBusinessUnit" onChange={handleChange} />
      <FormField label="Department or Organisation Name" name="departmentOrOrganisation" onChange={handleChange} />

      <Form.Field name="additionalInfo">
        <Form.Label htmlFor="additionalInfo">Additional Information</Form.Label>
        <textarea
          id="additionalInfo"
          name="additionalInfo"
          required
          onChange={handleChange}
          placeholder="Enter additional information"
          className="textarea-style"
        />
        <Form.Message />
      </Form.Field>

      <div>Form Validity: {isFormValid ? "valid" : "invalid"}</div>

      <button type="submit" className="submit-button-style">
        Submit
      </button>
    </Form.Root>
  )
}

export default PromptForm
