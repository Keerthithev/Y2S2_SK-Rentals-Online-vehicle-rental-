"use client"

import UserHeader from "../layouts/userheader"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { CheckCircle, Star, Quote, Users, Wrench, User } from "lucide-react"
import Slideshow from "./Slideshow"


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

    // Testimonial animations
    gsap.fromTo(
      ".testimonial-card",
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".testimonials-section",
          start: "top 80%",
        },
      },
    )

    // Staff animations
    gsap.fromTo(
      ".staff-card",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".staff-section",
          start: "top 80%",
        },
      },
    )

    // Table row animations
    gsap.fromTo(
      "tbody tr",
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".drivers-table",
          start: "top 90%",
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

          {/* The 's Story */}
          <section className="content-section bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">The Founder's Story</h2>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/3">
                  <div className="relative">
                    <div className="w-full h-full absolute -top-2 -left-2 bg-indigo-400 rounded-xl"></div>
                    <img
                      src="../image/owner2.jpg"
                      alt="Mr. Sivakanthan"
                      className="w-full h-auto rounded-xl relative z-10 bg-indigo-100"
                    />
                  </div>
                </div>

                <div className="md:w-2/3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <Quote className="w-10 h-10 text-indigo-300 mb-4" />
                    <p className="text-indigo-100 italic mb-4">
                      My journey began in 2005 with just two vehicles - a small car and a motorbike. I noticed tourists
                      and locals in Nelliyady struggling to find reliable transportation options, especially for
                      exploring the beautiful northern regions of Sri Lanka.
                    </p>
                    <p className="text-indigo-100 italic mb-4">
                      What started as a small side business quickly grew as customers appreciated our personalized
                      service and well-maintained vehicles. By 2010, we had expanded to 10 vehicles, and today, SK
                      Rentals proudly maintains a fleet of over 30 diverse vehicles.
                    </p>
                    <p className="text-indigo-100 italic mb-4">
                      Our success comes from a simple philosophy: treat customers like family and provide vehicles that
                      are safe, clean, and reliable. Now, with our new online platform, we're excited to make the rental
                      experience even more convenient for our customers.
                    </p>
                    <div className="text-right">
                      <p className="text-white font-bold">- Mr. Sivakanthan</p>
                      <p className="text-indigo-200 text-sm">Founder & CEO, SK Rentals</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Customer Testimonials */}
          <section className="content-section testimonials-section bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-indigo-900 mb-8">What Our Customers Say</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Testimonial 1 */}
                <div className="testimonial-card bg-indigo-50 rounded-xl p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center mr-4">
                      <span className="text-indigo-700 font-bold">RP</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Rajesh Patel</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "I rented an SUV for our family trip around northern Sri Lanka. The vehicle was in excellent
                    condition, and the driver was knowledgeable about all the local attractions. Highly recommend SK
                    Rentals!"
                  </p>
                </div>

                {/* Testimonial 2 */}
                <div className="testimonial-card bg-indigo-50 rounded-xl p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center mr-4">
                      <span className="text-indigo-700 font-bold">SJ</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Sarah Johnson</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "As a solo female traveler, safety was my priority. SK Rentals provided me with a reliable motorbike
                    and excellent safety tips for exploring the region. The rental process was straightforward and the
                    staff were incredibly helpful."
                  </p>
                </div>

                {/* Testimonial 3 */}
                <div className="testimonial-card bg-indigo-50 rounded-xl p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center mr-4">
                      <span className="text-indigo-700 font-bold">TF</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Thomas Fernando</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "We needed a van for our corporate retreat, and SK Rentals delivered beyond our expectations. The
                    vehicle was spacious, comfortable, and the driver was professional. The entire experience was
                    hassle-free."
                  </p>
                </div>

                {/* Testimonial 4 */}
                <div className="testimonial-card bg-indigo-50 rounded-xl p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center mr-4">
                      <span className="text-indigo-700 font-bold">AK</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Anita Kumar</h4>
                      <div className="flex">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                        ))}
                        <Star className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "I've rented from SK multiple times for business trips. Their cars are always clean and
                    well-maintained. The only suggestion I have is to expand their pickup locations, but otherwise, the
                    service is excellent."
                  </p>
                </div>

                {/* Testimonial 5 */}
                <div className="testimonial-card bg-indigo-50 rounded-xl p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center mr-4">
                      <span className="text-indigo-700 font-bold">MR</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Michael Rodriguez</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "Rented an electric bike for exploring the city. It was a fantastic experience! The bike was in
                    perfect condition, and the staff gave me great tips on places to visit. Will definitely use SK
                    Rentals again on my next trip."
                  </p>
                </div>

                {/* Testimonial 6 */}
                <div className="testimonial-card bg-indigo-50 rounded-xl p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center mr-4">
                      <span className="text-indigo-700 font-bold">LP</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Lakshmi Perera</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "As a local, I've tried several rental services in the area, but SK Rentals stands out for their
                    personalized service. Mr. Sivakanthan himself ensures that every customer is satisfied. Their prices
                    are fair and the vehicles are top-notch."
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Our Team */}
          <section className="content-section staff-section bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-indigo-900 mb-8">Meet Our Team</h2>

              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Users className="w-6 h-6 text-indigo-600 mr-2" />
                  <h3 className="text-xl font-bold text-indigo-900">Our Professional Drivers</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="drivers-table min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-indigo-600 text-white">
                      <tr>
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Experience</th>
                        <th className="py-3 px-4 text-left">Languages</th>
                        <th className="py-3 px-4 text-left">Specialization</th>
                        <th className="py-3 px-4 text-left">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 hover:bg-indigo-50 transition-colors">
                        <td className="py-3 px-4 font-medium">Rajan Krishnan</td>
                        <td className="py-3 px-4">12 years</td>
                        <td className="py-3 px-4">Tamil, English, Sinhala</td>
                        <td className="py-3 px-4">Luxury Cars, Tourism</td>
                        <td className="py-3 px-4">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                            ))}
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-indigo-50 transition-colors">
                        <td className="py-3 px-4 font-medium">Vijay Nadesan</td>
                        <td className="py-3 px-4">8 years</td>
                        <td className="py-3 px-4">Tamil, English</td>
                        <td className="py-3 px-4">SUVs, Off-road</td>
                        <td className="py-3 px-4">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                            ))}
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-indigo-50 transition-colors">
                        <td className="py-3 px-4 font-medium">Suresh Kumar</td>
                        <td className="py-3 px-4">15 years</td>
                        <td className="py-3 px-4">Tamil, English, Sinhala, Hindi</td>
                        <td className="py-3 px-4">Vans, Group Tours</td>
                        <td className="py-3 px-4">
                          <div className="flex">
                            {[...Array(4)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                            ))}
                            <Star className="w-4 h-4 text-gray-300" />
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-indigo-50 transition-colors">
                        <td className="py-3 px-4 font-medium">Priya Chandran</td>
                        <td className="py-3 px-4">6 years</td>
                        <td className="py-3 px-4">Tamil, English</td>
                        <td className="py-3 px-4">Compact Cars, City Tours</td>
                        <td className="py-3 px-4">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                            ))}
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-indigo-50 transition-colors">
                        <td className="py-3 px-4 font-medium">Karthik Rajan</td>
                        <td className="py-3 px-4">10 years</td>
                        <td className="py-3 px-4">Tamil, English, Sinhala</td>
                        <td className="py-3 px-4">KDH Vans, Long Tours</td>
                        <td className="py-3 px-4">
                          <div className="flex">
                            {[...Array(4)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                            ))}
                            <Star className="w-4 h-4 text-gray-300" />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-12">
                <div className="flex items-center mb-6">
                  <Wrench className="w-6 h-6 text-indigo-600 mr-2" />
                  <h3 className="text-xl font-bold text-indigo-900">Maintenance Staff</h3>
                </div>

                <div className="bg-indigo-50 rounded-xl p-6 shadow-md staff-card">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 bg-indigo-200 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-indigo-700" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Ganesh Murali</h4>
                      <p className="text-indigo-700 font-medium">Head of Maintenance</p>
                      <p className="text-gray-700 mt-2">
                        With over 20 years of experience in vehicle maintenance and repair, Ganesh ensures that every
                        vehicle in our fleet is in perfect condition. He leads a team of mechanics who perform regular
                        maintenance checks, addressing any issues before they become problems. Ganesh is certified in
                        both traditional and electric vehicle maintenance, making him an invaluable asset to SK Rentals
                        as we expand our electric vehicle offerings.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                          Certified Mechanic
                        </span>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                          EV Specialist
                        </span>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                          20+ Years Experience
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
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

export default AboutPage
