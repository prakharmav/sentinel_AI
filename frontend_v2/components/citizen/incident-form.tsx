"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FormField } from "@/components/forms/form-field"
import { FormSelect } from "@/components/forms/form-select"
import { FormTextarea } from "@/components/forms/form-textarea"
import { cn } from "@/lib/utils"

const incidentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.string().min(1, "Please select an incident category"),
  description: z.string().min(15, "Description must be at least 15 characters"),
  location: z.string().min(5, "Please enter a valid location description"),
})

type IncidentFormData = z.infer<typeof incidentSchema>

const categoryOptions = [
  { label: "Financial Fraud", value: "financial" },
  { label: "Cyber Bullying/Harassment", value: "harassment" },
  { label: "Phishing/Identity Theft", value: "phishing" },
  { label: "Other Cyber Crime", value: "other" },
]

interface IncidentFormProps {
  onSubmit: (data: IncidentFormData) => void
  className?: string
}

export function IncidentForm({ onSubmit, className }: IncidentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
      <FormField
        label="Incident Title"
        id="title"
        placeholder="Brief name of cyber threat/crime"
        error={errors.title?.message}
        {...register("title")}
      />
      <FormSelect
        label="Incident Category"
        id="category"
        options={categoryOptions}
        error={errors.category?.message}
        {...register("category")}
      />
      <FormTextarea
        label="Incident Details"
        id="description"
        placeholder="Provide complete description of the events, links, or suspect handles..."
        error={errors.description?.message}
        {...register("description")}
      />
      <FormField
        label="Location Details"
        id="location"
        placeholder="Physical address or region of origin"
        error={errors.location?.message}
        {...register("location")}
      />
      <button
        type="submit"
        className="w-full h-10 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all focus-ring active:scale-95"
      >
        Submit Official Report
      </button>
    </form>
  )
}
