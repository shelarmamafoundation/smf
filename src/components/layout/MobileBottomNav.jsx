import React from 'react';
import { Home, Calendar, Grid, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MobileBottomNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-heritage-burgundy border-t border-heritage-gold/30 px-6 py-2 flex justify-between items-center z-50 text-white">
      <Link to="/" className="flex flex-col items-center gap-1 text-heritage-gold">
        <Home className="w-5 h-5" />
        <span className="text-[10px]">मुख्य</span>
      </Link>
      <Link to="/#events" className="flex flex-col items-center gap-1 text-gray-300 hover:text-white">
        <Calendar className="w-5 h-5" />
        <span className="text-[10px]">कार्यक्रम</span>
      </Link>
      <Link to="/#initiatives" className="flex flex-col items-center gap-1 text-gray-300 hover:text-white">
        <Grid className="w-5 h-5" />
        <span className="text-[10px]">उपक्रम</span>
      </Link>
      <Link to="/#about" className="flex flex-col items-center gap-1 text-gray-300 hover:text-white">
        <Award className="w-5 h-5" />
        <span className="text-[10px]">ओळख</span>
      </Link>
    </div>
  );
}