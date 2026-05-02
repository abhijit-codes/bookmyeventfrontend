import { Link } from "react-router-dom"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/Button"
import { BadgeCheck, Banknote, Briefcase, CalendarCheck, FileText, LockKeyhole, Mail, MapPin, Phone, ShieldCheck, Store, Users } from "lucide-react"
import aboutImage from "@/assets/image1.jpg"

const supportPhone = "8144273014"
const supportEmail = "bookmyevent326@gmail.com"

const pageContent = {
  contact: {
    title: "Contact",
    description: "Reach BookMyEvent for booking help, vendor support, payments, or account questions.",
    sections: [
      { title: "Call us", body: supportPhone, icon: Phone, href: `tel:${supportPhone}` },
      { title: "Email us", body: supportEmail, icon: Mail, href: `mailto:${supportEmail}` },
      { title: "Service area", body: "Odisha event bookings, vendor discovery, and customer support.", icon: MapPin },
    ],
  },
  careers: {
    title: "Careers",
    description: "Help us build a trusted event booking platform for customers and local vendors.",
    sections: [
      { title: "Current openings", body: "We are not hiring for fixed roles right now, but you can email your profile for future openings.", icon: Briefcase, href: `mailto:${supportEmail}` },
      { title: "What we value", body: "Customer care, vendor trust, fast problem solving, and reliable operations." },
    ],
  },
  about: {
    title: "About Us",
    description: "BookMyEvent is a local event booking platform that connects customers with verified vendors for weddings, parties, corporate events, and family celebrations.",
    image: aboutImage,
    sections: [
      { title: "Who we are", body: "We built BookMyEvent to make event planning simple, transparent, and dependable for people who need trusted services in one place.", icon: Users },
      { title: "For customers", body: "Customers can discover approved vendors, compare services, save favorites, request bookings, track payments, and manage event orders from a personal dashboard.", icon: CalendarCheck },
      { title: "For vendors", body: "Vendors can register their business, submit verification documents, list services, receive bookings, manage orders, view reviews, and track wallet settlement records.", icon: Store },
      { title: "Our promise", body: "We focus on verified profiles, clear booking status, support communication, and secure payment records so customers and vendors can work with confidence.", icon: ShieldCheck },
    ],
  },
  help: {
    title: "Help Center",
    description: "Get support for booking, payments, vendor accounts, and profile access.",
    sections: [
      { title: "Phone support", body: supportPhone, icon: Phone, href: `tel:${supportPhone}` },
      { title: "Email support", body: supportEmail, icon: Mail, href: `mailto:${supportEmail}` },
      { title: "Common help topics", body: "Booking status, payment confirmation, vendor approval, profile photo updates, and cancellation support." },
    ],
  },
  pricing: {
    title: "Vendor Pricing Plans",
    description: "BookMyEvent follows a simple vendor payment release plan for confirmed bookings.",
    notice: "Vendor payments are connected with booking status, event delivery, and admin verification.",
    sections: [
      { title: "Booking-time payment", body: "After a customer confirms a booking, 30% of the vendor payment is marked for the vendor at booking time according to the platform payment record.", icon: Banknote },
      { title: "Event-day payment", body: "On the event day, 40% of the vendor payment is processed according to event status, customer confirmation, and platform records.", icon: CalendarCheck },
      { title: "After completion", body: "The final 30% is released after the event is completed and the booking is closed without a valid dispute, misuse report, or service failure.", icon: BadgeCheck },
      { title: "Misuse or non-completion", body: "If a vendor accepts an order but does not complete the event, misuses customer trust, or violates platform rules, BookMyEvent may hold payments, suspend the account, and take legal action as permitted by law.", icon: ShieldCheck },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    description: "These terms apply to customers, vendors, admins, visitors, and every account that uses BookMyEvent.",
    notice: "This page is a project policy for platform use and is not a substitute for legal advice.",
    sections: [
      { title: "Acceptance of terms", body: "By creating an account, registering as a vendor, browsing vendors, requesting a booking, uploading documents, making a payment, or using any dashboard feature, the user agrees to follow these terms.", icon: FileText },
      { title: "Customer responsibilities", body: "Customers must provide correct name, phone number, event date, time, location, address, guest or event requirements, and payment details. Customers should review vendor service details before placing a booking request.", icon: Users },
      { title: "Vendor responsibilities", body: "Vendors must provide accurate business details, service names, service pricing, availability, photos, documents, address, bank details, and contact information. Vendors must accept, reject, complete, or update bookings honestly and deliver the agreed service.", icon: Store },
      { title: "Vendor approval", body: "Vendor accounts, identity documents, business information, service photos, and bank details may be reviewed by the admin. BookMyEvent may reject, suspend, hide, or limit vendor access if information is false, incomplete, misleading, unsafe, or against platform rules.", icon: ShieldCheck },
      { title: "Bookings and service delivery", body: "Booking status, rejection, expiry, cancellation, payment progress, completion, and review flow are managed through the platform dashboard. Customers and vendors should not bypass BookMyEvent for active platform bookings.", icon: CalendarCheck },
      { title: "Wrong order cancellation", body: "If a customer places a booking by mistake, they may request cancellation by giving a specific reason. If the request is valid and accepted under platform rules, the eligible payment amount will be transferred back within 6 hours.", icon: BadgeCheck },
      { title: "Remaining customer payment", body: "If a vendor accepts the order, the customer must pay the remaining amount within 48 hours. If the customer does not pay within this time, the advance amount will be non-refundable.", icon: Banknote },
      { title: "Vendor payment release", body: "For vendors, payment is released in stages: 30% at booking time, 40% on the event day, and the final 30% after the event is completed and verified without a valid dispute.", icon: Banknote },
      { title: "Vendor non-completion or misuse", body: "If a vendor accepts an order and fails to complete the event, misuses customer information, commits fraud, or violates service trust, BookMyEvent may suspend the vendor, hold payments, remove listings, and take legal action under applicable law.", icon: ShieldCheck },
      { title: "Payments, refunds, and settlements", body: "Advance payments, remaining payments, refunds, wallet entries, withdrawals, service charges, commissions, and vendor settlement records follow the payment and booking status stored in the system.", icon: Banknote },
      { title: "Reviews and communication", body: "Customers should post fair reviews based on genuine booking experiences. Vendors should not create fake reviews or pressure customers to change feedback. Support messages must be respectful and related to real platform issues.", icon: Mail },
      { title: "Fair use and prohibited activity", body: "Customers and vendors must not upload false documents, create fake accounts, submit fake bookings, abuse support, misuse payment flows, copy vendor/customer data, attempt unauthorized access, or use BookMyEvent for illegal or harmful activity.", icon: LockKeyhole },
      { title: "Support and disputes", body: `For booking, payment, cancellation, vendor, refund, settlement, review, or account issues, contact ${supportEmail} or ${supportPhone}. BookMyEvent may review dashboard records, payment records, uploaded documents, support messages, notifications, reviews, and account history before resolving a dispute.`, icon: BadgeCheck },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    description: "This policy explains what BookMyEvent stores, why it is stored, and how it supports customers, vendors, and admins.",
    notice: "BookMyEvent uses personal and business information only for platform operations, verification, support, booking, payment, and safety purposes.",
    sections: [
      { title: "Customer data", body: "We store customer name, email, phone number, profile photo, address information, favorites, booking history, payment records, notifications, reviews, support tickets, and account settings.", icon: Users },
      { title: "Vendor data", body: "We store vendor name, business details, phone number, email, business address, service listings, service photos, identity and verification documents, bank account verification status, bookings, wallet records, withdrawals, reviews, notifications, and support tickets.", icon: Store },
      { title: "How data is used", body: "Data is used to create accounts, verify vendors, show vendor listings, process bookings, track payments, manage refunds and settlements, calculate wallet records, send notifications, prevent misuse, and support communication between customers, vendors, and admins.", icon: BadgeCheck },
      { title: "Payment and bank data", body: "Payment records are stored for booking tracking, refund handling, commission records, and vendor settlement. Vendor bank account numbers are encrypted before storage, and only limited account details are shown in the dashboard.", icon: Banknote },
      { title: "Cancellation and refund records", body: "If a customer cancels a wrong order with a specific reason, BookMyEvent may store the cancellation reason, booking status, refund status, and payment transfer record. Eligible transfers are handled within 6 hours according to platform rules.", icon: CalendarCheck },
      { title: "Remaining payment records", body: "When a vendor accepts a booking, BookMyEvent stores the acceptance time and remaining payment deadline. Customers must pay the rest amount within 48 hours, otherwise the advance payment is treated as non-refundable under the booking policy.", icon: Banknote },
      { title: "Vendor settlement records", body: "Vendor settlement data is stored for staged payment release: 30% at booking time, 40% on the event day, and 30% after event completion. These records help verify payment history, event status, disputes, and wallet entries.", icon: Banknote },
      { title: "Misuse and legal action records", body: "If a vendor accepts an order but does not complete the event, misuses information, or violates customer trust, BookMyEvent may keep related booking, communication, payment, and evidence records for admin action, account restriction, and legal action under applicable law.", icon: ShieldCheck },
      { title: "Uploads and documents", body: "Uploaded profile photos, service images, Aadhaar/PAN-style verification documents, selfies, and booking-related files are used for account verification, vendor trust, listing display, admin review, and dispute support.", icon: FileText },
      { title: "Browser storage", body: "BookMyEvent uses browser local storage for the login session token and basic account cache so users can stay signed in. Project data such as favorites, bookings, vendors, payments, messages, and support records is saved in the backend database.", icon: LockKeyhole },
      { title: "Access and security", body: "Dashboard data is protected by authenticated API access. Customers can access their own account data, vendors can access their own business data, and admins can review platform records needed for approval, moderation, support, disputes, payments, and operations.", icon: ShieldCheck },
      { title: "Privacy contact", body: `For privacy questions, correction requests, document concerns, or data-related support, email ${supportEmail} or call ${supportPhone}.`, icon: Mail },
    ],
  },
}

function AboutPage({ content }) {
  return (
    <>
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">BookMyEvent</p>
            <h1 className="mt-3 text-4xl font-bold text-foreground">{content.title}</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">{content.description}</p>
            <p className="mt-5 text-muted-foreground">
              From vendor discovery to booking requests, payments, wallet settlement, reviews, notifications, and support, the platform helps both sides manage the full event journey in one trusted dashboard.
            </p>
          </div>
          <img src={content.image} alt="BookMyEvent event planning preview" className="h-full max-h-[420px] w-full rounded-lg object-cover shadow-xl" />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:px-8">
        {content.sections.map((section) => {
          const Icon = section.icon || BadgeCheck
          return (
            <article key={section.title} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
              <h2 className="mt-4 text-lg font-semibold text-foreground">{section.title}</h2>
              <p className="mt-2 text-muted-foreground">{section.body}</p>
            </article>
          )
        })}
      </section>
    </>
  )
}

export default function InfoPage({ type }) {
  const content = pageContent[type] || pageContent.about
  const isAbout = type === "about"

  return (
    <div className="public-white-page flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 bg-white">
        {isAbout ? <AboutPage content={content} /> : <>
          <section className="border-b border-border bg-white">
            <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">BookMyEvent</p>
              <h1 className="mt-3 text-4xl font-bold text-foreground">{content.title}</h1>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{content.description}</p>
              {content.notice && (
                <p className="mt-5 max-w-3xl rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  {content.notice}
                </p>
              )}
            </div>
          </section>

          <section className="mx-auto grid max-w-5xl gap-4 px-4 py-10 sm:px-6 lg:px-8">
            {content.sections.map((section) => {
              const Icon = section.icon
              const body = section.href ? <a href={section.href} className="font-semibold text-primary hover:underline">{section.body}</a> : section.body
              return (
                <article key={section.title} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    {Icon && <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>}
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                      <p className="mt-1 leading-7 text-muted-foreground">{body}</p>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        </>}
        <section className="mx-auto max-w-5xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="mt-2">
            <Button asChild variant="outline">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
