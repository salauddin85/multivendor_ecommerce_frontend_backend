import ContactInfo from "@/components/Contact/ContactInfo";
import ContactForm from "@/components/Contact/ContactForm";
import GoogleMap from "@/components/Contact/GoogleMap";

export default function Page() {
  return (
    <div className="space-y-5 py-5 container mx-auto px-4">
      {/* Contact Form Section */}
      <section>
        <div className="container mx-auto px-4">
          <ContactForm />
        </div>
      </section>

      {/* Map Section */}
      <section className=" py-5">
        <div className="container mx-auto px-4">
          <GoogleMap />
        </div>
      </section>

      {/* Contact Info Section */}
      <section>
        <div className="container mx-auto px-4">
          <ContactInfo />
        </div>
      </section>
    </div>
  );
}