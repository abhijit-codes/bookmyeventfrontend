import { Link } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import cateringImage from "@/assets/image1.jpg"
import photographyImage from "@/assets/image3.jpg"
import djImage from "@/assets/image4.jpg"
import venueImage from "@/assets/image5.jpg"

const categories = [
  {
    name: "Catering & Food Services",
    summary: "Catering services, buffet counters, dessert stations...",
    href: "/vendors?category=Catering",
    image: cateringImage,
    tone: "bg-gradient-to-br from-yellow-soft via-ivory to-blue-soft",
  },
  {
    name: "Photography & Videography",
    summary: "Wedding shoots, event coverage, reels and albums...",
    href: "/vendors?category=Photography",
    image: photographyImage,
    tone: "bg-gradient-to-br from-blue-soft via-ivory to-yellow-soft",
  },
  {
    name: "Decoration & Event Styling",
    summary: "Theme decor, stage styling, party setups...",
    href: "/vendors?category=Decoration",
    image: venueImage,
    tone: "bg-gradient-to-br from-red-soft via-ivory to-yellow-soft",
  },
  {
    name: "DJs & Venues",
    summary: "Music nights, party halls, banquet spaces...",
    href: "/vendors?event=party",
    image: djImage,
    tone: "bg-gradient-to-br from-yellow-soft via-red-soft to-blue-soft",
  },
]

export function CategoriesSection() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Service Categories
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              Browse complete categories and jump directly to service pages with ready vendor selections.
            </p>
          </div>
          <Link to="/vendors" className="text-sm font-semibold text-primary hover:text-gold-deep hover:underline">
            View all Categories ›
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.href}
              className="group grid min-h-52 overflow-hidden rounded-[1.75rem] border border-brand-yellow/35 bg-card shadow-[0_18px_55px_rgba(16,24,40,0.10)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-yellow/70 hover:shadow-xl sm:grid-cols-[1.45fr_0.7fr]"
            >
              <div className={`relative z-10 flex flex-col justify-center rounded-r-[4rem] p-8 ring-1 ring-white/60 ${category.tone}`}>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">{category.name}</h3>
                  <ChevronDown className="h-4 w-4 text-foreground transition-transform group-hover:translate-y-0.5" />
                </div>
                <p className="mt-5 text-sm text-muted-foreground sm:text-base">{category.summary}</p>
              </div>
              <div className="relative min-h-48 overflow-hidden sm:min-h-full">
                <img src={category.image} alt={category.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
