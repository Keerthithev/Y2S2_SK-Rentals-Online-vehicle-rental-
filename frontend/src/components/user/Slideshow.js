import React, { useState, useEffect } from 'react';
import './Slideshow.css';

function Slideshow() {
  const images = [
    '/image/owner1.jpg',
    '/image/owner2.jpg',
    '/image/build.png',
    '/image/road.png',
    '/image/i5.jpeg'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Function to change the image every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change every 3 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slideshow-container">
      <img src={images[currentImageIndex]} alt="Slideshow" className="slideshow-image" />
    </div>
  );
}

export default Slideshow;
