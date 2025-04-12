import { Link } from "wouter";
import { 
  HelpCircle, 
  ShieldCheck, 
  FileText 
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:order-2 space-x-6">
            <Link href="/help">
              <a className="text-neutral-400 hover:text-neutral-500">
                <span className="sr-only">Help Center</span>
                <HelpCircle className="h-6 w-6" />
              </a>
            </Link>
            <Link href="/privacy">
              <a className="text-neutral-400 hover:text-neutral-500">
                <span className="sr-only">Privacy Policy</span>
                <ShieldCheck className="h-6 w-6" />
              </a>
            </Link>
            <Link href="/terms">
              <a className="text-neutral-400 hover:text-neutral-500">
                <span className="sr-only">Terms of Service</span>
                <FileText className="h-6 w-6" />
              </a>
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-sm text-neutral-500">
              &copy; {new Date().getFullYear()} HackConnect. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
