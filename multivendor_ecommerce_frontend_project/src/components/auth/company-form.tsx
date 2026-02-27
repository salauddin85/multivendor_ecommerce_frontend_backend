"use client"

import { useState, useRef } from "react"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { useRegisterStore } from "@/lib/store"
import { registerUser } from "@/lib/auth.actions"
import { toast } from "react-toastify"
import { PasswordInput } from "./password-input"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"

const companySchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  store_name: Yup.string().required("Store name is required"),
  store_details: Yup.string().required("Store details are required"),
  nid_card_image: Yup.mixed().required("NID card image is required"),
  trade_license: Yup.mixed().required("Trade license is required"),
})

export function CompanyForm() {
  const router = useRouter()
  const store = useRegisterStore()
  const [loading, setLoading] = useState(false)
  const nidCardRef = useRef<HTMLInputElement>(null)
  const tradeLicenseRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (values: any, { setFieldError }: any) => {
    setLoading(true)
    try {
      const formData = new FormData()

      formData.append("email", values.email)
      formData.append("password", values.password)
      formData.append("first_name", values.first_name)
      formData.append("last_name", values.last_name)
      formData.append("store_name", values.store_name)
      formData.append("store_details", values.store_details)
      formData.append("nid_card_image", values.nid_card_image)
      formData.append("trade_license", values.trade_license)
      formData.append("phone_number", values.phone_number)
      formData.append("address", values.address)

      const response = await registerUser("company", formData)
      // console.log(response);
      if (response.success) {
        toast.success("Company registration successful! Redirecting to login...")
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
          } else {
            toast.error(response.message)
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
        email: store.email,
        password: store.formData.password || "",
        first_name: store.formData.first_name || "",
        last_name: store.formData.last_name || "",
        store_name: store.formData.store_name || "",
        store_details: store.formData.store_details || "",
        nid_card_image: null,
        trade_license: null,
        phone_number: store.formData.phone_number || "",
        address: store.formData.address || "",
      }}
      validationSchema={companySchema}
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
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <Field
                name="last_name"
                placeholder="Doe"
                className="form-input"
              />
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
            error={
              errors.password && touched.password ? errors.password : undefined
            }
          />

          <div className="form-group">
            <label className="form-label">Company Store Name</label>
            <Field
              name="store_name"
              placeholder="Food Heaven Store"
              className={`form-input ${
                errors.store_name && touched.store_name
                  ? "border-destructive"
                  : ""
              }`}
            />
            {errors.store_name && touched.store_name && (
              <p className="form-error">{errors.store_name}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Store Details</label>
            <Field
              name="store_details"
              as="textarea"
              placeholder="Describe your store"
              className={`form-input resize-none h-20 ${
                errors.store_details && touched.store_details
                  ? "border-destructive"
                  : ""
              }`}
            />
            {errors.store_details && touched.store_details && (
              <p className="form-error">{errors.store_details}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <Field
              name="phone_number"
              placeholder="+8801234567890"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <Field
              name="address"
              placeholder="123, Dhaka, Bangladesh"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">NID Card Image</label>
            <button
              type="button"
              onClick={() => nidCardRef.current?.click()}
              className="w-full border-2 border-dashed border-primary rounded-md p-6 flex items-center justify-center gap-2 hover:bg-primary/5 transition cursor-pointer"
            >
              <Upload size={18} className="text-primary" />
              <span className="text-primary font-medium">Upload NID Card</span>
            </button>
            <input
              ref={nidCardRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) =>
                setFieldValue("nid_card_image", e.target.files?.[0])
              }
            />
            {values.nid_card_image && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {(values.nid_card_image as any).name}
              </p>
            )}
            {errors.nid_card_image && touched.nid_card_image && (
              <p className="form-error">{errors.nid_card_image}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Trade License</label>
            <button
              type="button"
              onClick={() => tradeLicenseRef.current?.click()}
              className="w-full border-2 border-dashed border-primary rounded-md p-6 flex items-center justify-center gap-2 hover:bg-primary/5 transition cursor-pointer"
            >
              <Upload size={18} className="text-primary" />
              <span className="text-primary font-medium">
                Upload Trade License
              </span>
            </button>
            <input
              ref={tradeLicenseRef}
              type="file"
              accept=".pdf,image/*"
              hidden
              onChange={(e) =>
                setFieldValue("trade_license", e.target.files?.[0])
              }
            />
            {values.trade_license && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {(values.trade_license as any).name}
              </p>
            )}
            {errors.trade_license && touched.trade_license && (
              <p className="form-error">{errors.trade_license}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register as Company"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
