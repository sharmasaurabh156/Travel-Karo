import { Destination, Attraction, Restaurant, Hotel, TripDay, TripActivity } from '../../types';
import { db } from '../db';

export function generateSmartItinerary(params: {
  destination: Destination;
  durationDays: number;
  startDate: string;
  selectedHotel?: Hotel;
  travellersCount: number;
}): TripDay[] {
  const { destination, durationDays, startDate, selectedHotel, travellersCount } = params;
  
  const allAttractions = db.getAttractions(destination.id);
  const allRestaurants = db.getRestaurants(destination.id);
  
  const days: TripDay[] = [];
  const baseDate = new Date(startDate || Date.now());

  // Distribute attractions across days
  let attrIndex = 0;
  let restIndex = 0;

  for (let dayNum = 1; dayNum <= durationDays; dayNum++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + (dayNum - 1));
    const dateStr = currentDate.toISOString().split('T')[0];

    const activities: TripActivity[] = [];

    if (dayNum === 1) {
      // Day 1: Arrival & Check-in
      activities.push({
        id: `act-${dayNum}-checkin`,
        time: '11:00 AM',
        placeName: selectedHotel ? `Check-in at ${selectedHotel.name}` : `Hotel Check-in & Freshen Up`,
        category: 'hotel',
        durationMinutes: 60,
        estimatedCost: 0,
        distanceKm: 0,
        notes: 'Arrive at destination, unpack, and get ready for the journey.',
        completed: false
      });

      // Lunch
      const rest = allRestaurants[restIndex % (allRestaurants.length || 1)];
      if (rest) {
        activities.push({
          id: `act-${dayNum}-lunch`,
          time: '01:00 PM',
          placeName: `Lunch at ${rest.name}`,
          category: 'restaurant',
          durationMinutes: 75,
          estimatedCost: rest.priceRange === '₹₹₹' ? 900 * travellersCount : rest.priceRange === '₹₹' ? 500 * travellersCount : 250 * travellersCount,
          distanceKm: rest.distanceKmFromCenter,
          notes: `Must try: ${rest.mustTryDishes.slice(0, 2).join(', ')}`,
          completed: false,
          restaurantId: rest.id,
          lat: rest.lat,
          lng: rest.lng
        });
        restIndex++;
      }

      // Afternoon / Sunset attraction
      const attr = allAttractions[attrIndex % (allAttractions.length || 1)];
      if (attr) {
        activities.push({
          id: `act-${dayNum}-attr1`,
          time: '04:00 PM',
          placeName: attr.name,
          category: 'attraction',
          durationMinutes: attr.recommendedTimeMinutes || 90,
          estimatedCost: (attr.entryFee || 0) * travellersCount,
          distanceKm: 3.5,
          notes: attr.description,
          completed: false,
          attractionId: attr.id,
          lat: attr.lat,
          lng: attr.lng
        });
        attrIndex++;
      }

      // Evening relaxation / Dinner
      const dinnerRest = allRestaurants[restIndex % (allRestaurants.length || 1)];
      activities.push({
        id: `act-${dayNum}-dinner`,
        time: '08:00 PM',
        placeName: dinnerRest ? `Dinner at ${dinnerRest.name}` : `Evening Dinner & Local Walk`,
        category: 'restaurant',
        durationMinutes: 90,
        estimatedCost: 400 * travellersCount,
        distanceKm: 2.0,
        notes: 'Enjoy authentic regional flavors and night ambiance.',
        completed: false
      });

    } else if (dayNum === durationDays) {
      // Last day: Final sightseeing, souvenirs & Departure
      const morningAttr = allAttractions[attrIndex % (allAttractions.length || 1)];
      if (morningAttr) {
        activities.push({
          id: `act-${dayNum}-morning-attr`,
          time: '09:00 AM',
          placeName: morningAttr.name,
          category: 'attraction',
          durationMinutes: morningAttr.recommendedTimeMinutes || 120,
          estimatedCost: (morningAttr.entryFee || 0) * travellersCount,
          distanceKm: 4.2,
          notes: morningAttr.description,
          completed: false,
          attractionId: morningAttr.id,
          lat: morningAttr.lat,
          lng: morningAttr.lng
        });
        attrIndex++;
      }

      // Souvenir and shopping
      activities.push({
        id: `act-${dayNum}-shopping`,
        time: '01:30 PM',
        placeName: 'Local Bazaar & Handicraft Shopping',
        category: 'custom',
        durationMinutes: 90,
        estimatedCost: 500 * travellersCount,
        distanceKm: 2.0,
        notes: 'Pick up local traditional souvenirs, spices, and tea/crafts.',
        completed: false
      });

      // Departure
      activities.push({
        id: `act-${dayNum}-departure`,
        time: '04:30 PM',
        placeName: 'Hotel Check-out & Journey Back',
        category: 'travel',
        durationMinutes: 60,
        estimatedCost: 0,
        distanceKm: 0,
        notes: 'Pack luggage, clear bill, and head to station/airport.',
        completed: false
      });

    } else {
      // Middle days: Morning Sightseeing + Lunch + Afternoon Attraction + Evening Culture
      const morningAttr = allAttractions[attrIndex % (allAttractions.length || 1)];
      if (morningAttr) {
        activities.push({
          id: `act-${dayNum}-morn`,
          time: '09:00 AM',
          placeName: morningAttr.name,
          category: 'attraction',
          durationMinutes: morningAttr.recommendedTimeMinutes || 120,
          estimatedCost: (morningAttr.entryFee || 0) * travellersCount,
          distanceKm: 5.0,
          notes: morningAttr.description,
          completed: false,
          attractionId: morningAttr.id,
          lat: morningAttr.lat,
          lng: morningAttr.lng
        });
        attrIndex++;
      }

      // Mid-day Lunch
      const lunchRest = allRestaurants[restIndex % (allRestaurants.length || 1)];
      if (lunchRest) {
        activities.push({
          id: `act-${dayNum}-lunch`,
          time: '01:00 PM',
          placeName: `Lunch at ${lunchRest.name}`,
          category: 'restaurant',
          durationMinutes: 75,
          estimatedCost: 450 * travellersCount,
          distanceKm: lunchRest.distanceKmFromCenter,
          notes: `Specialty: ${lunchRest.mustTryDishes.join(', ')}`,
          completed: false,
          restaurantId: lunchRest.id,
          lat: lunchRest.lat,
          lng: lunchRest.lng
        });
        restIndex++;
      }

      // Afternoon attraction
      const noonAttr = allAttractions[attrIndex % (allAttractions.length || 1)];
      if (noonAttr) {
        activities.push({
          id: `act-${dayNum}-noon`,
          time: '03:30 PM',
          placeName: noonAttr.name,
          category: 'attraction',
          durationMinutes: noonAttr.recommendedTimeMinutes || 90,
          estimatedCost: (noonAttr.entryFee || 0) * travellersCount,
          distanceKm: 4.8,
          notes: noonAttr.description,
          completed: false,
          attractionId: noonAttr.id,
          lat: noonAttr.lat,
          lng: noonAttr.lng
        });
        attrIndex++;
      }

      // Evening leisure
      activities.push({
        id: `act-${dayNum}-eve`,
        time: '07:30 PM',
        placeName: 'Sunset Point & Cultural Evening',
        category: 'custom',
        durationMinutes: 90,
        estimatedCost: 200 * travellersCount,
        distanceKm: 3.0,
        notes: 'Watch the scenic sunset and enjoy street snacks & musical vibes.',
        completed: false
      });
    }

    days.push({
      id: `day-${dayNum}`,
      dayNumber: dayNum,
      date: dateStr,
      title: dayNum === 1 ? 'Arrival & Key Landmarks' : dayNum === durationDays ? 'Final Discoveries & Departure' : `Exploring ${destination.name} Highlights`,
      activities
    });
  }

  return days;
}
