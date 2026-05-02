import { Button } from "@/components/ui/Button";
import { Search, MapPin, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from 'react-router-dom';

const heroImageModules = import.meta.glob("../../assets/image*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
  query: "?url",
});

export function HeroSection() {
    const heroImages = useMemo(() => {
      const slides = Object.entries(heroImageModules)
        .sort(([firstPath], [secondPath]) => firstPath.localeCompare(secondPath))
        .slice(0, 5)
        .map(([, imageUrl]) => imageUrl);

      return slides.length ? slides : ["/placeholder.jpg"];
    }, []);

    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
      const slideTimer = window.setInterval(() => {
        setActiveSlide((currentSlide) => (currentSlide + 1) % heroImages.length);
      }, 10000);

      return () => window.clearInterval(slideTimer);
    }, [heroImages.length]);

    return (<section className="relative min-h-[560px] overflow-hidden bg-brand-blue sm:min-h-[680px]">
      <div className="absolute inset-0">
        {heroImages.map((imageUrl, index) => (
          <img
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
            key={imageUrl}
            src={imageUrl}
          />
        ))}
      </div>

      <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center px-4 py-12 sm:min-h-[680px] sm:px-6 sm:py-16 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_0.65fr]">
          <div className="hero-readable text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-brand-blue/80 px-4 py-2 text-sm text-white shadow-lg shadow-black/20 backdrop-blur-sm">
              <Star className="h-4 w-4 fill-brand-yellow text-brand-yellow"/>
              <span>Trusted by 50,000+ customers</span>
            </div>

            <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Book the{" "}
              <span className="relative text-brand-yellow">
                Perfect
                <span className="absolute -bottom-2 left-0 h-3 w-full bg-brand-red/45"/>
              </span>{" "}
              Event Vendors
            </h1>

            <p className="mt-5 max-w-3xl text-base font-medium text-white sm:mt-6 sm:text-xl">
              Discover and book verified photographers, caterers, decorators, and more.
              Make your events extraordinary with top-rated professionals.
            </p>

            <div className="mt-10">
              <div className="flex flex-col gap-3 rounded-2xl border border-white/85 bg-white/95 p-3 shadow-2xl shadow-black/25 ring-1 ring-brand-yellow/25 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-2 rounded-xl bg-ivory px-4 py-3 ring-1 ring-brand-yellow/25">
                  <Search className="h-5 w-5 text-muted-foreground"/>
                  <input type="text" placeholder="What are you looking for?" className="flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"/>
                </div>
                <div className="flex flex-1 items-center gap-2 rounded-xl bg-ivory px-4 py-3 ring-1 ring-brand-yellow/25">
                  <MapPin className="h-5 w-5 text-muted-foreground"/>
                  <input type="text" placeholder="Location" className="flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"/>
                </div>
                <Link to="/vendors" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-brand-blue text-brand-yellow shadow-lg shadow-black/20 hover:bg-brand-blue/90 sm:w-auto">
                    <Search className="mr-2 h-4 w-4"/>
                    Search
                  </Button>
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80 lg:justify-start">
                <span>Popular:</span>
                <Link to="/vendors?category=photography" className="hover:text-white hover:underline">
                  Photography
                </Link>
                <Link to="/vendors?category=catering" className="hover:text-white hover:underline">
                  Catering
                </Link>
                <Link to="/vendors?category=decoration" className="hover:text-white hover:underline">
                  Decoration
                </Link>
              </div>
            </div>
          </div>
        </div>

        {heroImages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {heroImages.map((imageUrl, index) => (
              <button
                aria-label={`Show hero slide ${index + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeSlide ? "w-8 bg-brand-yellow" : "w-2.5 bg-white/50"
                }`}
                key={imageUrl}
                onClick={() => setActiveSlide(index)}
                type="button"
              />
            ))}
          </div>
        )}
      </div>
    </section>);
}
