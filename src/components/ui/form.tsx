"use client";

import React, { useState } from 'react';
import * as Form from '@radix-ui/react-form';

// Define the form data type for type safety
interface PromptFormData {
  fullName: string;
  jobTitle: string;
  teamOrBusinessUnit: string;
  departmentOrOrganisation: string;
  additionalInfo: string;
}

// Define props for the FormField component
type FormFieldProps = {
  label: string;
  name: keyof PromptFormData;
  type?: string;
};

// Reusable FormField component for text inputs
const FormField: React.FC<FormFieldProps> = ({ label, name, type = 'text' }) => (
  <Form.Field name={name}>
    <Form.Label htmlFor={name}>{label}</Form.Label>
    <Form.Control type={type} id={name} required />
    <Form.Message />
  </Form.Field>
);

// The main PromptForm component
const PromptForm: React.FC = () => {
  // State for managing form data
  const [formData, setFormData] = useState<PromptFormData>({
    fullName: '',
    jobTitle: '',
    teamOrBusinessUnit: '',
    departmentOrOrganisation: '',
    additionalInfo: '',
  });

  // Handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(formData);
    // Handle form data, e.g., by sending it to an API
  };

  // Update state based on input changes
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Form.Root onSubmit={handleSubmit}>
      <FormField label="Full Name" name="fullName" />
      <FormField label="Job Title" name="jobTitle" />
      <FormField label="Team or Business Unit Name" name="teamOrBusinessUnit" />
      <FormField label="Department or Organisation Name" name="departmentOrOrganisation" />

      <Form.Field name="additionalInfo">
        <Form.Label htmlFor="additionalInfo">Additional Information</Form.Label>
        <textarea
          id="additionalInfo"
          name="additionalInfo"
          required
          onChange={handleChange}
        />
        <Form.Message />
      </Form.Field>

      <Form.ValidityState>
        {(validity) => <div>Form Validity: {validity ? 'valid' : 'invalid'}</div>}
      </Form.ValidityState>

      <button type="submit">Submit</button>
    </Form.Root>
  );
};

export default PromptForm;