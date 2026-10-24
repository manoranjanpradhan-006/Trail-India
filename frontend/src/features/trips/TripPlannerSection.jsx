import React, { useState } from 'react';
import { api } from '../../services/api';
import { Plus, Trash2, Clock, Heart, Calendar, DollarSign, MapPin, CheckCircle2 } from 'lucide-react';

export const TripPlannerSection = ({
  trips = [],
  favorites = [],
  allPlaces = [],
  user,
  onOpenAuth,
  onRefreshTrips,
  onSelectPlace,
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New Trip Builder State
  const [newTitle, setNewTitle] = useState('Odisha Heritage & Golden Triangle Odyssey');
  const [newDesc, setNewDesc] = useState('A sacred journey across Konark stone sundials, Puri Jagannath Temple, and Chilika lagoon.');
  const [newStartDate, setNewStartDate] = useState('2026-11-20');
  const [newEndDate, setNewEndDate] = useState('2026-11-25');
  const [newBudget, setNewBudget] = useState(18000);
  const [days, setDays] = useState([
    {
      day_number: 1,
      title: 'Bhubaneswar Temple City & Ashokan Dhauli',
      items: [
        {
          place_id: 'plc-dhauli',
          place_name: 'Dhauli Shanti Stupa & Kalinga Edicts',
          category: 'heritage',
          time_slot: '09:00 AM',
          estimated_cost: 300,
          notes: 'Visit the Ashokan rock carvings and Daya river valley',
        },
      ],
    },
    {
      day_number: 2,
      title: 'Konark Sun Chariot & Chandrabhaga Beach',
      items: [
        {
          place_id: 'plc-konark',
          place_name: 'Konark Sun Temple',
          category: 'heritage',
          time_slot: '07:30 AM',
          estimated_cost: 600,
          notes: 'Observe the 24 astronomical stone sundial wheels at sunrise',
        },
      ],
    },
    {
      day_number: 3,
      title: 'Sacred Puri & Irrawaddy Dolphin Boat Safari',
      items: [
        {
          place_id: 'plc-puri-jagannath',
          place_name: 'Shree Jagannath Temple',
          category: 'temple',
          time_slot: '06:00 AM',
          estimated_cost: 400,
          notes: 'Participate in the morning aarti and Mahaprasad in Anand Bazar',
        },
      ],
    },
  ]);

  const [selectedPlaceToAdd, setSelectedPlaceToAdd] = useState('');
  const [targetDayIndex, setTargetDayIndex] = useState(0);

  const handleAddPlaceToDay = () => {
    if (!selectedPlaceToAdd) return;
    const targetPlace = allPlaces.find((p) => p.id === selectedPlaceToAdd);
    if (!targetPlace) return;

    const newItem = {
      place_id: targetPlace.id,
      place_name: targetPlace.name,
      category: targetPlace.category,
      time_slot: '02:00 PM',
      estimated_cost: 300,
      notes: `Explore ${targetPlace.name}`,
    };

    const updated = [...days];
    updated[targetDayIndex].items.push(newItem);
    setDays(updated);
    setSelectedPlaceToAdd('');
  };

  const handleRemoveItem = (dayIdx, itemIdx) => {
    const updated = [...days];
    updated[dayIdx].items.splice(itemIdx, 1);
    setDays(updated);
  };

  const handleAddDay = () => {
    const newDayNum = days.length + 1;
    setDays([
      ...days,
      {
        day_number: newDayNum,
        title: `Day ${newDayNum}: Explore Incredible India`,
        items: [],
      },
    ]);
  };

  const handleSaveTrip = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    try {
      await api.createTrip({
        title: newTitle,
        description: newDesc,
        start_date: newStartDate,
        end_date: newEndDate,
        budget_estimate: newBudget,
        itinerary_data: days,
      });
      alert('Trip itinerary saved successfully to your account!');
      setIsCreatingNew(false);
      onRefreshTrips();
    } catch (e) {
      alert(e.message || 'Failed to save trip');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#10251B] via-[#0B1B14] to-[#06110D] p-8 sm:p-12 rounded-3xl border border-[#263B2F] text-[#F8F1E5] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8B65C] bg-[#E8B65C]/10 border border-[#E8B65C]/30 px-3.5 py-1.5 rounded-full inline-block">
            🗺️ Trip & Itinerary Architect
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#F8F1E5] leading-tight">
            Design Your Custom Odyssey Across India
          </h1>
          <p className="text-[#B9B7AA] text-xs sm:text-sm leading-relaxed">
            Organize multi-state journeys, allocate daily time slots, estimate travel budgets, and incorporate your saved favorite attractions across the country.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              onOpenAuth();
              return;
            }
            setIsCreatingNew(true);
          }}
          className="bg-gradient-to-r from-[#E8B65C] to-[#C4923C] hover:from-[#F4D18A] hover:to-[#E8B65C] text-[#06110D] font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-[#E8B65C]/20 flex items-center gap-2 transition hover:scale-105 shrink-0"
        >
          <Plus className="w-5 h-5" />
          Create New Itinerary
        </button>
      </div>

      {/* Main Content Grid: Saved Favorites Drawer + Active Itinerary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Saved Places Bookmarks */}
        <div className="space-y-6">
          <div className="p-6 bg-[#10251B] border border-[#263B2F] rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#F8F1E5] flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                Saved Favorites ({favorites.length})
              </h3>
            </div>
            <p className="text-xs text-[#B9B7AA]">
              Your bookmarked places across India. Click any item to explore.
            </p>

            {favorites.length === 0 ? (
              <div className="text-center py-8 text-[#B9B7AA] text-xs bg-[#0B1B14] rounded-2xl border border-[#263B2F]">
                You haven't saved any places yet. Click the heart icon on any card to bookmark it here!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    onClick={() => onSelectPlace && onSelectPlace(fav)}
                    className="p-3 bg-[#0B1B14] hover:bg-[#153224] border border-[#263B2F] rounded-2xl flex items-center gap-3 cursor-pointer transition"
                  >
                    <img
                      src={fav.image_url}
                      alt={fav.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="truncate flex-1">
                      <p className="text-xs font-semibold text-[#F8F1E5] truncate">{fav.name}</p>
                      <p className="text-[10px] text-[#E8B65C] uppercase tracking-wide">
                        {fav.category?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Itinerary Viewer & Builder */}
        <div className="lg:col-span-2 space-y-6">
          {isCreatingNew ? (
            /* Builder Form */
            <div className="bg-[#10251B] border border-[#263B2F] rounded-3xl p-6 sm:p-8 space-y-6 text-[#F8F1E5]">
              <div className="flex items-center justify-between pb-4 border-b border-[#263B2F]">
                <div>
                  <h3 className="text-xl font-bold font-serif text-[#F8F1E5]">New Trip Builder</h3>
                  <p className="text-xs text-[#B9B7AA]">Customize schedule, places, and budget</p>
                </div>
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-[#B9B7AA] hover:text-[#F8F1E5]"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#B9B7AA] mb-1">Trip Name</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl px-4 py-2.5 text-sm text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#B9B7AA] mb-1">Estimated Budget (₹ INR)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full bg-[#06110D] border border-[#263B2F] rounded-xl px-4 py-2.5 text-sm text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
                  />
                </div>
              </div>

              {/* Add Place Selector */}
              <div className="p-4 bg-[#0B1B14] rounded-2xl border border-[#263B2F] space-y-3">
                <p className="text-xs font-bold text-[#E8B65C] uppercase tracking-wider">
                  + Add Place to Daily Itinerary
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={targetDayIndex}
                    onChange={(e) => setTargetDayIndex(Number(e.target.value))}
                    className="bg-[#06110D] border border-[#263B2F] rounded-xl px-3 py-2 text-xs text-[#F8F1E5]"
                  >
                    {days.map((d, idx) => (
                      <option key={d.day_number} value={idx}>
                        Day {d.day_number}: {d.title}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedPlaceToAdd}
                    onChange={(e) => setSelectedPlaceToAdd(e.target.value)}
                    className="flex-1 bg-[#06110D] border border-[#263B2F] rounded-xl px-3 py-2 text-xs text-[#F8F1E5]"
                  >
                    <option value="">Select an attraction, fort, or culinary spot across India...</option>
                    {allPlaces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.destination_name || 'India'})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleAddPlaceToDay}
                    className="bg-gradient-to-r from-[#E8B65C] to-[#C4923C] text-[#06110D] px-4 py-2 rounded-xl text-xs font-bold shrink-0"
                  >
                    Add Place
                  </button>
                </div>
              </div>

              {/* Days List */}
              <div className="space-y-4">
                {days.map((day, dIdx) => (
                  <div
                    key={day.day_number}
                    className="p-5 rounded-2xl bg-[#0B1B14] border border-[#263B2F] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#E8B65C] text-[#06110D] font-bold text-xs flex items-center justify-center">
                          {day.day_number}
                        </span>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => {
                            const updated = [...days];
                            updated[dIdx].title = e.target.value;
                            setDays(updated);
                          }}
                          className="bg-transparent font-semibold text-[#F8F1E5] text-sm border-b border-transparent focus:border-[#E8B65C] focus:outline-none"
                        />
                      </div>
                      <span className="text-xs text-[#B9B7AA]">{day.items.length} activities</span>
                    </div>

                    {day.items.length === 0 ? (
                      <p className="text-xs text-[#B9B7AA] italic py-2">No activities added yet for Day {day.day_number}.</p>
                    ) : (
                      <div className="space-y-2">
                        {day.items.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            className="p-3 rounded-xl bg-[#06110D] border border-[#263B2F] flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-[#E8B65C]" />
                              <span className="font-semibold text-[#E8B65C]">{item.time_slot}</span>
                              <span className="text-[#B9B7AA]">•</span>
                              <span className="text-[#F8F1E5] font-medium">{item.place_name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[#B9B7AA]">₹{item.estimated_cost}</span>
                              <button
                                onClick={() => handleRemoveItem(dIdx, iIdx)}
                                className="text-[#B9B7AA] hover:text-red-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#263B2F]">
                <button
                  onClick={handleAddDay}
                  className="bg-[#0B1B14] hover:bg-[#263B2F] text-[#F8F1E5] text-xs font-semibold px-4 py-2.5 rounded-xl transition"
                >
                  + Add Another Day
                </button>

                <button
                  onClick={handleSaveTrip}
                  className="bg-gradient-to-r from-[#E8B65C] to-[#C4923C] hover:from-[#F4D18A] hover:to-[#E8B65C] text-[#06110D] font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg transition"
                >
                  Save Itinerary to Account
                </button>
              </div>
            </div>
          ) : (
            /* Trips View Mode */
            <div className="space-y-6">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-[#10251B] border border-[#263B2F] rounded-3xl p-6 sm:p-8 space-y-6 text-[#F8F1E5]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#263B2F]">
                    <div>
                      <span className="text-xs uppercase font-bold text-[#E8B65C] tracking-wider">
                        ✦ Active Itinerary
                      </span>
                      <h3 className="text-2xl font-serif font-bold text-[#F8F1E5] mt-0.5">{trip.title}</h3>
                      <p className="text-xs text-[#B9B7AA] mt-1">{trip.description}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[#B9B7AA]">Estimated Budget</span>
                      <p className="text-2xl font-bold text-[#E8B65C]">₹{trip.budget_estimate?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Day-by-day Itinerary */}
                  <div className="space-y-4">
                    {trip.itinerary_data?.map((day) => (
                      <div
                        key={day.day_number}
                        className="p-5 rounded-2xl bg-[#0B1B14] border border-[#263B2F] space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#E8B65C] text-[#06110D] font-bold text-xs flex items-center justify-center">
                            {day.day_number}
                          </span>
                          <h4 className="font-semibold text-[#F8F1E5] text-sm">{day.title}</h4>
                        </div>

                        <div className="space-y-2">
                          {day.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-[#06110D] border border-[#263B2F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#E8B65C]">{item.time_slot}</span>
                                  <span className="font-semibold text-[#F8F1E5]">{item.place_name}</span>
                                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-[#10251B] text-[#B9B7AA]">
                                    {item.category?.replace('_', ' ')}
                                  </span>
                                </div>
                                {item.notes && (
                                  <p className="text-[#B9B7AA] text-[11px]">{item.notes}</p>
                                )}
                              </div>
                              <span className="text-[#E8B65C] font-semibold shrink-0">
                                ₹{item.estimated_cost}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
