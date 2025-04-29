import React from 'react';

const Footer = () => {
    return (
      <footer className="bg-[#1e293b] text-gray-400 py-4 mt-20 shadow-inner">
        <div className="container mx-auto px-6 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} SK Rentals. All rights reserved.</p>
          <p className="mt-1">
            Developed by <span className="text-blue-300 font-semibold">NorthernUni Group 6 </span> — 
            Year 2 Semester 2.
          </p>
         
        </div>
      </footer>
    );
  };
  
  
  

export default Footer;
