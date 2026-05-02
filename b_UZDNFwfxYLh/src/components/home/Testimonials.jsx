import { Star, Quote } from "lucide-react";
const testimonials = [
    {
        name: "Priya Sharma",
        role: "Bride",
        event: "Wedding",
        content: "BookMyEvent made planning my wedding so much easier! Found the perfect photographer and caterer within days. The vendors were professional and delivered exactly what we wanted.",
        rating: 5,
        avatar: "PS",
    },
    {
        name: "Rahul Mehta",
        role: "Corporate Event Manager",
        event: "Annual Conference",
        content: "We use BookMyEvent for all our corporate events. The platform is intuitive, vendors are reliable, and the support team is always helpful. Highly recommended!",
        rating: 5,
        avatar: "RM",
    },
    {
        name: "Anita Desai",
        role: "Event Planner",
        event: "Multiple Events",
        content: "As a professional event planner, I rely on BookMyEvent for sourcing vendors. The verified vendor network and easy booking process saves me hours of work.",
        rating: 5,
        avatar: "AD",
    },
];
export function Testimonials() {
    return (<section className="bg-gradient-to-br from-black via-ruby-deep to-brand-red py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Thousands of happy customers trust us for their events
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (<div key={index} className="relative rounded-2xl border border-red-100 bg-white p-6 shadow-lg shadow-black/10">
              <Quote className="absolute right-6 top-6 h-8 w-8 text-brand-red/20"/>
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-accent text-accent"/>))}
              </div>
              <p className="mt-4 text-muted-foreground">{testimonial.content}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-ruby-deep to-brand-red text-sm font-semibold text-white">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} • {testimonial.event}
                  </p>
                </div>
              </div>
            </div>))}
        </div>
      </div>
    </section>);
}
