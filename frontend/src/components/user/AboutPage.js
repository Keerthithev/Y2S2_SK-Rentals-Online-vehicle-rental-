"use client"

import UserHeader from "../layouts/userheader"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { CheckCircle, ChevronRight } from "lucide-react"

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const AboutPage = () => {
  const headingRef = useRef(null)
  const sectionsRef = useRef(null)

  useEffect(() => {
    // Hero section animations
    const heroTl = gsap.timeline()

    heroTl.fromTo(headingRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" })

    // Section animations
    gsap.fromTo(
      ".content-section",
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
              About{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                SK Rentals
              </span>
            </h1>
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
        <div className="max-w-6xl mx-auto space-y-12">
          <section className="content-section bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-indigo-900 mb-6">1.1 Company Background</h2>
              <p className="text-gray-700 leading-relaxed">
                Sivkanthan operates a vehicle rental business in Nelliyady, Sri Lanka, offering a range of vehicles like
                cars, SUVs, vans, motorbikes, and electric bikes. The company serves locals, tourists, and corporate
                clients by offering both self-drive and chauffeur-driven rental options.
              </p>
              <p className="mt-4 text-gray-700">
                Bookings are currently done manually, leading to inefficiencies. To resolve this, SK Rentals is
                launching an online platform to allow real-time bookings, availability checks, and online advance
                payments.
              </p>
            </div>
          </section>

          <section className="content-section bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-indigo-900 mb-6">1.2 What is Vehicle Rental?</h2>
              <p className="text-gray-700 leading-relaxed">
                Vehicle rental is a service where customers rent vehicles temporarily, paying based on distance,
                duration, and vehicle type. Additional driver services are available if needed.
              </p>
            </div>
          </section>

          <section className="content-section bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-indigo-900 mb-6">1.3 Vehicle Rental System</h2>
              <p className="text-gray-700 leading-relaxed">
                An online system that enables customers to rent vehicles, request drivers, and make payments. It helps
                the business manage bookings, vehicle availability, revenue tracking, and generates performance reports.
              </p>
            </div>
          </section>

          <section className="content-section bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-indigo-900 mb-6">1.4 About Our Client, Mr. Sivakanthan</h2>
              <p className="text-gray-700 leading-relaxed">
                Mr. Sivakanthan runs "SK Rentals" in Nelliyady with a diverse fleet:
              </p>
              <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "Economy Cars",
                  "Compact Cars",
                  "SUVs",
                  "Luxury Cars",
                  "Vans",
                  "KDH Vans",
                  "Motorbikes",
                  "Electric Bikes",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="content-section bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-indigo-900 mb-6">1.5 Our Web Application</h2>
              <ul className="space-y-3">
                {[
                  "Customers can browse and book vehicles online with or without a driver.",
                  "Admin manages users, vehicles, revenue, and operations.",
                  "Staff handle driver assignment and maintenance scheduling.",
                  "Payment management and secure sign-up via Google authentication.",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="content-section bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">2. Problems & Motivation</h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold mb-4">2.1 Current Problems</h3>
                  <ul className="space-y-2">
                    {[
                      "Manual operations lead to inefficiencies and errors.",
                      "Limited accessibility due to in-person or phone-based bookings.",
                      "No real-time information on vehicle availability.",
                      "Inefficient driver and vehicle coordination.",
                      "Manual and inconvenient payment process.",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-indigo-100">
                        <ChevronRight className="w-5 h-5 text-indigo-300 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold mb-4">2.2 Motivation for Change</h3>
                  <ul className="space-y-2">
                    {[
                      "Improve customer convenience with online services.",
                      "Enhance efficiency through centralized booking and tracking.",
                      "Reach more customers online.",
                      "Better management of vehicles and staff.",
                      "Improve overall customer experience and satisfaction.",
                      "Enable business growth and expansion.",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-indigo-100">
                        <ChevronRight className="w-5 h-5 text-indigo-300 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="content-section bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-indigo-900 mb-6">3. Aim and Objectives</h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-indigo-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-indigo-900 mb-4">3.1 Aim</h3>
                  <ul className="space-y-2">
                    {[
                      "Provide a comprehensive and efficient vehicle rental management system.",
                      "Support real-time booking, availability tracking, and fleet management.",
                      "Enable driver assignments and maintenance tracking.",
                      "Allow customer feedback collection and admin control.",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-indigo-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-indigo-900 mb-4">3.2 Objectives</h3>
                  <ul className="space-y-2">
                    {[
                      "Simplify rental and booking process.",
                      "Track fleet status and availability in real time.",
                      "Assign and manage drivers easily.",
                      "Automate billing and invoicing.",
                      "Schedule and track vehicle maintenance.",
                      "Gather real-time customer feedback.",
                      "Monitor insights via an admin dashboard.",
                      "Offer a clean, user-friendly interface.",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
