import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles } from "lucide-react";
export function CTASection() {
    return (<section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-brand-yellow/35 bg-gradient-to-r from-brand-blue via-ruby-deep to-brand-red p-8 shadow-2xl shadow-brand-blue/20 sm:p-12 lg:p-16">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm">
                <Sparkles className="h-4 w-4"/>
                <span>Join 5,000+ vendors</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Are You a Vendor?
              </h2>
              <p className="mt-4 text-lg text-white/80">
                Join our platform and reach thousands of customers looking for your services.
                Grow your business with our powerful tools and support.
              </p>
              <ul className="mt-6 space-y-3">
                {[
            "Get discovered by thousands of customers",
            "Easy booking and payment management",
            "Dedicated support and business tools",
            "No upfront costs - pay only when you earn",
        ].map((item, index) => (<li key={index} className="flex items-center gap-3 text-white/90">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-yellow">
                      <span className="text-xs font-bold text-brand-blue">✓</span>
                    </div>
                    {item}
                  </li>))}
              </ul>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm lg:ml-auto">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">0%</p>
                <p className="text-white/70">Commission on first 5 bookings</p>
              </div>
              <div className="my-4 h-px w-full bg-white/20"/>
              <Link to="/vendor/register">
                <Button size="lg" className="bg-brand-yellow text-brand-blue shadow-lg shadow-black/15 hover:bg-yellow-soft">
                  Register as partner
                  <ArrowRight className="ml-2 h-4 w-4"/>
                </Button>
              </Link>
              <p className="text-sm text-white/60">
                Already a vendor?{" "}
                <Link to="/login" className="text-white underline hover:no-underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>);
}
