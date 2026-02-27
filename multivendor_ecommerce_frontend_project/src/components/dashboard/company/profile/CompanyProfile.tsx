import React from "react";
import Image from "next/image";

interface CompanyProfilePageProps {
  profile_details: any;
}

export default function CompanyProfilePage({
  profile_details,
}: CompanyProfilePageProps) {
  const { data } = profile_details;


  if (!data) {
    return <div className="text-center py-10">No profile data found</div>;
  }

  const {
    user,
    phone_number,
    address,
    nid_card_image,
    store_details,
    trade_license,
    status,
  } = data;

  const formatBDDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      timeZone: "Asia/Dhaka",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const activeStatusColor = (isActive: boolean) =>
    isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";

  const statusColor =
    status === "approved"
      ? "bg-green-100 text-green-700"
      : status === "rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-lg">
            {user.first_name?.[0]}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-sm text-slate-500">{user.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              Store Owner • ID: {data.id}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-2 sm:mt-0">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${activeStatusColor(
                user.is_active
              )}`}
            >
              {user.is_active ? "Active" : "Inactive"}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor}`}
            >
              {status}
            </span>
            <span className="text-xs text-slate-500">
              Joined: {formatBDDate(user.date_joined)}
            </span>
          </div>
        </div>

        <button className="px-5 py-2 rounded-md text-white bg-orange-400 hover:bg-orange-500 transition self-start sm:self-auto">
          Update Profile
        </button>
      </div>

      {/* BASIC INFO */}
      <SectionCard title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem label="Phone Number" value={phone_number} />
          <InfoItem label="Address" value={address} />
          <InfoItem label="User Type" value={user.user_type} />
          <InfoItem label="Verification Status" value={status} badge />
        </div>
      </SectionCard>

      {/* STORE DETAILS */}
      <SectionCard title="Store Details">
        <div className="space-y-1">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
            Store Information
          </p>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-slate-700 whitespace-pre-line">
              {store_details || "No store details provided"}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* DOCUMENTS */}
      <SectionCard title="Verification Documents">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ImageItem
            label="NID Card"
            src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${nid_card_image}`}
          />
          <ImageItem
            label="Trade License"
            src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${trade_license}`}
          />
        </div>
      </SectionCard>
    </div>
  );
}

/* ----------------------- */
/* Reusable UI Blocks */
/* ----------------------- */

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-xl border shadow-sm">
    <div className="border-b px-5 py-3">
      <h2 className="text-sm font-semibold text-slate-700 tracking-wide uppercase">
        {title}
      </h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const InfoItem = ({
  label,
  value,
  badge = false,
}: {
  label: string;
  value: string;
  badge?: boolean;
}) => {
  const statusColor =
    value === "approved"
      ? "bg-green-100 text-green-700"
      : value === "rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      {badge ? (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor}`}
        >
          {value}
        </span>
      ) : (
        <p className="text-slate-800 font-medium">{value || "Not provided"}</p>
      )}
    </div>
  );
};

const ImageItem = ({ label, src }: { label: string; src: string }) => (
  <div className="space-y-2">
    <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
    <div className="group relative overflow-hidden rounded-lg border bg-slate-50 min-h-[192px]">
      <Image
        src={src}
        alt={label}
        className="w-full h-48 object-contain transition-transform duration-300 group-hover:scale-105"
        width={400}
        height={192}
      />
    </div>
  </div>
);