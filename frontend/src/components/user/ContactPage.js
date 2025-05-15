"use client"

import UserHeader from "../layouts/userheader"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Clock, User, Briefcase } from "lucide-react"
import ContactComplaint from "../user/ContactComplaint"

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


          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} SK Rentals. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
