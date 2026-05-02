import { Search, Calendar, MessageSquare, PartyPopper } from "lucide-react";
const steps = [
    {
        icon: Search,
        title: "Search & Discover",
        description: "Browse through thousands of verified vendors. Filter by category, location, budget, and ratings.",
    },
    {
        icon: MessageSquare,
        title: "Connect & Discuss",
        description: "Chat directly with vendors, discuss your requirements, and get customized quotes for your event.",
    },
    {
        icon: Calendar,
        title: "Book & Pay",
        description: "Secure your booking with our safe payment system. Pay in installments with our flexible options.",
    },
    {
        icon: PartyPopper,
        title: "Celebrate!",
        description: "Enjoy your perfectly planned event while we ensure everything goes smoothly for you.",
    },
];
export function HowItWorks() {
    return (<section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Book your perfect event vendors in 4 simple steps
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (<div key={step.title} className="relative text-center">
              {index < steps.length - 1 && (<div className="absolute left-1/2 top-12 hidden h-0.5 w-full -translate-x-1/2 bg-gradient-to-r from-brand-yellow via-brand-red/45 to-transparent lg:block"/>)}
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-brand-yellow/45 bg-yellow-soft/60 shadow-lg shadow-brand-red/10">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-ruby-deep to-brand-red">
                  <step.icon className="h-8 w-8 text-primary-foreground"/>
                </div>
                <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-foreground">
                  {index + 1}
                </div>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>))}
        </div>
      </div>
    </section>);
}
