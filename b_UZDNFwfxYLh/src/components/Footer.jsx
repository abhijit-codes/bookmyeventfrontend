import { Link } from 'react-router-dom';
import { useSelector } from "react-redux";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import logoUrl from "@/assets/bookmyevent.jpeg";

export function Footer() {
    const account = useSelector((state) => state.auth.account);
    const vendorDashboardPath = account?.role === "vendor" ? "/vendor/dashboard" : "/vendor/login";

    return (<footer className="border-t border-brand-yellow/25 bg-gradient-to-br from-brand-blue via-[#201720] to-ruby-deep text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoUrl} alt="BookMyEvent logo" className="h-20 w-44  bg-white object-contain "/>
            </Link>
            <p className="mt-4 text-sm text-white/70">
              Your one-stop platform for booking premium event vendors.
            </p>
            <div className="mt-6 flex gap-4">
              <a to="#" className="text-white/70 transition-colors hover:text-white">
                <Facebook className="h-5 w-5"/>
              </a>
              <a to="#" className="text-white/70 transition-colors hover:text-white">
                <Twitter className="h-5 w-5"/>
              </a>
              <a to="#" className="text-white/70 transition-colors hover:text-white">
                <Instagram className="h-5 w-5"/>
              </a>
              <a to="#" className="text-white/70 transition-colors hover:text-white">
                <Linkedin className="h-5 w-5"/>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Categories</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/vendors?category=photography" className="text-sm text-white/70 hover:text-brand-yellow">
                  Photography
                </Link>
              </li>
              <li>
                <Link to="/vendors?category=catering" className="text-sm text-white/70 hover:text-brand-yellow">
                  Catering
                </Link>
              </li>
              <li>
                <Link to="/vendors?category=decoration" className="text-sm text-white/70 hover:text-brand-yellow">
                  Decoration
                </Link>
              </li>
              <li>
                <Link to="/vendors?category=entertainment" className="text-sm text-white/70 hover:text-brand-yellow">
                  Entertainment
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/contact" className="text-sm text-white/70 hover:text-brand-yellow">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm text-white/70 hover:text-brand-yellow">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-white/70 hover:text-brand-yellow">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/help-center" className="text-sm text-white/70 hover:text-brand-yellow">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-white/70 hover:text-brand-yellow">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-white/70 hover:text-brand-yellow">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">For Vendors</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/vendor/login" className="text-sm text-white/70 hover:text-brand-yellow">
                  Partner Login
                </Link>
              </li>
              <li>
                <Link to="/vendor/register" className="text-sm text-white/70 hover:text-brand-yellow">
                  Register as Vendor
                </Link>
              </li>
              <li>
                <Link to={vendorDashboardPath} className="text-sm text-white/70 hover:text-brand-yellow">
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <Link to="/vendor/pricing" className="inline-flex rounded-full border border-brand-yellow/50 px-4 py-2 text-sm font-semibold text-brand-yellow transition-colors hover:bg-brand-yellow hover:text-brand-blue">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/20 pt-8">
          <div className="mb-4 text-center">
            <Link to="/admin/login" className="text-sm font-medium text-white/70 transition-colors hover:text-brand-yellow">
              Admin Login
            </Link>
          </div>
          <p className="text-center text-sm text-white/70">
            &copy; {new Date().getFullYear()} BookMyEvent. All rights reserved.
          </p>
        </div>
      </div>
    </footer>);
}
