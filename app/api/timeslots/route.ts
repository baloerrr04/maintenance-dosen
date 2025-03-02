// src/app/api/timeslots/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get('period');
    
    // Log the period to debug
    console.log('Fetching timeslots with period:', period);
    
    // Prepare the where clause based on period
    let whereClause = {};
    
    if (period) {
      // Handle case-insensitive period matching
      const normalizedPeriod = period.toUpperCase();
      
      if (['PAGI', 'SIANG', 'SORE'].includes(normalizedPeriod)) {
        whereClause = { period: normalizedPeriod };
      } else {
        // If period is invalid, log warning but continue with no filter
        console.warn(`Invalid period value: ${period}`);
      }
    }
    
    // Query the database with or without the period filter
    const timeSlots = await prisma.timeSlot.findMany({
      where: whereClause,
      orderBy: { start_time: 'asc' }
    });
    
    // Log the number of results for debugging
    console.log(`Found ${timeSlots.length} time slots`);
    
    // If no time slots were found, return an empty array rather than null
    return NextResponse.json(timeSlots || []);
  } catch (error: any) {
    // Log the full error for debugging
    console.error('Error fetching time slots:', error);
    
    // Return a proper error response
    return NextResponse.json(
      { error: 'Failed to fetch time slots', message: error.message },
      { status: 500 }
    );
  }
}

// Sample data to seed the database if needed
const defaultTimeSlots = [
  // Pagi (Morning) slots
  { start_time: '07:00', end_time: '07:50', display_text: '07.00-07.50', period: 'PAGI', day_specific: false },
  { start_time: '07:50', end_time: '08:40', display_text: '07.50-08.40', period: 'PAGI', day_specific: false },
  { start_time: '08:40', end_time: '09:30', display_text: '08.40-09.30', period: 'PAGI', day_specific: false },
  { start_time: '09:45', end_time: '10:35', display_text: '09.45-10.35', period: 'PAGI', day_specific: false },
  { start_time: '10:35', end_time: '11:25', display_text: '10.35-11.25', period: 'PAGI', day_specific: false },
  { start_time: '11:25', end_time: '12:15', display_text: '11.25-12.15', period: 'PAGI', day_specific: false },
  
  // Siang (Afternoon) slots
  { start_time: '12:50', end_time: '13:30', display_text: '12.50-13.30', period: 'SIANG', day_specific: false },
  { start_time: '13:30', end_time: '14:10', display_text: '13.30-14.10', period: 'SIANG', day_specific: false },
  { start_time: '14:10', end_time: '14:50', display_text: '14.10-14.50', period: 'SIANG', day_specific: false },
  { start_time: '15:05', end_time: '15:45', display_text: '15.05-15.45', period: 'SIANG', day_specific: false },
  { start_time: '15:45', end_time: '16:25', display_text: '15.45-16.25', period: 'SIANG', day_specific: false },
  { start_time: '16:25', end_time: '17:05', display_text: '16.25-17.05', period: 'SIANG', day_specific: false },
  
  // Sore (Evening) slots - Weekdays
  { start_time: '16:30', end_time: '19:10', display_text: '16.30-19.10', period: 'SORE', day_specific: false },
  { start_time: '19:10', end_time: '19:50', display_text: '19.10-19.50', period: 'SORE', day_specific: false },
  { start_time: '19:50', end_time: '20:30', display_text: '19.50-20.30', period: 'SORE', day_specific: false },
  { start_time: '20:30', end_time: '21:10', display_text: '20.30-21.10', period: 'SORE', day_specific: false },
  
  // Sore (Evening) slots - Saturday
  { start_time: '07:00', end_time: '07:40', display_text: '07.00-07.40', period: 'SORE', day_specific: true },
  { start_time: '07:40', end_time: '08:20', display_text: '07.40-08.20', period: 'SORE', day_specific: true },
  { start_time: '08:20', end_time: '09:00', display_text: '08.20-09.00', period: 'SORE', day_specific: true },
  { start_time: '09:30', end_time: '10:10', display_text: '09.30-10.10', period: 'SORE', day_specific: true },
  { start_time: '10:10', end_time: '10:50', display_text: '10.10-10.50', period: 'SORE', day_specific: true },
  { start_time: '10:50', end_time: '11:30', display_text: '10.50-11.30', period: 'SORE', day_specific: true },
];

// Endpoint to seed the database with default time slots
export async function POST(req: Request) {
  try {
    // Check if this is a seed request or a regular create request
    const body = await req.json();
    
    if (body.action === 'seed') {
      // Clear existing time slots if requested
      if (body.clear === true) {
        await prisma.timeSlot.deleteMany({});
      }
      
      // Insert default time slots
      const result = await prisma.timeSlot.createMany({
        data: defaultTimeSlots,
        skipDuplicates: true,
      });
      
      return NextResponse.json({ 
        message: `Seeded ${result.count} time slots successfully` 
      }, { status: 201 });
    } else {
      // Regular create request
      const { start_time, end_time, display_text, period, day_specific } = body;
      
      // Validate required fields
      if (!start_time || !end_time || !display_text || !period) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
      
      const newTimeSlot = await prisma.timeSlot.create({
        data: {
          start_time,
          end_time,
          display_text,
          period: period as any,
          day_specific: day_specific || false
        }
      });
      
      return NextResponse.json(newTimeSlot, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error in timeslots POST:', error);
    return NextResponse.json(
      { error: 'Failed to process timeslots request', message: error.message },
      { status: 500 }
    );
  }
}