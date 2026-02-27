"use client"

import { useState } from "react"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { useRegisterStore } from "@/lib/store"
import { registerUser } from "@/lib/auth.actions"
import { toast } from "react-toastify"
import { PasswordInput } from "./password-input"
import { useRouter } from "next/navigation"

const customerSchema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  phone_number: Yup.string().required("Phone number is required"),
  remember_me: Yup.boolean(),
})

export function CustomerForm() {
  const router = useRouter()
  const store = useRegisterStore()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: any, { setFieldError }: any,) => {
    setLoading(true)
    try {
      const response = await registerUser("customer", values)
      // console.log(response);
      if (response.success) {
        toast.success("Registration successful! Redirecting to login...")
        setTimeout(() => {
          router.push(`/login?email=${values.email}`)
        }, 1500)
      } else {
          const { errors } = response.data;
          // console.log(response.data);
          if (errors) {
            Object.entries(errors).forEach(([field, messages]) => {
              const errorMessage = Array.isArray(messages)
                ? messages[0]
                : messages;
              setFieldError(field, errorMessage as string);
            });
          }else {
            toast.error(response.message);
          }
        
      }
    } catch (error: any) {
      console.error(error)
      toast.error("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Formik
      initialValues={{
        first_name: store.formData.first_name || "",
        last_name: store.formData.last_name || "",
        email: store.email,
        password: store.formData.password || "",
        phone_number: store.formData.phone_number || "",
        remember_me: false,
      }}
      validationSchema={customerSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, values, setFieldValue }) => (
        <Form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <Field
                name="first_name"
                placeholder="John"
                className={`form-input ${errors.first_name && touched.first_name ? "border-destructive" : ""}`}
              />
              {errors.first_name && touched.first_name && <p className="form-error">{errors.first_name}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <Field
                name="last_name"
                placeholder="Doe"
                className={`form-input ${errors.last_name && touched.last_name ? "border-destructive" : ""}`}
              />
              {errors.last_name && touched.last_name && <p className="form-error">{errors.last_name}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <Field
              name="email"
              type="email"
              placeholder="your@email.com"
              disabled
              className="form-input opacity-60 cursor-not-allowed"
            />
          </div>

          <PasswordInput
            label="Password"
            value={values.password}
            onChange={(val) => setFieldValue("password", val)}
            error={errors.password && touched.password ? errors.password : undefined}
          />

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <Field
              name="phone_number"
              placeholder="+8801234567890"
              className={`form-input ${errors.phone_number && touched.phone_number ? "border-destructive" : ""}`}
            />
            {errors.phone_number && touched.phone_number && <p className="form-error">{errors.phone_number}</p>}
          </div>

          <div className="flex items-center gap-2">
            <Field name="remember_me" type="checkbox" id="customer-remember" className="w-4 h-4 cursor-pointer" />
            <label htmlFor="customer-remember" className="text-sm text-foreground cursor-pointer">
              I agree to the terms and conditions
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register as Customer"}
          </button>
        </Form>
      )}
    </Formik>
  )
}
