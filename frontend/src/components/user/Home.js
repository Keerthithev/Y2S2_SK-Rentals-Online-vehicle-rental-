"use client"


import { useEffect, useRef } from "react"
import { useNavigate } from 'react-router-dom';
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight, Calendar, CheckCircle, ChevronRight, MapPin, Star, Truck } from 'lucide-react'
import UserHeader from "../layouts/userheader"

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const HomePage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null)
  const headingRef = useRef(null)
  const subheadingRef = useRef(null)
  const ctaRef = useRef(null)
  const vehiclesRef = useRef(null)
  const stepsRef = useRef(null)
  const testimonialsRef = useRef(null)
  const featuresRef = useRef(null)

  useEffect(() => {
    // Hero section animations
    const heroTl = gsap.timeline()
    
    heroTl.fromTo(
      headingRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    )
    .fromTo(
      subheadingRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
      "-=0.7"
    )
    .fromTo(
      ctaRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      "-=0.7"
    )
    .fromTo(
      ".hero-image",
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" },
      "-=1"
    )
    .fromTo(
      ".hero-blob",
      { opacity: 0, scale: 0.5 },
      { opacity: 0.8, scale: 1, duration: 1.5, ease: "elastic.out(1, 0.5)" },
      "-=1.5"
    )

    // Floating animation for hero image
    gsap.to(".hero-image", {
      y: 15,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    })

    // Rotating blob animation
    gsap.to(".hero-blob", {
      rotation: 360,
      transformOrigin: "center center",
      duration: 60,
      repeat: -1,
      ease: "none"
    })

    // Vehicle categories animations
    gsap.fromTo(
      ".vehicle-card",
      { opacity: 0, y: 50, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: vehiclesRef.current,
          start: "top 80%",
        }
      }
    )

    // How it works steps animation
    gsap.fromTo(
      ".step-item",
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: stepsRef.current,
          start: "top 75%",
        }
      }
    )

    // Testimonials animation
    gsap.fromTo(
      ".testimonial-card",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: testimonialsRef.current,
          start: "top 75%",
        }
      }
    )

    // Features animation
    gsap.fromTo(
      ".feature-item",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
        }
      }
    )

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      gsap.killTweensOf(".hero-image")
      gsap.killTweensOf(".hero-blob")
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <UserHeader />
      
      {/* Hero Section */}
      <section 
        ref={heroRef} 
        className="relative overflow-hidden pt-16 pb-32 md:pt-20 md:pb-40 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800"
      >
        {/* Background Blob */}
        <div className="hero-blob absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-20 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#8B5CF6" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-1.5C87,13.3,81.3,26.6,73.6,39.3C65.9,52.1,56.1,64.2,43.4,72.5C30.8,80.8,15.4,85.4,-0.2,85.6C-15.8,85.8,-31.6,81.7,-45.8,73.9C-60,66.2,-72.6,54.8,-79.7,40.8C-86.9,26.8,-88.5,10.2,-86.2,-5.7C-83.8,-21.5,-77.5,-36.5,-67.4,-47.8C-57.3,-59.1,-43.5,-66.7,-29.9,-74C-16.3,-81.3,-2.9,-88.3,9.4,-87.7C21.7,-87.1,30.5,-83.7,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="w-full lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
              <h1 
                ref={headingRef}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight"
              >
                Explore the World <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                  On Your Terms
                </span>
              </h1>
              <p 
                ref={subheadingRef}
                className="mt-6 text-xl text-indigo-100 max-w-lg mx-auto lg:mx-0"
              >
                Premium bikes, cars, and vans for your journey. Rent with ease, travel with freedom.
              </p>
              <div 
                ref={ctaRef}
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <button 
                  onClick={() => navigate('/uservehiclelist')}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  Browse Vehicles
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/about')}
                  className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm text-white border border-white/30 font-bold text-lg hover:bg-white/20 transition-all duration-300"
                >
                  Learn More
                </button>
              </div>
            </div>
            <div className="w-full lg:w-1/2 relative">
              <div >
                <img 
                  src="image/car4.png" 
                  alt="SK Rentals Vehicles" 
                  className="rounded-2xl "
                />
               
              </div>
              
              
            </div>
            
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[60px] text-gray-50">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.17,96.92,115.17,91.93,175.11,85.5Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Vehicle Categories */}
      <section ref={vehiclesRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Choose Your Perfect Ride
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              From compact bikes to spacious vans, we have the perfect vehicle for every journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Bikes */}
            <div className="vehicle-card group">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 to-purple-600/80 opacity-0 group-hover:opacity-90 transition-opacity duration-300 z-10 flex items-center justify-center">
                    <button 
                      onClick={() => navigate('/uservehiclelist?category=bike')}
                      className="px-6 py-3 bg-white text-indigo-700 rounded-full font-bold transform scale-0 group-hover:scale-100 transition-transform duration-300"
                    >
                      View Bikes
                    </button>
                  </div>
                  <img 
                    src="image/i2.jpeg" 
                    alt="Bikes" 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Bikes</h3>
                  <p className="text-gray-600 mb-4">
                    Eco-friendly and perfect for city exploration. Enjoy the freedom of two wheels.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-700 font-bold">From $15/day</span>
                    <button 
                      onClick={() => navigate('/uservehiclelist?category=bike')}
                      className="flex items-center text-indigo-600 font-medium group/btn"
                    >
                      Explore 
                      <ChevronRight className="w-5 h-5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cars */}
            <div className="vehicle-card group">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 to-purple-600/80 opacity-0 group-hover:opacity-90 transition-opacity duration-300 z-10 flex items-center justify-center">
                    <button 
                      onClick={() => navigate('/uservehiclelist?category=car')}
                      className="px-6 py-3 bg-white text-indigo-700 rounded-full font-bold transform scale-0 group-hover:scale-100 transition-transform duration-300"
                    >
                      View Cars
                    </button>
                  </div>
                  <img 
                    src="image/i1.jpeg" 
                    alt="Cars" 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Cars</h3>
                  <p className="text-gray-600 mb-4">
                    Comfortable and versatile. Perfect for families and longer journeys.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-700 font-bold">From $45/day</span>
                    <button 
                      onClick={() => navigate('/uservehiclelist?category=car')}
                      className="flex items-center text-indigo-600 font-medium group/btn"
                    >
                      Explore 
                      <ChevronRight className="w-5 h-5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Vans */}
            <div className="vehicle-card group">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 to-purple-600/80 opacity-0 group-hover:opacity-90 transition-opacity duration-300 z-10 flex items-center justify-center">
                    <button 
                      onClick={() => navigate('/uservehiclelist?category=van')}
                      className="px-6 py-3 bg-white text-indigo-700 rounded-full font-bold transform scale-0 group-hover:scale-100 transition-transform duration-300"
                    >
                      View Vans
                    </button>
                  </div>
                  <img 
                    src="image/vans.png" 
                    alt="Vans" 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Vans</h3>
                  <p className="text-gray-600 mb-4">
                    Spacious and practical. Ideal for moving, group travel, or adventure trips.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-700 font-bold">From $75/day</span>
                    <button 
                      onClick={() => navigate('/uservehiclelist?category=van')}
                      className="flex items-center text-indigo-600 font-medium group/btn"
                    >
                      Explore 
                      <ChevronRight className="w-5 h-5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section ref={stepsRef} className="py-20 bg-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Rent in 3 Simple Steps
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              We've made renting a vehicle as easy as possible. Just follow these steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="step-item bg-white rounded-2xl shadow-lg p-8 relative">
              <div className="absolute -top-5 -left-5 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">1</div>
              <div className="mb-6 text-indigo-600">
                <MapPin className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Your Vehicle</h3>
              <p className="text-gray-600">
                Browse our extensive collection of bikes, cars, and vans to find your perfect match.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-item bg-white rounded-2xl shadow-lg p-8 relative">
              <div className="absolute -top-5 -left-5 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">2</div>
              <div className="mb-6 text-indigo-600">
                <Calendar className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Book Your Dates</h3>
              <p className="text-gray-600">
                Select your pickup and return dates, and complete the booking process online.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-item bg-white rounded-2xl shadow-lg p-8 relative">
              <div className="absolute -top-5 -left-5 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">3</div>
              <div className="mb-6 text-indigo-600">
                <Truck className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Enjoy Your Ride</h3>
              <p className="text-gray-600">
                Pick up your vehicle at our convenient location and start your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              What Our Customers Say
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our customers have to say.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="testimonial-card bg-white rounded-2xl shadow-lg p-8 border-t-4 border-indigo-600">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                  <span className="text-indigo-700 font-bold text-xl">KE</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">KENUSHAN</h4>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The car was in perfect condition and the rental process was incredibly smooth. Will definitely use SK Rentals again for my next trip!"
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="testimonial-card bg-white rounded-2xl shadow-lg p-8 border-t-4 border-indigo-600">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                  <span className="text-indigo-700 font-bold text-xl">NA</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">NAGA</h4>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Rented a bike for exploring the city and it was the best decision! The bike was high-quality and the staff was incredibly helpful."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="testimonial-card bg-white rounded-2xl shadow-lg p-8 border-t-4 border-indigo-600">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                  <span className="text-indigo-700 font-bold text-xl">VI</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">VIVIYAN</h4>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The van we rented was perfect for our family trip. Spacious, clean, and fuel-efficient. SK Rentals made our vacation hassle-free!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Why Choose SK Rentals
            </h2>
            <p className="mt-4 text-xl text-indigo-200 max-w-2xl mx-auto">
              We're committed to providing the best rental experience possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="feature-item bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="mb-4 text-indigo-300">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quality Vehicles</h3>
              <p className="text-indigo-200">
                All our vehicles are regularly maintained and kept in excellent condition.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-item bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="mb-4 text-indigo-300">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">Flexible Rentals</h3>
              <p className="text-indigo-200">
                Rent for a few hours, days, or weeks. We adapt to your schedule.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-item bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="mb-4 text-indigo-300">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
              <p className="text-indigo-200">
                Our customer service team is available around the clock to assist you.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-item bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="mb-4 text-indigo-300">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">Affordable Rates</h3>
              <p className="text-indigo-200">
                Competitive pricing with no hidden fees. Get the best value for your money.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-100">
        <div className="container mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/2 p-10 lg:p-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Book your vehicle today and experience the freedom of the open road.
                </p>
                <button 
                  onClick={() => navigate('/uservehiclelist')}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Browse Vehicles Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              <div className="w-full lg:w-1/2 relative min-h-[300px]">
                <img 
                  src="image/journeynew.jpg" 
                  alt="Start your journey" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

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
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
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
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-bold mb-6">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span className="text-gray-400">Nelliyadi,West Nelliyadi</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span className="text-gray-400">+94 777-597-707</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-gray-400">info@skrentals.com</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="text-gray-400">Mon-Fri: 8am-8pm, Sat-Sun: 9am-6pm</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} SK Rentals. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
