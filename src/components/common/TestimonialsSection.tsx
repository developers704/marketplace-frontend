import React from 'react';
import { Star } from 'lucide-react';
import Heading from '../ui/heading';

const TestimonialsSection = ({ lang }: { lang: any }) => {
    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Verified Buyer",
            image: "/assets/images/support/1.png",
            review: "The diamond necklace I purchased exceeded my expectations. The craftsmanship is exceptional!",
            rating: 5
        },
        {
            name: "Michael Chen",
            role: "Verified Buyer",
            image: "/assets/images/support/2.png",
            review: "Outstanding service and beautiful pieces. The attention to detail is remarkable.",
            rating: 5
        },
        {
            name: "Emma Davis",
            role: "Verified Buyer",
            image: "/assets/images/support/3.png",
            review: "My engagement ring is perfect. The quality and beauty are exactly what we wanted.",
            rating: 5
        }
    ];

    return (
        <section className="bg-brand-review-background py-16">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-8 md:mb-8 md:mt-4">
                    <div className="group inline-block">
                        <Heading variant="heading" className="mb-4 -mt-1.5 3xl:text-[25px] 3xl:leading-9 hover:cursor-pointer">
                            What Our Customers Say
                        </Heading>
                        <div className="h-1 bg-brand-underline_color w-[40px] mx-auto transition-all duration-300 ease-in-out group-hover:w-full"></div>


                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 hover:cursor-pointer rounded-lg shadow-lg transform transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                        >
                            <div className="flex items-center mb-4">
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full border-2 border-brand-underline_color"
                                />
                                <div className="ml-4">
                                    <h3 className="font-semibold text-gray-800">{testimonial.name}</h3>
                                    <p className="text-sm text-brand-button-hover">{testimonial.role}</p>
                                </div>
                            </div>

                            <div className="flex mb-3">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                ))}
                            </div>

                            <p className="text-gray-600 italic">{testimonial.review}</p>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <button className="bg-brand-button_color text-white px-8 py-3 rounded-full font-semibold transition duration-300 hover:bg-brand-button-hover hover:shadow-lg">
                        View All Reviews
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;