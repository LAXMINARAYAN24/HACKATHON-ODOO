import { useState } from 'react';
import BookingForm from '../components/booking/BookingForm';
import BookingList from '../components/booking/BookingList';

// ------------------------------------------------------------------
// Tab configuration
// ------------------------------------------------------------------
const TABS = [
  { key: 'list', label: 'My Bookings', icon: 'list' },
  { key: 'create', label: 'Book a Resource', icon: 'plus' },
];

/**
 * BookingPage — Top-level page for the Booking module.
 * Orchestrates BookingForm and BookingList with tab navigation.
 * Mounted at /bookings by Person A in App.jsx.
 */
const BookingPage = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [refreshKey, setRefreshKey] = useState(0);

  // Called after a booking is successfully created
  const handleBookingCreated = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-50">
              Resource Booking
            </h1>
            <p className="text-sm text-gray-400">
              Reserve assets and manage your bookings
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex items-center gap-1 rounded-xl border border-gray-800/50 bg-gray-900/50 p-1 backdrop-blur-sm sm:w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-gray-800 text-gray-100 shadow-md shadow-black/20'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
            }`}
          >
            {tab.icon === 'list' ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mx-auto max-w-7xl">
        {activeTab === 'create' && (
          <div className="mx-auto max-w-2xl">
            <BookingForm onSuccess={handleBookingCreated} />
          </div>
        )}

        {activeTab === 'list' && (
          <BookingList refreshKey={refreshKey} />
        )}
      </div>
    </div>
  );
};

export default BookingPage;
