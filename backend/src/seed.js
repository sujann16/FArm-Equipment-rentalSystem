const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Equipment = require('./models/Equipment');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Notification = require('./models/Notification');
const { getCoordinatesForPincode } = require('./utils/geocoder');

dotenv.config();

const seedData = async () => {
  try {
    const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/agrishare-ai';
    await mongoose.connect(connString);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Equipment.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    console.log('Existing DB collections cleared.');

    // 1. Create Users
    const farmer = await User.create({
      firstName: 'Ramesh',
      lastName: 'Kumar',
      email: 'farmer@agrishare.com',
      password: 'password123',
      role: 'Farmer',
      pinCode: '560001',
      phoneNumber: '+919876543210',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ramesh'
    });

    const owner = await User.create({
      firstName: 'Suresh',
      lastName: 'Gowda',
      email: 'owner@agrishare.com',
      password: 'password123',
      role: 'Owner',
      pinCode: '570001',
      phoneNumber: '+918765432109',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Suresh'
    });

    const admin = await User.create({
      firstName: 'AgriShare',
      lastName: 'Admin',
      email: 'admin@agrishare.com',
      password: 'password123',
      role: 'Admin',
      pinCode: '110001',
      phoneNumber: '+917654321098',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin'
    });

    console.log('Mock Users created.');

    // 2. Create Equipment
    const coords1 = await getCoordinatesForPincode('560001');
    const coords2 = await getCoordinatesForPincode('570001');
    const coords3 = await getCoordinatesForPincode('500001');
    const coords4 = await getCoordinatesForPincode('110001');

    const tractor = await Equipment.create({
      name: 'John Deere 5050D Utility Tractor',
      category: 'Tractor',
      images: [
        'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600',
        'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?q=80&w=600'
      ],
      description: 'Highly versatile 50 HP tractor suitable for heavy tillage, puddling, crop haulage, and cultivation. Low maintenance and fuel efficient.',
      hourlyPrice: 800,
      dailyPrice: 4500,
      owner: owner._id,
      location: {
        type: 'Point',
        coordinates: coords1,
        address: 'MG Road, Central Bangalore',
        pincode: '560001'
      },
      specifications: {
        manufacturer: 'John Deere',
        model: '5050D',
        year: 2022,
        horsepower: 50,
        condition: 'Excellent',
        width: '6.2 ft',
        weight: '1980 kg'
      }
    });

    const harvester = await Equipment.create({
      name: 'Preet 982 Combine Harvester',
      category: 'Harvester',
      images: [
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=600'
      ],
      description: 'Standard self-propelled combine harvester for multi-crop harvesting including paddy, wheat, and soybeans. High cutting capacity.',
      hourlyPrice: 1500,
      dailyPrice: 8500,
      owner: owner._id,
      location: {
        type: 'Point',
        coordinates: coords2,
        address: 'Nazarbad, Mysore',
        pincode: '570001'
      },
      specifications: {
        manufacturer: 'Preet Group',
        model: '982',
        year: 2021,
        horsepower: 110,
        condition: 'Good',
        width: '14 ft',
        weight: '7800 kg'
      }
    });

    const rotavator = await Equipment.create({
      name: 'Maschio Gaspardo Virat 185',
      category: 'Rotavator',
      images: [
        'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?q=80&w=600'
      ],
      description: 'Ideal rotary tiller for soil conditioning, weed incorporation, and mud preparation. Excellent for single-pass seedbeds.',
      hourlyPrice: 400,
      dailyPrice: 2200,
      owner: owner._id,
      location: {
        type: 'Point',
        coordinates: coords1,
        address: 'Whitefield, Bangalore',
        pincode: '560001'
      },
      specifications: {
        manufacturer: 'Maschio Gaspardo',
        model: 'Virat 185',
        year: 2023,
        horsepower: 45,
        condition: 'New',
        width: '6.1 ft',
        weight: '430 kg'
      }
    });

    const seeder = await Equipment.create({
      name: 'Landforce Zero Till Seed Drill',
      category: 'Seeder',
      images: [
        'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=600'
      ],
      description: 'Used for direct sowing of seeds and placing fertilizer simultaneously without land preparation, saving costs.',
      hourlyPrice: 350,
      dailyPrice: 1800,
      owner: owner._id,
      location: {
        type: 'Point',
        coordinates: coords3,
        address: 'Kondapur, Hyderabad',
        pincode: '500001'
      },
      specifications: {
        manufacturer: 'Landforce',
        model: 'ZT-9',
        year: 2022,
        horsepower: 40,
        condition: 'Good',
        width: '7.5 ft',
        weight: '320 kg'
      }
    });

    const sprayer = await Equipment.create({
      name: 'ASPEE Crop Protection Boom Sprayer',
      category: 'Sprayer',
      images: [
        'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=600'
      ],
      description: 'Tractor-mounted boom sprayer with 400 liters tank and 12m nozzle coverage. High speed crop disease management.',
      hourlyPrice: 200,
      dailyPrice: 1000,
      owner: owner._id,
      location: {
        type: 'Point',
        coordinates: coords4,
        address: 'Connaught Place, Delhi',
        pincode: '110001'
      },
      specifications: {
        manufacturer: 'ASPEE Group',
        model: 'Boom-400',
        year: 2020,
        horsepower: 35,
        condition: 'Fair',
        width: '39 ft',
        weight: '180 kg'
      }
    });

    console.log('Mock Equipment listings created.');

    // 3. Create Bookings
    const today = new Date();
    
    // Booking 1: Completed Booking (in the past)
    const prevStartDate = new Date(today);
    prevStartDate.setDate(today.getDate() - 10);
    const prevEndDate = new Date(today);
    prevEndDate.setDate(today.getDate() - 8);

    await Booking.create({
      equipment: tractor._id,
      renter: farmer._id,
      startDate: prevStartDate,
      endDate: prevEndDate,
      status: 'Completed',
      totalCost: 13500 // 3 days x 4500
    });

    // Booking 2: Confirmed Booking (ongoing/upcoming)
    const nextStartDate = new Date(today);
    nextStartDate.setDate(today.getDate() + 2);
    const nextEndDate = new Date(today);
    nextEndDate.setDate(today.getDate() + 4);

    await Booking.create({
      equipment: tractor._id,
      renter: farmer._id,
      startDate: nextStartDate,
      endDate: nextEndDate,
      status: 'Confirmed',
      totalCost: 13500
    });

    // Booking 3: Pending Booking (requests)
    const reqStartDate = new Date(today);
    reqStartDate.setDate(today.getDate() + 15);
    const reqEndDate = new Date(today);
    reqEndDate.setDate(today.getDate() + 16);

    await Booking.create({
      equipment: harvester._id,
      renter: farmer._id,
      startDate: reqStartDate,
      endDate: reqEndDate,
      status: 'Pending',
      totalCost: 17000 // 2 days x 8500
    });

    console.log('Mock Bookings created.');

    // 4. Create Reviews
    await Review.create({
      equipment: tractor._id,
      reviewer: farmer._id,
      rating: 5,
      comment: 'Excellent tractor, very clean and powerful. सुरेश (owner) was very helpful and delivered it right on time.'
    });

    console.log('Mock Reviews created.');

    await Equipment.findByIdAndUpdate(tractor._id, { averageRating: 5 });

    // 5. Create Notifications
    await Notification.create({
      user: farmer._id,
      message: 'Welcome to AgriShare AI! Start renting equipment or register as an owner.',
      type: 'system'
    });

    await Notification.create({
      user: owner._id,
      message: 'New booking request received for Preet 982 Combine Harvester.',
      type: 'booking_created'
    });

    console.log('Mock Notifications created.');
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
