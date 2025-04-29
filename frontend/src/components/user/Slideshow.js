import React, { useState, useEffect } from 'react';

const Slideshow = () => {
  const images = [
    '/image/i1.jpeg',
    '/image/i2.jpeg',
    '/image/i3.jpeg',
    '/image/i4.jpeg',
    '/image/i5.jpeg'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="w-full overflow-hidden relative h-[60vh] mt-4 rounded-2xl shadow-[0_0_30px_#00f2ff66] border border-[#00f2ff33]">
      <div
        className="flex transition-transform duration-1000 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0 h-full flex items-center justify-center bg-black"
          >
            <img
              src={src}
              alt={`Slide ${index}`}
              className="w-full h-full object-cover object-center rounded-2xl"
            />
          </div>
        ))}
      </div>

      {/* HUD overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 pointer-events-none z-10" />
    </div>
  );
};

export default Slideshow;
