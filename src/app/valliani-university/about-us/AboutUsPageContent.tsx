'use client';
import SearchBar from '@/components/university/UniversitySearchBar';
import { fetchAboutUs } from '@/framework/basic-rest/university/dashboardApi';
import React, { useEffect, useState } from 'react';

const AboutUsPageContent = () => {
  const [safeHTML, setSafeHTML] = useState('');

  useEffect(() => {
    const getAboutUs = async () => {
      const res = await fetchAboutUs();
      // Only sanitize and set HTML on the client
      if (typeof window !== 'undefined' && res && res[0]?.content) {
        // Dynamically import DOMPurify to avoid SSR issues
        const DOMPurify = (await import('dompurify')).default;
        setSafeHTML(DOMPurify.sanitize(res[0].content));
      } else if (res && res[0]?.content) {
        // Fallback: just set the raw HTML if not in browser (shouldn't happen)
        setSafeHTML(res[0].content);
      }
    };
    getAboutUs();
  }, []);
  const mockFetchSuggestions = async (query: string): Promise<string[]> => {
    const fakeData = [
      'Math Basics',
      'Math Advanced',
      'Marketing',
      'Machine Learning',
    ];
    return fakeData.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase()),
    );
  };
  return (
    <div>
      <div className="flex justify-between items-center pb-6">
        <h1 className="text-xl md:text-[26px] lg:text-[32px] font-bold capitalize text-brand-blue">
          About Us
        </h1>
        <SearchBar
          onSearch={(query) => console.log('Searching for:', query)}
          fetchSuggestions={mockFetchSuggestions}
        />
      </div>
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-[20px] font-bold">About Valliani University</h1>
        {/* <p>
          Welcome to Valliani University, the cornerstone of excellence and
          growth for Valliani Jewelers employees. Our mission is to empower our
          team with the skills, knowledge, and confidence they need to deliver
          exceptional service and achieve outstanding results. At Valliani
          University, we are committed to shaping a culture of continuous
          learning and professional development.What You Will Learn 1. Sales
          Training Customer-Centric Selling: Learn how to build trust, identify
          customer needs, and provide tailored solutions. Closing Techniques:
          Master strategies to confidently close sales without pressure.
          Upselling and Cross-Selling: Understand how to enhance the shopping
          experience while maximizing sales. 2. Product Knowledge Jewelry
          Craftsmanship: Gain in-depth understanding of the artistry and
          techniques behind our products. Gemstone Education: Learn about
          diamond grading, gemstone types, and their unique characteristics.
          Certification and Quality: Understand the importance of certifications
          like GIA and what they mean for our customers. 3. Customer Service
          Excellence Building Relationships: Develop skills to create lasting
          connections with customers. Handling Concerns: Learn to address
          customer objections and issues with confidence and empathy. Creating
          Memorable Experiences: Ensure every interaction leaves a positive and
          lasting impression. 4. Leadership Development Team Management: Equip
          aspiring leaders with skills to inspire and manage their teams
          effectively. Performance Coaching: Learn how to mentor and develop
          team members to reach their full potential. Goal Setting and
          Achievement: Understand how to set realistic targets and drive
          results. Our Commitment Valliani University is more than just a
          training program; it's an investment in our people. By nurturing
          talent and fostering expertise, we ensure our employees thrive, our
          customers feel valued, and our legacy as a trusted jeweler continues
          to shine bright. Join us at Valliani University and take the next step
          in your professional journey. Together, we build careers, create
          leaders, and deliver excellence.
        </p> */}
        <section>
          <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
        </section>
      </div>
    </div>
  );
};

export default AboutUsPageContent;
