import { TransportOption, TransportComparisonResult, Destination } from '../../types';

interface CityCoordinates {
  name: string;
  lat: number;
  lng: number;
  airportCode?: string;
  majorJunction?: string;
}

const MAJOR_ORIGINS: Record<string, CityCoordinates> = {
  'delhi': { name: 'New Delhi', lat: 28.6139, lng: 77.2090, airportCode: 'DEL', majorJunction: 'NDLS' },
  'mumbai': { name: 'Mumbai', lat: 19.0760, lng: 72.8777, airportCode: 'BOM', majorJunction: 'CSMT' },
  'bengaluru': { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, airportCode: 'BLR', majorJunction: 'SBC' },
  'bangalore': { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, airportCode: 'BLR', majorJunction: 'SBC' },
  'kolkata': { name: 'Kolkata', lat: 22.5726, lng: 88.3639, airportCode: 'CCU', majorJunction: 'HWH' },
  'chennai': { name: 'Chennai', lat: 13.0827, lng: 80.2707, airportCode: 'MAA', majorJunction: 'MAS' },
  'hyderabad': { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, airportCode: 'HYD', majorJunction: 'HYB' },
  'pune': { name: 'Pune', lat: 18.5204, lng: 73.8567, airportCode: 'PNQ', majorJunction: 'PUNE' },
  'ahmedabad': { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, airportCode: 'AMD', majorJunction: 'ADI' },
  'jaipur': { name: 'Jaipur', lat: 26.9124, lng: 75.7873, airportCode: 'JAI', majorJunction: 'JP' },
  'lucknow': { name: 'Lucknow', lat: 26.8467, lng: 80.9462, airportCode: 'LKO', majorJunction: 'LKO' },
  'chandigarh': { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, airportCode: 'IXC', majorJunction: 'CDG' }
};

// Calculate Haversine distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;
  // Road distance is roughly ~1.25x to 1.35x of straight aerial line in Indian terrain
  return Math.round(straightLine * 1.3);
}

export function compareTransportOptions(params: {
  sourceCity: string;
  destination: Destination;
  travellers: number;
  travelDate: string;
  userBudgetPreference?: 'low' | 'medium' | 'high';
  preferredTransport?: 'train' | 'flight' | 'bus' | 'car';
}): TransportComparisonResult {
  const { sourceCity, destination, travellers, travelDate, userBudgetPreference, preferredTransport } = params;
  
  const normalizedSource = sourceCity.toLowerCase().trim();
  const sourceOrigin = MAJOR_ORIGINS[normalizedSource] || {
    name: sourceCity,
    lat: 28.6139,
    lng: 77.2090,
    airportCode: 'DEL',
    majorJunction: 'NDLS'
  };

  const roadDistanceKm = Math.max(120, calculateDistance(sourceOrigin.lat, sourceOrigin.lng, destination.lat, destination.lng));
  
  // Fuel and car parameters (Standard SUV/Sedan in India)
  const fuelPricePerLitre = 98.5; // Average Petrol/Diesel ₹98.5/L
  const carMileage = travellers > 4 ? 12 : 15; // 12 km/l for SUV/Innova, 15 km/l for Sedan
  const rawFuelCost = Math.round((roadDistanceKm / carMileage) * fuelPricePerLitre);
  const tollEstimate = Math.round(roadDistanceKm * 1.4); // Average ₹1.4 per km on Indian NHAI Tollways
  const totalCarCost = rawFuelCost + tollEstimate;
  const carPerPerson = Math.round(totalCarCost / travellers);
  const carDriveHours = Math.round((roadDistanceKm / 60) * 10) / 10; // Average 60 km/h on Indian highways

  // Train calculations
  const trainDistance = Math.round(roadDistanceKm * 0.95);
  let trainAvgSpeed = 75; // km/h
  let trainFarePerPerson = 0;
  let trainName = 'Superfast Express';
  let trainNumber = '12301';

  if (roadDistanceKm < 500) {
    trainName = `Vande Bharat / Shatabdi Express (${sourceOrigin.majorJunction || 'NDLS'} → ${destination.name.toUpperCase().slice(0, 3)})`;
    trainNumber = '20607';
    trainFarePerPerson = 1250;
    trainAvgSpeed = 85;
  } else if (roadDistanceKm < 1200) {
    trainName = `Rajdhani / Superfast Express (${sourceOrigin.majorJunction || 'NDLS'} → Junction)`;
    trainNumber = '12952';
    trainFarePerPerson = 1850;
    trainAvgSpeed = 80;
  } else {
    trainName = `Garib Rath / Duronto Express`;
    trainNumber = '12213';
    trainFarePerPerson = 2150;
    trainAvgSpeed = 75;
  }

  const trainDurationHours = Math.round((trainDistance / trainAvgSpeed) * 10) / 10;
  const trainTotalCost = trainFarePerPerson * travellers;

  // Flight calculations
  const isFlightFeasible = roadDistanceKm > 350;
  const flightAirTime = isFlightFeasible ? Math.round((roadDistanceKm / 650) * 10) / 10 : 1.0;
  const flightTotalDurationHours = flightAirTime + 2.5; // Include 2h airport check-in + transit
  
  let flightBaseFare = 3400;
  if (roadDistanceKm > 1500) flightBaseFare = 6200;
  else if (roadDistanceKm > 900) flightBaseFare = 4800;
  else if (roadDistanceKm > 500) flightBaseFare = 3800;

  const flightPerPerson = isFlightFeasible ? flightBaseFare : flightBaseFare * 1.5;
  const flightTotalCost = flightPerPerson * travellers;

  // Bus calculations
  const busSpeed = 50; // km/h
  const busDurationHours = Math.round((roadDistanceKm / busSpeed) * 10) / 10;
  let busFarePerPerson = Math.max(650, Math.round(roadDistanceKm * 1.8));
  if (roadDistanceKm > 900) busFarePerPerson = Math.round(roadDistanceKm * 1.5);
  const busTotalCost = busFarePerPerson * travellers;

  // Build Options List
  const options: TransportOption[] = [
    {
      id: 'opt-train',
      mode: 'train',
      name: trainName,
      identifier: `Train #${trainNumber}`,
      departure: '06:15 AM',
      arrival: calculateArrivalTime('06:15 AM', trainDurationHours),
      durationHours: trainDurationHours,
      durationFormatted: formatDuration(trainDurationHours),
      totalCost: trainTotalCost,
      perPersonCost: trainFarePerPerson,
      availabilityStatus: 'Available',
      providerName: 'Indian Railways (IRCTC)',
      stops: roadDistanceKm > 1000 ? '4 stops' : '2 stops',
      distanceKm: trainDistance,
      details: 'Reserved 3rd AC / Chair Car with onboard catering and sleeper berths.'
    },
    {
      id: 'opt-flight',
      mode: 'flight',
      name: `IndiGo / Air India Direct (6E-${Math.floor(200 + Math.random() * 700)})`,
      identifier: `${sourceOrigin.airportCode || 'DEL'} ➔ ${destination.name.slice(0, 3).toUpperCase()}`,
      departure: '08:30 AM',
      arrival: calculateArrivalTime('08:30 AM', flightTotalDurationHours),
      durationHours: flightTotalDurationHours,
      durationFormatted: formatDuration(flightTotalDurationHours),
      totalCost: flightTotalCost,
      perPersonCost: flightPerPerson,
      availabilityStatus: 'Live Available',
      providerName: 'IndiGo Airlines / Amadeus',
      stops: roadDistanceKm > 1200 ? '1 Layover or Direct' : 'Non-stop Direct',
      distanceKm: Math.round(roadDistanceKm * 0.8),
      details: '7 kg cabin + 15 kg check-in baggage included. Fastest transit.'
    },
    {
      id: 'opt-bus',
      mode: 'bus',
      name: 'IntrCity SmartBus / Zingbus Multi-Axle Volvo AC',
      identifier: 'Volvo B11R AC Sleeper',
      departure: '08:00 PM',
      arrival: calculateArrivalTime('08:00 PM', busDurationHours),
      durationHours: busDurationHours,
      durationFormatted: formatDuration(busDurationHours),
      totalCost: busTotalCost,
      perPersonCost: busFarePerPerson,
      availabilityStatus: 'Few Seats Left',
      providerName: 'IntrCity / RedBus Partner',
      stops: '3 refreshment stops',
      distanceKm: roadDistanceKm,
      details: 'AC Sleeper berth with USB charging, clean blanket and water bottle.'
    },
    {
      id: 'opt-car',
      mode: 'car',
      name: travellers > 4 ? 'Self-Drive / Rental SUV (Innova Crysta)' : 'Private Sedan / Self-Drive (Dzire / Creta)',
      identifier: 'National Highway NH-44 / Expressway',
      departure: 'Flexible / 06:00 AM Recommended',
      arrival: calculateArrivalTime('06:00 AM', carDriveHours),
      durationHours: carDriveHours,
      durationFormatted: formatDuration(carDriveHours),
      totalCost: totalCarCost,
      perPersonCost: carPerPerson,
      availabilityStatus: 'On Demand',
      providerName: 'Highway Tollway & Fuel Direct',
      stops: 'Flexible roadside dhabas',
      distanceKm: roadDistanceKm,
      fuelEstimate: rawFuelCost,
      tollEstimate: tollEstimate,
      carMileageKmPerLitre: carMileage,
      details: `Door-to-door flexibility. Fuel ₹${rawFuelCost.toLocaleString('en-IN')} (${carMileage} km/l) + Fastag Toll ₹${tollEstimate.toLocaleString('en-IN')}.`
    }
  ];

  // Identify Cheapest & Fastest
  const cheapestOption = [...options].sort((a, b) => a.perPersonCost - b.perPersonCost)[0];
  const fastestOption = [...options].sort((a, b) => a.durationHours - b.durationHours)[0];

  // Mark flags
  options.forEach(opt => {
    if (opt.id === cheapestOption.id) opt.isCheapest = true;
    if (opt.id === fastestOption.id) opt.isFastest = true;
  });

  // Calculate Smart Recommendation Score
  // Formula: transportScore = costScore * 0.4 + timeScore * 0.3 + convenienceScore * 0.2 + preferenceScore * 0.1
  const maxCost = Math.max(...options.map(o => o.perPersonCost));
  const minCost = Math.min(...options.map(o => o.perPersonCost));
  const maxTime = Math.max(...options.map(o => o.durationHours));
  const minTime = Math.min(...options.map(o => o.durationHours));

  let bestOption = options[0];
  let highestScore = -1;
  let bestScoreBreakdown = { costScore: 0, timeScore: 0, convenienceScore: 0, preferenceScore: 0, totalScore: 0 };
  let recommendationReason = '';

  for (const opt of options) {
    // Inverse normalize cost (cheaper = higher score 10-100)
    const costScore = maxCost === minCost ? 80 : Math.round(100 - ((opt.perPersonCost - minCost) / (maxCost - minCost)) * 90);
    // Inverse normalize time (faster = higher score 10-100)
    const timeScore = maxTime === minTime ? 80 : Math.round(100 - ((opt.durationHours - minTime) / (maxTime - minTime)) * 90);
    
    // Convenience heuristics
    let convenienceScore = 70;
    if (opt.mode === 'car') {
      convenienceScore = travellers >= 3 && roadDistanceKm < 650 ? 95 : 65;
    } else if (opt.mode === 'train') {
      convenienceScore = roadDistanceKm < 900 ? 90 : 75;
    } else if (opt.mode === 'flight') {
      convenienceScore = roadDistanceKm > 700 ? 90 : 60;
    } else if (opt.mode === 'bus') {
      convenienceScore = roadDistanceKm < 450 ? 75 : 50;
    }

    // Preference heuristic
    let preferenceScore = 70;
    if (preferredTransport && opt.mode === preferredTransport) {
      preferenceScore = 100;
    } else if (userBudgetPreference === 'low' && opt.perPersonCost <= minCost * 1.2) {
      preferenceScore = 95;
    } else if (userBudgetPreference === 'high' && opt.mode === 'flight') {
      preferenceScore = 95;
    }

    const totalScore = Math.round(
      costScore * 0.4 +
      timeScore * 0.3 +
      convenienceScore * 0.2 +
      preferenceScore * 0.1
    );

    if (totalScore > highestScore) {
      highestScore = totalScore;
      bestOption = opt;
      bestScoreBreakdown = { costScore, timeScore, convenienceScore, preferenceScore, totalScore };
    }
  }

  bestOption.isRecommended = true;

  // Build natural language justification
  if (bestOption.mode === 'car' && travellers >= 3) {
    recommendationReason = `For your group of ${travellers} travellers, road travel is recommended because the total fuel & toll cost splits to just ₹${bestOption.perPersonCost.toLocaleString('en-IN')}/person while giving complete door-to-door flexibility for sightseeing.`;
  } else if (bestOption.mode === 'train') {
    recommendationReason = `Train travel offers the most comfortable and budget-friendly journey at ₹${bestOption.perPersonCost.toLocaleString('en-IN')}/person, with high reliability and panoramic scenic views.`;
  } else if (bestOption.mode === 'flight') {
    recommendationReason = `At ${bestOption.durationFormatted}, flight is the fastest mode, saving over ${Math.round(options.find(o => o.mode === 'train')?.durationHours || 12)} hours of transit time so you maximize your time at the destination.`;
  } else {
    recommendationReason = `Bus travel provides an economical overnight sleeper journey, allowing you to wake up directly at your destination without paying for a hotel night.`;
  }

  return {
    source: sourceOrigin.name,
    destination: destination.id,
    destinationName: destination.name,
    travellers,
    travelDate,
    distanceKm: roadDistanceKm,
    options,
    cheapestOption,
    fastestOption,
    recommendedOption: {
      option: bestOption,
      reason: recommendationReason,
      scoreBreakdown: bestScoreBreakdown
    }
  };
}

function formatDuration(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (minutes === 0) return `${wholeHours} hrs`;
  return `${wholeHours}h ${minutes}m`;
}

function calculateArrivalTime(depTime: string, durationHours: number): string {
  const [time, modifier] = depTime.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const totalMinutes = hours * 60 + minutes + Math.round(durationHours * 60);
  const arrHours24 = Math.floor((totalMinutes / 60) % 24);
  const arrMinutes = totalMinutes % 60;
  const isNextDay = Math.floor(totalMinutes / (24 * 60)) > 0;

  const arrModifier = arrHours24 >= 12 ? 'PM' : 'AM';
  let arrHours12 = arrHours24 % 12;
  if (arrHours12 === 0) arrHours12 = 12;

  const paddedMin = arrMinutes < 10 ? `0${arrMinutes}` : `${arrMinutes}`;
  return `${arrHours12}:${paddedMin} ${arrModifier}${isNextDay ? ' (+1 day)' : ''}`;
}
