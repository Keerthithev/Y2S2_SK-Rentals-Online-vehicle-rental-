"use client"

import UserHeader from "../layouts/userheader"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Clock, User, Briefcase } from "lucide-react"
import ContactComplaint from "../user/ContactComplaint"
import Slideshow from "./Slideshow"

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const ContactPage = () => {
  const headingRef = useRef(null)
  const sectionsRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    // Hero section animations
    const heroTl = gsap.timeline()

    heroTl.fromTo(headingRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" })

    // Section animations
    gsap.fromTo(
      ".contact-section",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionsRef.current,
          start: "top 80%",
        },
      },
    )

    // Form animations
    gsap.fromTo(
      ".form-element",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: formRef.current,
          start: "top 80%",
        },
      },
    )

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <UserHeader />
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
        {/* Background Blob */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-20 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#8B5CF6"
              d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-1.5C87,13.3,81.3,26.6,73.6,39.3C65.9,52.1,56.1,64.2,43.4,72.5C30.8,80.8,15.4,85.4,-0.2,85.6C-15.8,85.8,-31.6,81.7,-45.8,73.9C-60,66.2,-72.6,54.8,-79.7,40.8C-86.9,26.8,-88.5,10.2,-86.2,-5.7C-83.8,-21.5,-77.5,-36.5,-67.4,-47.8C-57.3,-59.1,-43.5,-66.7,-29.9,-74C-16.3,-81.3,-2.9,-88.3,9.4,-87.7C21.7,-87.1,30.5,-83.7,44.7,-76.4Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 ref={headingRef} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Contact{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                SK Rentals
              </span>
            </h1>
            <p className="mt-6 text-xl text-indigo-100 max-w-2xl mx-auto">
              We're here to help with your vehicle rental needs
            </p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-[60px] text-gray-50"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.17,96.92,115.17,91.93,175.11,85.5Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </section>

      {/* Content Sections */}
      <div ref={sectionsRef} className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Contact Information */}
            <div className="contact-section bg-white rounded-2xl shadow-xl overflow-hidden p-8">
              <h2 className="text-2xl font-bold text-indigo-900 mb-6">SK Rentals (Pvt) Ltd</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-700 mt-1">Nelliyady, West Nelliyady, Sri Lanka</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <Phone className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-700 mt-1">
                      <strong>Hotline:</strong> +94 777-597-707
                      <br />
                      <strong>Mobile:</strong> +94 777-597-707
                      <br />
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <Mail className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-700 mt-1">
                      <a href="mailto:info@skrentals.com" className="text-indigo-600 hover:underline">
                        info@skrentals.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Hours</h3>
                    <p className="text-gray-700 mt-1">
                      <strong>Mon-Fri:</strong> 8am-8pm
                      <br />
                      <strong>Sat-Sun:</strong> 9am-6pm
                    </p>
                  </div>
                </div>
              </div>
            </div>


            {/* Contact Form */}
            <div ref={formRef} className="contact-section bg-white rounded-2xl shadow-xl overflow-hidden p-8">
              <h2 className="text-2xl font-bold text-indigo-900 mb-6">Send Us a Message</h2>
              <ContactComplaint />

{/*
              <form className="space-y-6">
                <div className="form-element">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-element">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="form-element">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Rental Inquiry"
                  />
                </div>

                <div className="form-element">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <div className="form-element">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Send Message
                  </button>
                </div>
              </form>
*/}
            </div>
          </div>

          {/* Key Contacts */}
          <div className="contact-section bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-indigo-900 mb-8">Key Contacts</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-indigo-50 p-6 rounded-xl flex items-start gap-4">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <User className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-900">Entrepreneur</h3>
                    <p className="text-gray-700 mt-2">
                      <strong>Mr. Sivakanthan</strong>
                      <br />
                      +94 777-597-707
                      <br />
                      <a href="mailto:sivakanthan@skrentals.com" className="text-indigo-600 hover:underline">
                        sivakanthan@skrentals.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-xl flex items-start gap-4">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <Briefcase className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-900">Operations Manager</h3>
                    <p className="text-gray-700 mt-2">
                      <strong>Mr. Kenushan</strong>
                      <br />
                      +94 777-123-456
                      <br />
                      <a href="mailto:operations@skrentals.com" className="text-indigo-600 hover:underline">
                        operations@skrentals.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services and Fleet */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Services */}
            <div className="contact-section bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8 text-white">
                <h2 className="text-2xl font-bold mb-6">Our Services</h2>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Wedding and VIP Hires",
                    "24x7 Breakdown Services",
                    "Corporate Rental",
                    "Self Drive Rentals",
                    "Chauffeur Driven & Tours",
                    "Airport Transfers",
                    "Limousine Services",
                    "Rent and Own Scheme",
                    "4x4 and SUV Rentals",
                    "Insurance Assistance",
                    "Bike Rentals",
                    "Long-term Leasing",
                  ].map((service, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-300"></div>
                      <span className="text-indigo-100">{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Vehicle Fleet */}
            <div className="contact-section bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8 text-white">
                <h2 className="text-2xl font-bold mb-6">Vehicle Fleet</h2>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Economy Cars",
                    "Compact Cars",
                    "SUVs & Cabs",
                    "Luxury Cars",
                    "Vans & Buses",
                    "KDH Vans",
                    "Motorbikes",
                    "Electric Bikes",
                    "Tuk Tuks",
                    "Utility Vehicles",
                  ].map((vehicle, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-300"></div>
                      <span className="text-indigo-100">{vehicle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="contact-section text-center mb-8">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">Follow Us</h2>
            <div className="flex justify-center space-x-6">
              <a
                href="#"
                className="bg-white p-4 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
              >
                <Facebook className="w-6 h-6 text-indigo-600" />
              </a>
              <a
                href="#"
                className="bg-white p-4 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
              >
                <Instagram className="w-6 h-6 text-indigo-600" />
              </a>
              <a
                href="#"
                className="bg-white p-4 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
              >
                <Twitter className="w-6 h-6 text-indigo-600" />
              </a>
              <a
                href="#"
                className="bg-white p-4 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
              >
                <Youtube className="w-6 h-6 text-indigo-600" />
              </a>
            </div>
          </div>

   {/* Map */}
<div className="contact-section bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
  <div className="p-4">
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-200">
<iframe
  className="w-full h-full border-0"
  loading="lazy"
  allowFullScreen
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.272913816724!2d80.13498747599408!3d7.634758792357607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3afe1d601ad6cf23%3A0x8a4a0c3bb7a2f9c9!2sNelliyadi%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1715774658305!5m2!1sen!2slk"
  title="SK Rentals Location"
/>



    </div>
  </div>
</div>


        </div>
      </div>

             {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                     {/* Logo */}
          <div className="flex items-center">
           
              <div>
                <img
                  src="/image/logo.png"
                  alt="SK Rentals Logo"
                  className="w--20 h-20 object-contain"
                />
              </div>
            
          </div>
               
              </div>
              <p className="text-gray-400 mb-4">
                Premium vehicle rentals for every journey. Experience the freedom of the road with our quality bikes, cars, and vans.
              </p>
              <div className="flex space-x-4">
                <a href="https://web.facebook.com/login.php/?_rdc=1&_rdr#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://web.facebook.com/login.php/?_rdc=1&_rdr#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://web.facebook.com/login.php/?_rdc=1&_rdr#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="/Home" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="/uservehiclelist" className="text-gray-400 hover:text-white transition-colors">Vehicles</a></li>
                <li><a href="/contactus" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Vehicle Types */}
            <div>
              <h3 className="text-lg font-bold mb-6">Vehicle Types</h3>
              <ul className="space-y-3">
                <li><a href="/uservehiclelist" className="text-gray-400 hover:text-white transition-colors">Bikes</a></li>
                <li><a href="/uservehiclelist" className="text-gray-400 hover:text-white transition-colors">Cars</a></li>
                <li><a href="/uservehiclelist" className="text-gray-400 hover:text-white transition-colors">Vans</a></li>
                <li><a href="/uservehiclelist" className="text-gray-400 hover:text-white transition-colors">Luxury Vehicles</a></li>
              </ul>

               <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} SK Rentals. All rights reserved.
              </p>
            </div>

              <Slideshow />


             



          </div>


        </div>
        
      </footer>
    </div>
  )
}

export default ContactPage
