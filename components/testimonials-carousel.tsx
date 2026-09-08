"use client";

import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    name: "Nisha Sharma",
    location: "Indore",
    role: "Business Owner",
    review: "The course feels practical, clear, and grounded in a real business journey."
  },
  {
    name: "Mohit Verma",
    location: "Surat",
    role: "Entrepreneur",
    review: "I like that the modules focus on launch steps instead of generic theory."
  },
  {
    name: "Aarti Singh",
    location: "Lucknow",
    role: "Student",
    review: "The roadmap makes a big idea feel approachable and gives me a clear next step."
  },
  {
    name: "Ravi Patel",
    location: "Ahmedabad",
    role: "Shop Owner",
    review: "The operations and delivery lessons connect directly to the realities of local business."
  },
  {
    name: "Sneha Gupta",
    location: "Jaipur",
    role: "Aspiring Founder",
    review: "It is the kind of practical guidance I needed to move from planning to building."
  }
];

const getInitials = (name: string) => name.split(" ").map((part) => part[0]).join("");

export default function TestimonialsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  const move = (direction: 1 | -1) => {
    setActiveIndex((current) => (current + direction + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => move(1), 5000);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <section className="bg-white py-20" aria-labelledby="testimonials-heading">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-brand-50 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-brand-700">TESTIMONIALS</span>
          <h2 id="testimonials-heading" className="mt-5 text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Clean <span className="text-brand-600">feedback</span> from learners
          </h2>
          <p className="mt-5 text-pretty text-base leading-7 text-slate-600">
            Real reviews from students who are learning, building, and growing with Subhan Academy.
          </p>
        </div>

        <div
          className="relative mt-12 overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => {
            if (touchStart.current === null) return;
            const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
            if (Math.abs(distance) > 40) move(distance > 0 ? -1 : 1);
            touchStart.current = null;
          }}
        >
          <div
            className="flex transition-transform duration-500 ease-out [--slide-step:20%] xl:[--slide-step:0%]"
            style={{ transform: `translateX(calc(-${activeIndex} * var(--slide-step)))` }}
          >
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="w-full shrink-0 px-2 sm:w-1/2 lg:w-1/3 xl:w-1/5">
                <div className="flex min-h-[292px] flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800" aria-hidden>
                      {getInitials(testimonial.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">{testimonial.location} · {testimonial.role}</p>
                    </div>
                  </div>
                  <Quote className="mt-6 h-7 w-7 text-brand-300" aria-hidden />
                  <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{testimonial.review}</p>
                  <div className="mt-5 flex gap-1" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-5">
          <button type="button" onClick={() => move(-1)} aria-label="Previous testimonial" className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-brand-300 hover:text-brand-700">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2" aria-label="Testimonial slides">
            {testimonials.map((testimonial, index) => (
              <button key={testimonial.name} type="button" onClick={() => setActiveIndex(index)} aria-label={`Go to testimonial ${index + 1}`} className={`h-2 rounded-full transition-all ${activeIndex === index ? "w-6 bg-brand-600" : "w-2 bg-brand-200"}`} />
            ))}
          </div>
          <button type="button" onClick={() => move(1)} aria-label="Next testimonial" className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-brand-300 hover:text-brand-700">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-brand-200 bg-brand-50 px-6 py-5 text-center text-sm font-semibold text-brand-800 shadow-sm sm:px-8">
          Join 5000+ learners who are building their own local grocery businesses.
        </div>
      </div>
    </section>
  );
}