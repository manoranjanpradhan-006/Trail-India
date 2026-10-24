import React, { useState } from 'react';
import { api } from '../../services/api';
import { Plus, Trash2, Clock, Heart } from 'lucide-react';

export const TripPlannerSection = ({
  trips,
  favorites,
  allPlaces,
  user,
  onOpenAuth,
  onRefreshTrips,
  onSelectPlace,
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New Trip Builder State
  const [newTitle, setNewTitle] = useState('7-Day Incredible India Golden Circuit');
  const [newDesc, setNewDesc] = useState('An iconic journey across Rajasthan forts, Varanasi ghats, and Kerala lagoons.');
  const [newStartDate, setNewStartDate] = useState('2026-11-15');
  const [newEndDate, setNewEndDate] = useState('2026-11-22');
  const [newBudget, setNewBudget] = useState(15000);
  const [days, setDays] = useState([
    {
      day_number: 1,
      title: 'Jaipur Forts & Rajput Heritage',
      items: [
        {
          place_id: 'plc-jaipur-amber',
          place_name: 'Amber Fort & Palace',
          category: 'heritage',
          time_slot: '09:00 AM',
          estimated_cost: 500,
          notes: 'Ascend to the hilltop ramparts and explore Sheesh Mahal mirror mosaics',
        },
        {
          place_id: 'plc-food-jaipur-dalbaati',
          place_name: 'Rawat Misthan Bhandar & Chokhi Dhani',
          category: 'food_spot',
          time_slot: '01:00 PM',
          estimated_cost: 350,
          notes: 'Enjoy authentic Dal Baati Churma and crispy Pyaz Kachori',
        },
      ],
    },
    {
      day_number: 2,
      title: 'Sacred Kashi & Sunrise on the Ganga',
      items: [
        {
          place_id: 'plc-varanasi-ghats',
          place_name: 'Dashashwamedh Ghat & Evening Ganga Aarti',
          category: 'heritage',
          time_slot: '05:30 PM',
          estimated_cost: 300,
          notes: 'Witness the synchronized evening flame rituals from a wooden riverboat',
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
      estimated_cost: 200,
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
      alert('Trip itinerary saved successfully!');
      setIsCreatingNew(false);
      onRefreshTrips();
    } catch (e) {
      alert(e.message || 'Failed to save trip');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950/60 p-8 sm:p-12 rounded-3xl border border-stone-800 text-stone-100 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full inline-block">
            🗺️ Trip & Itinerary Architect
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
            Design Your Custom Odyssey Across India
          </h2>
          <p className="text-stone-300 text-sm leading-relaxed">
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
          className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-semibold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-orange-950/30 flex items-center gap-2 transition hover:scale-105 shrink-0"
        >
          <Plus className="w-5 h-5" />
          Create New Itinerary
        </button>
      </div>

      {/* Main Content Grid: Saved Favorites Drawer + Active Itinerary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Saved Places Bookmarks */}
        <div className="space-y-6">
          <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                Saved Favorites ({favorites.length})
              </h3>
            </div>
            <p className="text-xs text-stone-400">
              Quickly drag or add your favorite places directly into day plans.
            </p>

            {favorites.length === 0 ? (
              <div className="text-center py-8 text-stone-500 text-xs bg-stone-950/40 rounded-2xl border border-stone-800/80">
                You haven't saved any places yet. Click the heart icon on any destination card to bookmark it here!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    onClick={() => onSelectPlace(fav)}
                    className="p-3 bg-stone-800/40 hover:bg-stone-800 border border-stone-800 rounded-2xl flex items-center gap-3 cursor-pointer transition"
                  >
                    <img
                      src={fav.image_url}
                      alt={fav.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="truncate flex-1">
                      <p className="text-xs font-semibold text-stone-200 truncate">{fav.name}</p>
                      <p className="text-[10px] text-amber-400 uppercase tracking-wide">
                        {fav.category.replace('_', ' ')}
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
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 text-stone-100">
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div>
                  <h3 className="text-xl font-bold font-serif text-white">New Trip Builder</h3>
                  <p className="text-xs text-stone-400">Customize schedule, places, and budget</p>
                </div>
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Trip Name</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Estimated Budget (₹ INR)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Add Place Selector */}
              <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800 space-y-3">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  + Add Place to Daily Itinerary
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={targetDayIndex}
                    onChange={(e) => setTargetDayIndex(Number(e.target.value))}
                    className="bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200"
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
                    className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200"
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
                    className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shrink-0"
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
                    className="p-5 rounded-2xl bg-stone-800/30 border border-stone-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
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
                          className="bg-transparent font-semibold text-stone-100 text-sm border-b border-transparent focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <span className="text-xs text-stone-400">{day.items.length} activities</span>
                    </div>

                    {day.items.length === 0 ? (
                      <p className="text-xs text-stone-500 italic py-2">No activities added yet for Day {day.day_number}.</p>
                    ) : (
                      <div className="space-y-2">
                        {day.items.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span className="font-semibold text-stone-300">{item.time_slot}</span>
                              <span className="text-stone-400">•</span>
                              <span className="text-stone-100 font-medium">{item.place_name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-stone-400">₹{item.estimated_cost}</span>
                              <button
                                onClick={() => handleRemoveItem(dIdx, iIdx)}
                                className="text-stone-500 hover:text-red-400"
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

              <div className="flex items-center justify-between pt-4 border-t border-stone-800">
                <button
                  onClick={handleAddDay}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition"
                >
                  + Add Another Day
                </button>

                <button
                  onClick={handleSaveTrip}
                  className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-lg transition"
                >
                  Save Itinerary to Account
                </button>
              </div>
            </div>
          ) : (
            /* Trips View Mode */
            <div className="space-y-6">
              {trips.length === 0 ? (
                <div className="text-center py-12 bg-stone-900 rounded-3xl border border-stone-800 p-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-600/20 text-amber-400 text-3xl flex items-center justify-center mx-auto">
                    🗓️
                  </div>
                  <h3 className="text-xl font-bold font-serif text-white">No Trips Saved Yet</h3>
                  <p className="text-sm text-stone-400 max-w-md mx-auto">
                    Plan your upcoming journey across India! Create custom day schedules, time slots, and travel budgets.
                  </p>
                  <button
                    onClick={() => setIsCreatingNew(true)}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-6 py-3 rounded-xl transition shadow-lg"
                  >
                    Build My First Itinerary
                  </button>
                </div>
              ) : (
                trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 text-stone-100"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
                      <div>
                        <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                          Itinerary Preview
                        </span>
                        <h3 className="text-2xl font-serif font-bold text-white mt-0.5">{trip.title}</h3>
                        <p className="text-xs text-stone-400 mt-1">{trip.description}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-stone-400">Total Estimated Budget</span>
                        <p className="text-2xl font-bold text-amber-400">₹{trip.budget_estimate.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Day-by-day Itinerary */}
                    <div className="space-y-4">
                      {trip.itinerary_data.map((day) => (
                        <div
                          key={day.day_number}
                          className="p-5 rounded-2xl bg-stone-800/30 border border-stone-800/80 space-y-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                              {day.day_number}
                            </span>
                            <h4 className="font-semibold text-stone-200 text-sm">{day.title}</h4>
                          </div>

                          <div className="space-y-2">
                            {day.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-xl bg-stone-900/80 border border-stone-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-amber-400">{item.time_slot}</span>
                                    <span className="font-semibold text-stone-100">{item.place_name}</span>
                                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                                      {item.category.replace('_', ' ')}
                                    </span>
                                  </div>
                                  {item.notes && (
                                    <p className="text-stone-400 text-[11px]">{item.notes}</p>
                                  )}
                                </div>
                                <span className="text-stone-300 font-semibold shrink-0">
                                  ₹{item.estimated_cost}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
